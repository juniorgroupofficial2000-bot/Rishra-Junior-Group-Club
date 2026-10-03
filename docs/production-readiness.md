# Production readiness — Principal Architect review

**Review date:** 3 October 2026  
**Application:** Rishra Junior Group Club (Next.js App Router + Prisma + Auth.js + Razorpay)

Related: [`README.md`](../README.md), [`security.md`](./security.md), [`payment-architecture.md`](./payment-architecture.md), [`database.md`](./database.md), [`observability.md`](./observability.md), [`testing.md`](./testing.md).

---

## 1. Production readiness status

### Verdict: **CONDITIONAL — not approved for unattended live money**

| Surface | Status |
| --- | --- |
| Public English website (HTTPS + real `SITE_URL`) | **Ready** after env + verified CMS content + contact env vars |
| Member portal (non-payment browsing) | **Ready** with prisma driver + migrations |
| Admin portal (content/media/RBAC) | **Ready** with staff MFA enrolled when `REQUIRE_STAFF_MFA=true` |
| Razorpay **test** mode | **Ready** after provider certification checklist |
| Razorpay **live** dues / mandates | **Not approved** until post-deploy checklist below is fully green (MFA enrolled for all financial staff, Resend live, reconcile cron, backups proven, counsel sign-off on policies) |

Compiling successfully is **not** a go-live criterion.

---

## 2. Severity findings

### BLOCKER (resolved in this pass)

| ID | Issue | Resolution |
| --- | --- | --- |
| B1 | README was create-next-app boilerplate | Replaced with deploy/runbook README |
| B2 | No staff MFA while collecting dues | TOTP MFA implemented; `PAYMENT_MODE=live` requires `REQUIRE_STAFF_MFA=true`; admin forced enrollment via proxy |

### CRITICAL (resolved in this pass)

| ID | Issue | Resolution |
| --- | --- | --- |
| C1 | Privacy/terms were non-operative placeholders | Operative English privacy & terms pages published |
| C2 | Payment emails console-only in production | Resend email channel; live mode requires Resend config |
| C3 | Unsafe prod flags (`E2E_TEST`, `ALLOW_DEMO_SEED`) not rejected | `assertProductionConfig()` rejects them; also runs from `instrumentation.register()` |
| C4 | Demo admin bootstrap undocumented / risky | Documented; seed blocked; never reuse demo emails on prod DB |
| C5 | Stale PENDING payments with no scheduled reconcile | `POST /api/cron/reconcile-payments` + `CRON_SECRET` |

### HIGH (remaining — schedule before or immediately after soft launch)

| ID | Issue | Owner action |
| --- | --- | --- |
| H1 | In-process rate limits only | Put WAF / edge rate limits on `/login`, `/api/auth/*`, webhooks |
| H2 | Auth.js still `5.0.0-beta.x` | Pin upgrades; watch advisories |
| H3 | Public CMS empty until seeded | Seed verified CMS content before marketing launch |
| H4 | Contact still env-driven placeholders until set | Set `CONTACT_PUBLIC_*` |
| H5 | CSP allows `'unsafe-inline'` / `'unsafe-eval'` | Move to nonce/hash CSP when CMS HTML expands |
| H6 | Distributed tracing / SIEM not wired | Ship logs to your host aggregator (see observability.md) |
| H7 | Playwright coverage thin for Razorpay | Complete Razorpay test-mode certification manually |

### MEDIUM / LOW (selected)

| ID | Sev | Issue |
| --- | --- | --- |
| M1 | MEDIUM | JWT revalidation window ~5 minutes |
| M2 | MEDIUM | No managed backup restore drill documented per host |
| L1 | LOW | English-only product — **Bengali typography intentionally omitted** per project rules |
| L2 | LOW | Per-page `loading.tsx` not universal (segment loaders exist) |

---

## 3. Area review summary

### Architecture
Clean boundaries: `app/` UI + actions, `server/` domain/services/auth/payments/media, `prisma/` persistence, `content/` file fallback. Dual mock/prisma and mock/razorpay drivers fail closed in production. Maintainable; scale vertically first, then split workers for reconcile/media.

### Security
Auth.js credentials + JWT; RBAC permissions; member isolation via `requireMemberId`; webhook HMAC; CSV neutralization; media purpose authz; production config assert; staff TOTP MFA. Residual: edge rate limits, Auth.js beta, CSP.

### Database
Migrations present including financial integrity CHECKs/triggers and staff MFA columns. Use `prisma migrate deploy` only in prod. Soft deletes + audit append-only at DB. Backups: host-level (required).

### Payments
Mandate amount from plan; webhook verify + idempotency; amount mismatch non-retryable; reconcile cron endpoint; live mode gated on MFA + email.

### UX / UI
Responsive record cards for admin/member lists; portal nav drawers; error boundaries; empty records; English typography (Playfair + Plus Jakarta). Motion gated on mobile. Committee/gallery use responsive grids. **No Bengali UI fonts** (intentional).

### SEO
Metadata, canonical, OG, sitemap, robots, JSON-LD — require correct HTTPS `SITE_URL`.

### Performance
`next/font`, hero LCP image, deferred motion chrome, `next/image`. Monitor CWV after real photography replaces SVG placeholders.

### Testing
Vitest unit/integration/security; Playwright auth portals; new TOTP + production-config tests; CI workflow added.

