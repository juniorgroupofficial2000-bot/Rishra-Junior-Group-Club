# Security model — Rishra Junior Group Club

Application security review (2026-10-03). This document is the living threat model, control map, finding log, and production checklist.

**Security is not “secure because it compiles.”** Correct configuration, least privilege, and ongoing review are required.

---

## 1. Executive summary

| Severity | Count | Status |
| --- | --- | --- |
| CRITICAL | 0 | — |
| HIGH | 3 addressed / 1 open | CSV formula injection **fixed**; Auth.js brute-force path **fixed**; draft media IDOR **fixed**; **staff MFA still open** |
| MEDIUM | several | Documented; partial fixes (cookies, refunds, webhook errors, purpose authz) |

**Member privacy:** No classic cross-member IDOR was found. Member portal pages and actions use `requireMemberId()` (session + ACTIVE DB check). Clients never supply `memberId` / payment / mandate ids for private reads.

**Financial integrity:** Payment SUCCESS / mandate ACTIVE settle only after verified webhooks. Admin financial writes require `PAYMENTS_WRITE` / `MANDATES_WRITE`. Refund amounts are capped to the ledger payment.

---

## 2. Threat model

### Assets

| Asset | Sensitivity |
| --- | --- |
| Member PII (name, email, phone, address) | High |
| Payments, mandates, receipts | High |
| Admin RBAC / sessions | Critical |
| Webhook signing secrets / Razorpay keys | Critical |
| Draft media before publish | Medium–High |
| CSV / report exports | High (PII + spreadsheet injection) |
| Audit logs | Medium–High |

### Adversaries

1. Unauthenticated internet attacker (brute force, webhook forgery, probe APIs)
2. Authenticated member (IDOR / privilege escalation)
3. Low-privilege staff (mass assignment, unauthorized exports)
4. Compromised admin / insider
5. Malicious spreadsheet consumer (CSV formula injection)

### Priority abuse cases

- Member A reading Member B payments / receipts / mandate → **mitigated** (session-scoped loaders)
- Manipulated URL/API ids for private member data → **mitigated** (no client member ids on member routes)
- Unauthorized financial write / oversized refund → **mitigated** (RBAC + refund cap)
- Webhook forgery → **mitigated** (HMAC + idempotency; mock blocked in prod)
- Draft media fetch via leaked `/api/media/{id}` → **mitigated** (publish/slot gate)
- CSV formula injection on payment/mandate export → **mitigated** (`toCsvLine`)
- Staff password theft without MFA → **open HIGH**

---

## 3. Trust boundaries

```
[ Browser / public internet ]
          | HTTPS (required in production)
          v
[ Next.js proxy (`proxy.ts`) ]  — session gate for /member /admin /api/admin
          |
          +--> Public routes + /api/media (published/slotted READY only)
          +--> Auth.js credentials (/api/auth + loginAction) — rate limited
          +--> Member portal (session.memberId only)
          +--> Admin portal + /api/admin/* (RBAC)
          +--> /api/webhooks/payments/:provider (signature + idempotency)
          v
[ Services / Prisma / object storage / Razorpay ]
```

**Untrusted:** all HTTP input until validated; webhook bodies until signature verification; JWT claims until DB revalidation.

---

## 4. OWASP Top 10 mapping

| OWASP | Control in this app |
| --- | --- |
| A01 Broken Access Control | RBAC (`permissions.ts`); `requireMemberId`; proxy gates; admin API permission checks; media publish gate |
| A02 Cryptographic Failures | bcrypt passwords; HTTPS/`SITE_URL` assert; secure cookies when HTTPS; HMAC webhooks |
| A03 Injection | Prisma parameterized queries; Zod validation; CSV formula neutralization; no raw HTML CMS |
| A04 Insecure Design | Plan amount authoritative for dues; webhook-only SUCCESS; production fail-closed config |
| A05 Security Misconfiguration | Security headers; `poweredByHeader: false`; design-system blocked in prod |
| A06 Vulnerable Components | Lockfile; run `npm audit` in ops checklist |
| A07 Auth Failures | Rate limits on loginAction + Credentials `authorize`; generic errors; JWT revalidation |
| A08 Data Integrity | Webhook idempotency; audit log on admin/financial mutations |
| A09 Logging/Monitoring | Audit actions; payment logs without secrets; remaining gap: centralized SIEM |
| A10 SSRF | No user-controlled server-side fetch URLs for media; storage keys validated |

---

## 5. Control details

### Authentication & session

- Auth.js Credentials; bcrypt cost 12
- JWT: 8h max age; DB revalidation every 5 minutes
- Cookies: `httpOnly`, `sameSite=lax`, `secure` when `SITE_URL`/`AUTH_URL` is https
- Login rate limits: server action **and** Credentials `authorize` (IP + email)
- `callbackUrl` allowlisted via `safeInternalPath`
- Production: `AUTH_SECRET` ≥ 32 chars required

### Authorization / member privacy (IDOR)

- Member routes **never** take another member’s id from the URL/body for private data
- `requireMemberId()` binds session → ACTIVE member row (`userId` match)
- Repositories filter by that session `memberId`
- `assertMemberOwnsResource` available for any future client-supplied id paths
- Financial admin actions use `assertCanWritePayments` / `assertCanWriteMandates`
- User role changes require **SUPER_ADMIN** in service layer

### CSRF

- Server Actions + same-site session cookies; mutations not exposed as open CORS APIs

### XSS

- React text escaping; no untrusted `dangerouslySetInnerHTML` on public CMS surfaces
- CSP present but still allows `'unsafe-inline'` / `'unsafe-eval'` (Next.js constraint)

### SQL injection

- Prisma only; no string-concat SQL for user input

