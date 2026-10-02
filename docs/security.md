# Security model — Rishra Junior Group Club

This document describes the threat model, trust boundaries, controls, remaining risks, and production checklist for the club platform.

**This application is not “secure because it compiles.”** Security depends on correct configuration, operational hygiene, and ongoing review. Controls below reduce risk; they do not eliminate it.

---

## 1. Threat model

### Assets

| Asset | Sensitivity | Notes |
| --- | --- | --- |
| Member PII (name, email, phone, address) | High | Admin + member portal |
| Payment / mandate / receipt records | High | Financial integrity + privacy |
| Admin capabilities (RBAC) | Critical | Privilege escalation target |
| Auth sessions (JWT cookies) | Critical | Impersonation if forged/stolen |
| Webhook signing secrets | Critical | Forged SUCCESS payments if leaked |
| Provider API keys (Razorpay) | Critical | Real-money impact |
| Audit logs | Medium–High | Integrity / forensics |
| CSV exports / reports | High | Bulk PII + spreadsheet injection surface |

### Adversaries

1. **Unauthenticated internet attacker** — brute force login, forge webhooks, probe admin APIs, inject via public forms.
2. **Authenticated member** — IDOR against another member’s payments/receipts/profile; escalate to admin.
3. **Low-privilege staff** — mass assignment, unauthorized reports, privilege escalation via role tampering.
4. **Compromised admin** — data exfiltration, destructive soft-deletes (insider / stolen session).
5. **Malicious spreadsheet consumer** — CSV formula injection from exported member fields.
6. **Payment provider / MITM** — webhook replay, signature bypass if secrets weak.

### Priority abuse cases

- Member A reading Member B payments / receipts / mandate
- Unauthorized admin report download
- Manipulated `memberId` in forms/query to pivot data
- Webhook forgery / replay marking payments SUCCESS
- Mock payment provider accepted in production with known secret
- Soft-deleted / suspended member retaining portal access via stale JWT
- Demo credentials shown on staging
- Malicious unrestricted file uploads (intentionally not exposed today)

---

## 2. Trust boundaries

```
[ Browser / public internet ]
          |
          | HTTPS (required in production)
          v
[ Next.js edge proxy (`proxy.ts`) ]  -- session cookie gate for /member /admin
          |
          +--> Public routes (no auth)
          +--> Auth.js credentials login (/api/auth, server actions)
          +--> Member portal (session.user.memberId only)
          +--> Admin portal + /api/admin/* (RBAC permissions)
          +--> /api/webhooks/payments/:provider (signature + idempotency)
          |
          v
[ Application services / repositories ]
          |
          +--> PostgreSQL (Prisma)
          +--> Payment provider (Razorpay or mock)
          +--> Notification channels (console today)
```

**Untrusted:** all HTTP input (query, body, headers, cookies, uploaded text), webhook payloads until signature verification succeeds, JWT claims until revalidated against the database.

**Trusted after verification:** Auth.js session bound to `user.id`, RBAC permission checks, Prisma parameterized queries, verified webhook events with unique `(provider, providerEventId)`.

---

## 3. Protected resources

| Resource | Who may access | Enforcement |
| --- | --- | --- |
| `/member/*` pages & actions | Roles with member portal access + linked ACTIVE member | `proxy.ts`, `requireMemberSession`, `requireMemberId` (session memberId only; DB ACTIVE check) |
| Payments / receipts / mandate | Owning member (session memberId) | Repository queries scoped by session memberId; never from client-supplied ids |
| `/admin/*` | Roles with `ADMIN_ACCESS` + permission | `proxy.ts`, `requirePermission` / `hasPermission` |
| `/api/admin/reports/[type]` | `REPORTS_VIEW` | Session + permission; 401/403 JSON |
| `/api/webhooks/payments/[provider]` | Payment provider with valid HMAC | Configured provider path only; signature verify; idempotent store |
| Member CSV import | Admin write paths (text only) | No multipart upload endpoint; Zod validation; size limits |
| Soft-deleted members | Admin with includeDeleted where allowed | Default queries exclude `deletedAt` |

