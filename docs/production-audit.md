# Production architecture audit — Rishra Junior Group Club

**Role:** Principal Solution Architect  
**Scope:** Full existing codebase (structure, authz, payments, data, ops)  
**UI redesign:** Out of scope  
**Related:** [`docs/security.md`](./security.md), [`docs/production-readiness.md`](./production-readiness.md)

**Verdict:** Coherent App Router architecture with fail-closed payment/repo guards, session-scoped member IDOR prevention, and webhook idempotency. **Not go-live ready** until production env is locked, public/admin content is unified (or explicitly operated as two systems), MFA exists for staff, and real notification providers replace console adapters.

---

## Architecture strengths

| Area | Assessment |
| --- | --- |
| Folder layout | Clear split: `app/` routes, `components/`, `content/` public CMS, `server/` domain/services, `prisma/`, `tests/` |
| Auth | Auth.js credentials + JWT; edge `proxy.ts` + server `requirePermission` / `requireMemberId` |
| Member IDOR | `requireMemberId()` uses session only; never client-supplied member ids |
| Payments | Provider adapter; mock blocked in prod; SUCCESS via verified webhooks; mandate amount from plan |
| RBAC | Permission matrix in `server/domain/permissions.ts`; admin pages/actions check it |
| Validation | Zod on login and many mutations |
| Audit | Sanitized metadata; sensitive member/admin actions logged |
| Security headers | CSP/HSTS/XFO etc. in `next.config.ts` |
| Tests | Vitest coverage for webhooks, reports CSV safety, rate-limit helpers |

---

## CRITICAL

| ID | Issue | Evidence | Impact | Status |
| --- | --- | --- | --- | --- |
| C1 | `SITE_URL` silently falls back to `http://localhost:3000` in production | `lib/seo/config.ts` `getSiteUrl()` | Canonicals, OG, sitemap, JSON-LD, Auth host trust can publish **wrong origin** | **Fixed** — fail-closed in production runtime |
| C2 | Production can boot without asserting core env together | Scattered checks; no single boot guard | Misconfigured deploy discovers failures mid-request (payments/auth) | **Fixed** — `assertProductionConfig()` on Prisma init |
| C3 | Demo seed / mock payments / mock repo in shared prod DB | Already fail-closed (`prisma/seed.ts`, `factory.ts`, `repositories/index.ts`) | Real money / PII integrity | **Mitigated** (verify config before go-live) |

---

## HIGH

| ID | Issue | Evidence | Impact | Status |
| --- | --- | --- | --- | --- |
| H1 | Admin CSV report export not audited | `app/api/admin/reports/[type]/route.ts` | Bulk PII export with no forensic trail | **Fixed** — audit + rate limit |
| H2 | Report API unbounded per session (expensive queries) | Same route; no `consumeRateLimit` | DoS / bulk scrape by compromised staff session | **Fixed** |
| H3 | Dual content sources (public `content/*` ≠ admin Prisma) | Public pages vs `app/(admin)/admin/*` | Ops publishes to admin; public site unchanged — **trust/content integrity** | **Remaining** — unification is a product program; documented; do not fake CMS sync |
| H4 | No MFA / passkeys for admin | Auth is password-only | Staff account takeover → full admin | **Remaining** — required before go-live |
| H5 | Notifications are console-only | `server/notifications/channels/console-channels.ts` | Members never receive real payment/mandate emails in prod (fail returns `ok: false`) | **Remaining** — wire real providers; fail-closed already |
| H6 | `next-auth` **beta** dependency | `package.json` `next-auth@5.0.0-beta.32` | API/security churn risk | **Remaining** — pin + upgrade plan; do not silently swap majors mid-launch |
| H7 | Missing `.env.example` / deploy contract | No env template in repo | Operators invent vars; prod misconfig | **Fixed** — added `.env.example` |
| H8 | In-process rate limits only | `server/security/rate-limit.ts` | Multi-instance / serverless resets counters; login/webhook abuse | **Remaining** — edge WAF / Redis limiter required at scale |
| H9 | `trustHost: true` without enforced `AUTH_URL` | `server/auth/auth.config.ts` | Host header issues behind reverse proxies if misdeployed | **Fixed** — production requires `SITE_URL` or `AUTH_URL` via config assert |

---

## MEDIUM