### File uploads

- Admin upload API: purpose RBAC, magic-byte MIME sniff, size limits, path-safe storage keys
- Public delivery: READY **and** (site `slotKey` **or** linked published content)
- Staff draft preview: `GET /api/admin/media/[id]` (authenticated)

### Rate limiting / brute force

- Login action + Auth.js authorize buckets (in-process)
- Webhooks: 120/min/IP
- Reports/exports: additional limits + audit
- **Ops:** add edge/WAF limits (process-local buckets reset per instance)

### Payment webhooks

- Configured provider path only
- HMAC verify (`timingSafeEqual`)
- Idempotent `(provider, providerEventId)`
- Amount mismatch → non-retryable reject; client gets generic error
- Mock provider blocked in production unless explicitly allowed

### Secrets & environment

- Secrets via env only (see `.env.example`)
- `assertProductionConfig()` fail-closed for prisma driver, HTTPS origin, payment provider
- Audit metadata sanitization redacts password/token-like keys

### CSV / sensitive exports

- All admin CSV builders use `toCsvLine` → `neutralizeCsvFormula`
- Report API: `Cache-Control: no-store`, permission-gated

### Security headers

`next.config.ts`: nosniff, DENY framing, referrer policy, Permissions-Policy, COOP, CSP, conditional HSTS

### Error responses

- Auth / public / webhook clients get generic errors
- Permanent webhook failures logged server-side; client sees `Webhook rejected.`
- Admin error UI may show `error.message` to authenticated staff (accepted residual)

---

## 6. Findings log (this review)

### Fixed (HIGH / important MEDIUM)

| ID | Issue | Fix |
| --- | --- | --- |
| H1 | Payment/mandate CSV skipped formula neutralization | `toCsvLine` via `buildAdminPaymentsCsv` / `buildAdminMandatesCsv` |
| H2 | Credentials `/api/auth` bypassed loginAction rate limits | Rate limit inside Credentials `authorize` |
| M1 | Draft READY media world-readable at `/api/media/{id}` | Publish/slot gate + admin GET preview |
| M2 | `MEDIA_WRITE` widened purpose uploads | Purpose-specific permission only |
| M3 | Session cookie flags implicit | Explicit `httpOnly` / `sameSite` / `secure` |
| M4 | Refund amount uncapped vs ledger | Cap `amountPaise` to payment amount |
| M5 | Webhook permanent failures leaked internal text | Generic client error + server log |

### Open

| ID | Severity | Issue | Follow-up |
| --- | --- | --- | --- |
| H3 | **HIGH** | No MFA / passkeys for SUPER_ADMIN, PRESIDENT, TREASURER | Block go-live of real money until MFA |
| M6 | Medium | In-process rate limits not cluster-wide | Edge WAF / Redis limiter |
| M7 | Medium | CSP `unsafe-inline` / `unsafe-eval` | Nonce CSP when feasible |
| M8 | Medium | JWT revoke lag ≤ 5 minutes | Accept or shorten / server sessions |
| M9 | Medium | Admin upload without Content-Length → memory pressure | Enforce streamed size limit |
| M10 | Medium | S3 `MEDIA_PUBLIC_BASE_URL` can bypass app gate if bucket is public | Keep bucket private; deliver via app/CDN signed URLs |

---

## 7. Member privacy checklist

- [x] No member dynamic route accepts foreign `memberId`
- [x] Payments / receipts / mandate loaders scoped to session member
- [x] Mandate setup/cancel uses session member only
- [x] Suspended / non-ACTIVE members fail `requireMemberId`
- [x] Public media does not expose unpublished drafts
- [ ] MFA for staff with financial privileges (open)
- [ ] Edge rate limits in production (ops)

---

## 8. Production checklist

### Before go-live

- [ ] Strong unique `AUTH_SECRET` (≥32 chars)
- [ ] `SITE_URL=https://…` (never invent domain in code)
- [ ] `REPOSITORY_DRIVER=prisma`; DB network restricted
- [ ] `PAYMENT_PROVIDER=razorpay` + live/test keys as intended
- [ ] `RAZORPAY_*` secrets set; webhook URL over TLS only
- [ ] `ALLOW_MOCK_PAYMENTS` unset/false
- [ ] Remove/disable seed demo users
- [ ] Edge rate limiting on `/login`, `/api/auth/*`, webhooks
- [ ] **MFA for financial admin roles**
- [ ] Private object storage (no world-readable draft prefixes)
- [ ] Backups + restore drill
- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Smoke: member isolation; forged webhook 401; draft media 404 publicly

### Ongoing

- [ ] Monitor auth failures, webhook 401s, audit log
- [ ] Dependency updates / `npm audit`
- [ ] Re-review on new uploads, APIs, or payment flows
- [ ] Periodic SUPER_ADMIN / treasurer access review

---

## 9. Tests

| Suite | Coverage |
| --- | --- |
| `tests/auth/*` | Permissions, authorize helpers, member isolation, admin financial authz |
| `tests/security/csv-safe.test.ts` | Formula neutralization |
| `tests/security/admin-export-csv.test.ts` | Payment/mandate export neutralization |
| `tests/security/media-upload.test.ts` | MIME / path / reject dangerous types |
| `tests/security/rate-limit.test.ts` | Bucket helper |
| `tests/security/safe-path.test.ts` | Open-redirect hardening |
| `tests/payments/webhook*.test.ts` | Signature, idempotency, amount mismatch |

Run: `npm test -- tests/auth tests/security tests/payments`

---

## 10. Reporting issues

Treat suspected vulnerabilities as confidential. Prefer private disclosure to club technical administrators. Do not test payment forgery or brute force against production without authorization.