---

## 4. Security controls

### Authentication & session

- Auth.js Credentials provider; passwords hashed with bcrypt (cost 12).
- JWT session: 8h max age, 30m update age.
- `AUTH_SECRET` required in production (≥32 chars); no production fallback to a known default.
- Login failures return a generic message (no user enumeration via distinct errors).
- In-process rate limits on login (per IP and per email).
- Post-login `callbackUrl` restricted via `safeInternalPath` (blocks `//`, schemes, non-portal paths).
- JWT revalidation against DB every 5 minutes (active flag, role, memberId, member status for `MEMBER`).
- Soft-delete / suspend / inactive member status deactivates linked `User.active`.

### Authorization / RBAC

- Central permission map in `server/domain/permissions.ts`.
- Edge proxy blocks unauthenticated `/member` and `/admin`.
- Layouts, pages, server actions, and admin APIs re-check permissions server-side.
- Member data access uses **session `memberId` only** (`requireMemberId`) — not request parameters.

### CSRF

- Server Actions and Auth.js cookie sessions rely on same-site cookies + Next.js action origin checks.
- Mutations are not exposed as open CORS JSON APIs.

### XSS

- React escapes text by default.
- No `dangerouslySetInnerHTML` on untrusted CMS HTML in current surfaces.
- CSP headers shipped (still allows `'unsafe-inline'` / `'unsafe-eval'` for Next.js — see remaining risks).

### SQL injection

- Prisma parameterized queries only; no raw string-concat SQL for user input.

### Input validation

- Zod schemas for login, member create/update/status, CSV rows.
- Mandate amount bounded (100–10_000_000 paise).
- Webhook body size capped (256 KB).

### File / image uploads

- **No general file-upload API is exposed.**
- Admin documents UI states unrestricted uploads are disabled until a signed, typed pipeline exists.
- Gallery uses controlled/static media paths with `next/image`.
- CSV import accepts **in-memory UTF-8 text** only (not multipart arbitrary files).

### Webhooks & payments

- Signature verification (HMAC-SHA256) with `timingSafeEqual`.
- Idempotency via unique `(provider, providerEventId)`.
- Payment/mandate SUCCESS/ACTIVE applied only after verified webhook processing.
- **No silent Razorpay → mock fallback.**
- Mock provider blocked in production unless `ALLOW_MOCK_PAYMENTS=true`.
- Webhook route accepts **only** the configured provider path (no always-on `/mock` bypass).
- Webhook route rate-limited per client IP.
- Failed processing does not return raw internal errors to clients.

### Secrets & environment

- Secrets only via environment variables (see `.env.example`).
- Audit metadata sanitized (`server/audit/sanitize.ts`) to redact password/token/PAN/CVV-like keys.
- Payment logs avoid credential fields; prefer ids/refs.
- Demo credentials on login UI only when `REPOSITORY_DRIVER=mock`.

### CSV / reports

- Exports neutralize formula injection (`=`, `+`, `-`, `@`, tab, CR) via leading `'`.
- Report API: `Cache-Control: no-store`, permission-gated.

### HTTP security headers

Set in `next.config.ts` for all routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo/payment disabled)
- `Cross-Origin-Opener-Policy: same-origin`
- `Content-Security-Policy` (baseline)
- `Strict-Transport-Security` when `SITE_URL` is `https://`
- `poweredByHeader: false`

### Logging & errors

- Generic auth and webhook client errors.
- Audit trail for admin member mutations and payment mandate lifecycle.
- Do not log password hashes, raw card data, or webhook secrets.

---

## 5. Remaining risks