| ID | Issue | Evidence | Impact |
| --- | --- | --- | --- |
| M1 | CSP allows `'unsafe-inline'` / `'unsafe-eval'` | `next.config.ts` | XSS blast radius larger than ideal |
| M2 | JWT DB revalidation every 5 minutes | `server/auth/config.ts` `SESSION_REVALIDATE_MS` | Suspended member may keep access briefly |
| M3 | No Dockerfile / CI workflow in repo | Repo root | Deploy discipline not encoded |
| M4 | Privacy/terms pages are placeholders | `content/pages.ts`, public legal routes | Legal/compliance gap |
| M5 | Thin e2e / IDOR / Razorpay live-mode coverage | `tests/**` | Regressions possible |
| M6 | Public contact placeholders | `content/site.ts` | Broken contact UX if launched as-is |
| M7 | Audit log not append-only at DB | `AuditLog` model | Privileged DB user can alter history |
| M8 | `initiateMemberPayment` accepts caller `amountPaise` | `payment-service.ts` | Safe today (no public action); harden to plan-only if exposed |
| M9 | Large client surface for public motion | `components/motion/*`, home heroes | Perf/bundle; not a security issue |

---

## LOW

| ID | Issue | Notes |
| --- | --- | --- |
| L1 | Legacy role aliases (`ADMIN`, `COMMITTEE`) | Keep until migrated |
| L2 | Sample postal/address inconsistencies | Content hygiene |
| L3 | HSTS only when `SITE_URL` is https | Expected |
| L4 | Design-system route gated | Already redirected in prod |
| L5 | Duplicate motion/fade-in re-exports | Maintainability only |

---

## Folder & component architecture

```
app/                App Router (public, auth, member, admin, api)
components/         UI (public, committee, heritage, motion, ui, admin, member)
content/            Public site copy/media (file CMS) — NOT Prisma
server/             Auth, domain, payments, repositories, notifications, security
prisma/             Schema, migrations, seed (demo-gated)
tests/              Vitest
docs/               Security / readiness / this audit
```

**Server/client:** Server actions and `server/*` use `server-only` where required. Edge `proxy.ts` uses edge-safe auth config (no Prisma/bcrypt). Public motion is client-heavy by design.

**State:** No global client store; server session + Prisma; public content is static modules.

---

## Configuration contract (production)

See [`.env.example`](../.env.example). Minimum go-live:

| Variable | Required value |
| --- | --- |
| `AUTH_SECRET` | ≥32 char CSPRNG |
| `SITE_URL` | Real `https://` origin |
| `AUTH_URL` | Same origin (recommended) |
| `REPOSITORY_DRIVER` | `prisma` |
| `DATABASE_URL` | Managed Postgres |
| `PAYMENT_PROVIDER` | `razorpay` |
| `RAZORPAY_*` + webhook secret | Matching mode (`test` then `live`) |
| `CONTENT_INCLUDE_SAMPLE` | unset/false |
| `ALLOW_DEMO_SEED` / `ALLOW_MOCK_PAYMENTS` | unset/false |

---

## Fixes applied in this audit pass

1. **C1** — `getSiteUrl()` throws in production runtime when unset (build phase may still use localhost for CI with caution).
2. **C2 / H9** — `assertProductionConfig()` validates `DATABASE_URL`, `REPOSITORY_DRIVER=prisma`, `SITE_URL`/`AUTH_URL`, and payment provider expectations; invoked from Prisma bootstrap.
3. **H1 / H2** — Admin report downloads write audit events and apply per-user rate limits.
4. **H7** — `.env.example` documents the deploy contract.

**Not “fixed” by fake code:** H3 (CMS unification), H4 (MFA), H5 (real notify providers), H6 (Auth.js stable pin strategy), H8 (distributed rate limit).

---

## Go-live checklist (architecture)

- [ ] Production env matches contract; demo seed never run on prod DB  
- [ ] Razorpay test-mode end-to-end certified, then live keys rotated  
- [ ] Public content verified English copy; SAMPLE gated off  
- [ ] Decision: operate dual CMS consciously **or** migrate public reads to Prisma  
- [ ] Staff MFA  
- [ ] Email (and optionally SMS) providers for payment/mandate events  
- [ ] WAF / edge rate limits  
- [ ] Backups + restore drill  
- [ ] Legal privacy/terms  
- [ ] `lint` / `typecheck` / `test` / `build` green in CI with `SITE_URL` set  