### Observability
Structured JSON logs, redaction, `onRequestError`, admin_operation from audit. Wire host log drain + alerts per `docs/observability.md`.

### Deployment
Env contract in `.env.example`; migrate deploy script; HTTPS domain; cron; no seed on prod.

### Documentation
README + docs suite updated; this file is the go-live source of truth.

---

## 4. Required environment variables

### Always (production)

| Variable | Notes |
| --- | --- |
| `SITE_URL` | Public HTTPS origin |
| `AUTH_URL` | Usually same as `SITE_URL` |
| `AUTH_SECRET` | ≥32 char CSPRNG |
| `DATABASE_URL` | Postgres connection string |
| `REPOSITORY_DRIVER` | Must be `prisma` |

### Payments (Razorpay)

| Variable | Notes |
| --- | --- |
| `PAYMENT_PROVIDER` | `razorpay` |
| `PAYMENT_MODE` | `test` or `live` |
| `RAZORPAY_KEY_ID` | `rzp_test_*` / `rzp_live_*` matching mode |
| `RAZORPAY_KEY_SECRET` | Server only |
| `RAZORPAY_WEBHOOK_SECRET` | Server only |

### Live money additional

| Variable | Notes |
| --- | --- |
| `REQUIRE_STAFF_MFA` | Must be `true` for `PAYMENT_MODE=live` |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | Server only |
| `EMAIL_FROM` | Verified sender |
| `CRON_SECRET` | Bearer token for reconcile cron |

### Recommended

| Variable | Notes |
| --- | --- |
| `CONTACT_PUBLIC_EMAIL` / `PHONE` / `HOURS` | Public contact |
| `MEDIA_STORAGE_DRIVER` | `s3` in multi-instance prod |
| `MEDIA_S3_*` | When driver is `s3` |

### Forbidden on production DB

`E2E_TEST=1`, `ALLOW_DEMO_SEED=true`, unpaired mock payment flags, weak `AUTH_SECRET`.

---

## 5. Required external accounts

1. **Hosting** for Node.js (or container) with HTTPS termination  
2. **Managed PostgreSQL** with automated backups  
3. **Razorpay** merchant account (test + live keys)  
4. **DNS** for the Club domain  
5. **Resend** (or equivalent later) for transactional email  
6. **Object storage** (S3/R2) when not using single-node local media  
7. **Log aggregation** (host native, Datadog, etc.)

---

## 6. Required payment-provider configuration

1. Create Razorpay webhook for `payment.*` / mandate events →  
   `https://<domain>/api/webhooks/payments/razorpay`
2. Use webhook secret = `RAZORPAY_WEBHOOK_SECRET`
3. Keep test and live keyspaces separate (`PAYMENT_MODE` must match key prefix)
4. Prefer hosted checkout / `short_url` flows already integrated
5. Certify in **test mode**: success, failure, duplicate delivery, amount mismatch, mandate cancel
6. Only then switch `PAYMENT_MODE=live` with `rzp_live_*` keys

---

## 7. Required database configuration

1. PostgreSQL 14+ recommended  
2. Apply migrations: `npm run db:migrate:deploy`  
3. **Never** `db:seed` on production  
4. Create the first SUPER_ADMIN out-of-band (SQL/`bcrypt` hash) — do not use `admin@rjgc.local`  
5. Enable PITR / daily backups; test restore quarterly  
6. Restrict DB network to app + admin break-glass only  

---

## 8. Deployment steps

1. Set all production env vars on the host (from §4).  
2. `npm ci`  
3. `npm run db:migrate:deploy`  
4. `npx prisma generate`  
5. `npm run build`  
6. Start process (`npm start` / systemd / container).  
7. Attach custom domain + TLS.  
8. Configure Razorpay webhook + Resend domain.  
9. Schedule reconcile cron (every 15–60 minutes):  
   `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/reconcile-payments`  
10. Enroll MFA for every staff user under **Admin → Settings**.  
11. Publish verified CMS content; set `CONTACT_PUBLIC_*`.  
12. Confirm privacy/terms URLs are linked in the footer.

---

## 9. Post-deployment verification checklist

- [ ] `https://<domain>` loads; no mixed content  
- [ ] `/robots.txt` and `/sitemap.xml` use the production host  
- [ ] `/privacy` and `/terms` show operative English policies  
- [ ] Member login works; member cannot open `/admin`  
- [ ] Staff login with MFA code works; wrong TOTP fails  
- [ ] With `REQUIRE_STAFF_MFA=true`, staff without MFA are forced to Settings  
- [ ] Razorpay **test** payment + webhook marks SUCCESS once (idempotent on replay)  
- [ ] Forged webhook signature → 401  
- [ ] Reconcile cron returns 200 with valid bearer token; 401 without  
- [ ] Admin export CSV does not execute formula injection  
- [ ] Application logs are JSON; no passwords/tokens in samples  
- [ ] Database backup restore drill completed  
- [ ] `ALLOW_DEMO_SEED` / `E2E_TEST` / mock payment dual flags unset  
- [ ] Only after all above: consider `PAYMENT_MODE=live`

---

## 10. Explicit non-claims

- This review does **not** replace legal counsel for privacy/terms in your jurisdiction.  
- This review does **not** certify Razorpay live settlement readiness without your test-mode certification.  
- Bengali typography is **out of scope** (English-only product rule).  
- PWA / service workers were evaluated and **not** added (no clear offline/payment value vs complexity).