| Risk | Severity | Mitigation / follow-up |
| --- | --- | --- |
| In-process rate limits reset on deploy and are not cluster-wide | Medium | Put WAF / reverse-proxy limits (e.g. Cloudflare, nginx) in front of `/login` and webhooks |
| CSP still allows `'unsafe-inline'` and `'unsafe-eval'` | Medium | Introduce nonce-based CSP when App Router tooling allows |
| JWT may remain valid up to ~5 minutes after revoke/suspend | Medium | Acceptable tradeoff today; shorten window or use server sessions if needed |
| Staff with linked member: status change toggles `User.active` | Medium | Operational discipline; consider separating portal login flags from membership status |
| Credentials provider has no MFA / phishing resistance | High (prod) | Add MFA / passkeys before broad production use |
| No account lockout beyond soft rate limit | Medium | Add durable lockout + alerting |
| Mock payments if `ALLOW_MOCK_PAYMENTS=true` in prod | High | Never enable against real members / real money |
| Console notification channel may print PII in logs | Medium | Replace with provider adapters; scrub logs |
| No virus scanning / typed blob store for future uploads | High (when enabled) | Design signed uploads, MIME sniffing, size limits, malware scan before enabling |
| Dependency / supply-chain risk | Medium | Regular `npm audit`, lockfile commits, minimal deps |
| Insider admin abuse | High | Least privilege RBAC, audit review, break-glass SUPER_ADMIN |
| Hosting misconfig (HTTP, open DB, leaked `.env`) | Critical | Follow production checklist |

---

## 6. Production checklist

### Before go-live

- [ ] Set strong unique `AUTH_SECRET` (≥32 chars, from a CSPRNG).
- [ ] Set real `SITE_URL` to the HTTPS origin (do not invent/guess a domain in code).
- [ ] `REPOSITORY_DRIVER=prisma` with managed Postgres; restrict network to the app.
- [ ] `PAYMENT_PROVIDER=razorpay` with live/test keys as intended; **never** rely on mock for real dues.
- [ ] Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Configure Razorpay webhook URL to `/api/webhooks/payments/razorpay` only over TLS.
- [ ] Ensure `ALLOW_MOCK_PAYMENTS` is **unset/false**.
- [ ] Rotate/remove seed demo users (`member@rjgc.local`, `admin@rjgc.local`) or disable them.
- [ ] Confirm login page does **not** show demo credentials (`REPOSITORY_DRIVER` must not be `mock`).
- [ ] Disable public indexing of `/login`, `/admin`, `/member` (robots already disallows admin/member/login).
- [ ] Enable platform HTTPS + HSTS at the edge; verify `SITE_URL` starts with `https://`.
- [ ] Configure edge rate limiting / bot protection for `/login` and webhooks.
- [ ] Backups + restore drill for Postgres.
- [ ] Secret storage via host secret manager (not plaintext in git).
- [ ] Review RBAC assignments for least privilege.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`.
- [ ] Smoke-test: member cannot access another member’s receipts; suspended member loses access; forged webhook returns 401.

### Ongoing

- [ ] Monitor auth failures, webhook 401s, and admin audit logs.
- [ ] Patch dependencies regularly.
- [ ] Re-review this document when adding uploads, new APIs, or payment features.
- [ ] Periodic access review for `SUPER_ADMIN` / treasurer roles.

---

## 7. Recent hardening (audit fixes)

Implemented during the security audit:

1. Fail closed on missing/invalid Razorpay config (no silent mock fallback).
2. Production block for mock payments unless explicitly allowed.
3. Remove known default mock webhook secret in production; ephemeral secret in local/dev when unset.
4. Webhook route accepts only the configured provider (no `/mock` bypass).
5. `AUTH_SECRET` production enforcement.
6. Soft-delete / non-ACTIVE member status deactivates linked users.
7. JWT periodic DB revalidation; member portal re-checks ACTIVE member rows.
8. CSV formula neutralization on export.
9. Demo credentials gated to mock repository driver only.
10. Hardened post-login redirect allowlist.
11. Login + webhook rate limiting (in-process).
12. HTTP security headers + conditional HSTS.
13. Admin reports API returns 401/403 JSON (no redirect-based auth for APIs).
14. Mandate amount bounds; webhook payload size limit; timing-safe mock signature compare.

---

## 8. Reporting issues

Treat suspected vulnerabilities as confidential. Prefer private disclosure to club technical administrators. Do not test payment forgery or brute force against production without authorization.
