# Production readiness — Rishra Junior Group Club

Principal Architect handoff review for operating this platform as a real organization.

**This document does not certify the system as production-safe by default.** Shipping requires the configuration, legal, and operational work listed below. Compiling successfully is not a go-live criterion.

Related: [`docs/security.md`](./security.md), [`docs/design-system.md`](./design-system.md).

---

## Executive verdict

The platform has a coherent Next.js App Router architecture with Auth.js sessions, Prisma persistence, RBAC admin surfaces, payment provider abstraction, webhook idempotency, SEO metadata, and accessibility foundations.

It is **not yet ready for unattended production with real member money and PII** until:

1. Production env fail-closed settings are applied (`REPOSITORY_DRIVER=prisma`, `PAYMENT_PROVIDER=razorpay`, strong `AUTH_SECRET`, real `SITE_URL`).
2. Demo seed accounts are absent or rotated.
3. SAMPLE public content is replaced with verified club content (or kept disabled via `CONTENT_INCLUDE_SAMPLE` default off in production).
4. Public CMS is unified with admin (today: public site reads `content/*`, admin reads Prisma).
5. Real notification providers, MFA for staff, backups, edge rate limits, and legal privacy/terms are in place.

---

## Completed capabilities

| Area | Status |
| --- | --- |
| Public English website (heritage, events, gallery, membership, contact) | Done (content-driven) |
| SEO Metadata API, canonical, OG/Twitter, sitemap, robots, JSON-LD | Done |
| Auth.js credentials login + JWT sessions | Done |
| Member portal (profile, membership, payments, receipts, mandate, events) | Done |
| Admin portal with RBAC permissions | Done |
| Prisma/Postgres schema + migrations + seed (demo-only) | Done |
| PaymentProvider (mock + Razorpay) with webhook verify + idempotency | Done |
| Mandate amount from membership plan (not client-chosen) | Done |
| Order vs payment id linkage (`providerOrderRef`) | Done |
| Audit log + metadata sanitization | Done |
| CSV reports with formula neutralization | Done |
| HTTP security headers + conditional HSTS | Done |
| Production fail-closed: mock repo, mock payments, demo seed, console notify | Done |
| Accessibility: skip link, focus, semantic nav, reduced motion | Partial–good |
| Automated tests (payments webhooks, reports, security helpers) | Partial |

---

## Severity findings (review snapshot)

### CRITICAL (fixed in this pass or fail-closed)

| Issue | Resolution |
| --- | --- |
| `REPOSITORY_DRIVER` defaulted to mock | Production requires `prisma` or throws |
| Known demo seed accounts in shared DBs | Seed blocked in production unless `ALLOW_DEMO_SEED=true` |
| Razorpay order id stored as payment id | Added `providerOrderRef`; webhooks map `order_id` → payment |
| Members chose mandate amounts | Amount taken from current membership plan only |
| SAMPLE content indexed as real | Sample hidden in production by default; no Event JSON-LD for sample |

### HIGH (fixed or explicitly limited)

| Issue | Resolution / remaining |
| --- | --- |
| SEO stripped `[SAMPLE]` labels | Stopped cleaning for indexing; sample noindex + omitted from sitemap when gated |
| Dual public/admin content sources | Documented; admin UI warns; **unification still required** |
| Membership status disabled staff logins | Only `MEMBER`/`PUBLIC` users auto-deactivated |
| Mock payments escape hatch | Requires `ALLOW_MOCK_PAYMENTS` **and** `MOCK_PAYMENTS_CONFIRM` |
| Console notifications claimed success | Production returns `ok: false` |
| SUPER_ADMIN privilege escalation in service | Actor must be SUPER_ADMIN; last SUPER_ADMIN protected |
| Seed invented SUCCESS/PAID finances | Seed payments stay `PENDING`; invoices `ISSUED` |
| Design-system public in production | Redirected unless `ALLOW_DESIGN_SYSTEM=true` |
| MFA for staff | **Still required before go-live** (not implemented) |
| Edge/cluster rate limits | App-level only; **WAF required** |
| Privacy/terms non-operative | Stub pages remain — **legal review required** |

### MEDIUM

- CSP still allows `'unsafe-inline'` / `'unsafe-eval'`
- JWT revalidation window (~5 minutes)
- Thin e2e coverage (RBAC/IDOR/Razorpay mapping)
- No Dockerfile/CI/CD in repo
- Contact placeholders in `content/site.ts`
- Append-only audit policy not enforced at DB level

### LOW

- Legacy `ADMIN` / `COMMITTEE` role aliases
- Postal code inconsistencies in sample data
- HSTS only when `SITE_URL` is https

---

## Known limitations

1. **Public content ≠ admin Prisma content.** Publishing from admin does not update the public site.
2. **No general file/image upload pipeline.** Gallery uses static/content media; documents admin is intentionally gated.
3. **Notifications are console adapters** until email/SMS/WhatsApp providers are wired.
4. **No MFA / passkeys** for admin accounts.
5. **Rate limiting is in-process** and resets per instance.
6. **Razorpay live checkout UX** depends on `short_url` / hosted flows; end-to-end certification in test mode is still required.
7. **Disaster recovery runbooks** are recommendations only — implement on your host.

---

## Required production configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | ≥32 chars, unique, from CSPRNG |
| `SITE_URL` | Yes | Real HTTPS origin — never invent in code |
| `AUTH_URL` | Recommended | Same origin as Auth.js host trust |
| `REPOSITORY_DRIVER` | Yes | Must be `prisma` |
| `DATABASE_URL` | Yes | Managed Postgres, private network |
| `PAYMENT_PROVIDER` | Yes | Must be `razorpay` for real dues |
| `PAYMENT_MODE` | Yes | `test` then `live` with matching key prefix |
| `RAZORPAY_KEY_ID` | Yes (razorpay) | `rzp_test_*` or `rzp_live_*` |
| `RAZORPAY_KEY_SECRET` | Yes | Secret manager |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Matches Razorpay dashboard |
| `CONTENT_INCLUDE_SAMPLE` | No | Default off in production; do not enable for public launch |
| `ALLOW_MOCK_PAYMENTS` | No | Must be unset/false for real money |
| `ALLOW_DEMO_SEED` | No | Must be unset/false on production DB |
| `ALLOW_DESIGN_SYSTEM` | No | Keep unset |

See `.env.example`.

---

## Environment variables (summary)

**Safe defaults for local:** `REPOSITORY_DRIVER=mock` or `prisma` + local DB, `PAYMENT_PROVIDER=mock`, sample content on.

**Production must fail closed on:** mock repository, mock payments (unless double-confirmed sandbox), missing `AUTH_SECRET`, missing Razorpay secrets when selected, demo seed without allow flag.

---

## Database migration requirements

1. Provision Postgres 15+.
2. Set `DATABASE_URL`.
3. Run:

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
```

4. **Do not** run `npm run db:seed` against production unless `ALLOW_DEMO_SEED=true` on an isolated sandbox DB.
5. Create the first real SUPER_ADMIN out-of-band (secure password, MFA when available); never reuse `admin@rjgc.local`.
6. Apply migration `20261002190000_payment_order_ref` (adds `Payment.providerOrderRef`).

---

## Payment onboarding requirements

1. Create Razorpay account; complete KYC.
2. Configure webhook: `https://<SITE_URL>/api/webhooks/payments/razorpay`
   - Events: payment captured/failed, subscription lifecycle as used by the club.
3. Set `RAZORPAY_*` secrets and `PAYMENT_PROVIDER=razorpay`.
4. Start with `PAYMENT_MODE=test` + `rzp_test_*` keys; run end-to-end mandate + payment tests.
5. Flip to `PAYMENT_MODE=live` + `rzp_live_*` only after reconciliation checks.
6. Confirm SUCCESS paths only via verified webhooks (never from create-order responses alone).
7. Assign real membership plan amounts (`amountPaise ≥ 100`) before members can set up mandates.

---

## Domain configuration

1. Choose and register the real domain (organization decision — not invented in this repo).
2. Point DNS to the hosting provider; terminate TLS.
3. Set `SITE_URL=https://your-domain` (and `AUTH_URL` if required).
4. Verify `/sitemap.xml`, `/robots.txt`, canonical tags, and OG previews.
5. Ensure HSTS is active (headers emit when `SITE_URL` is https).

---

## Storage configuration

- **Today:** no object storage; media is repo/static or placeholder paths.
- **Before enabling uploads:** use private bucket (S3/GCS/R2), signed uploads, MIME allowlists, size limits, malware scanning, and never serve user content from world-writable paths.
- Documents admin UI is intentionally disabled for unrestricted uploads.

---

## Notification configuration

- Console channels are **dev-only**; production returns failure (no fake “sent”).
- Before launch, integrate real providers (e.g. SES/SendGrid + SMS/WhatsApp vendor) behind `NotificationChannel`.
- Until then, communicate that payment/membership emails are not delivered automatically.

---

## Deployment steps

1. Build CI gate: `npm run lint && npm run typecheck && npm test && npm run build`.
2. Inject production secrets via the host secret manager (not git).
3. Run `prisma migrate deploy` before/during release.
4. Deploy the Next.js app (Node 20+ recommended) behind HTTPS.
5. Configure edge rate limits for `/login` and `/api/webhooks/payments/*`.
6. Smoke test:
   - Login works for real admin; demo accounts fail/absent
   - Member cannot see another member’s receipts
   - Forged webhook → 401
   - Sample content absent from public sitemap
   - Mandate amount matches plan
7. Monitor logs and audit tables for 24–48h after cutover.

---

## Backup recommendations

- Daily automated Postgres backups with point-in-time recovery.
- Retain ≥30 days; quarterly restore drill to a scratch database.
- Back up webhook/event tables for dispute evidence.
- Do not rely solely on application soft-deletes for recovery.

---

## Monitoring recommendations

| Signal | Why |
| --- | --- |
| 5xx rate / latency | Availability |
| Auth failure spikes | Brute force |
| Webhook 401/429/5xx | Payment integrity |
| Payments stuck PENDING | Reconciliation |
| Audit log volume for admin mutations | Insider misuse |
| Disk / DB connections | Capacity |

Add uptime checks on `/`, `/login`, and a lightweight health endpoint when introduced.

---

## Post-launch checklist

- [ ] Real `SITE_URL` + TLS + DNS
- [ ] `AUTH_SECRET` rotated and unique
- [ ] `REPOSITORY_DRIVER=prisma`, migrations applied
- [ ] No demo users; staff MFA plan executed
- [ ] Razorpay live keys + webhook verified
- [ ] `ALLOW_MOCK_PAYMENTS` / `ALLOW_DEMO_SEED` / `CONTENT_INCLUDE_SAMPLE` off
- [ ] Verified privacy policy & terms published
- [ ] Contact details real (no placeholders)
- [ ] SAMPLE content removed or unpublished
- [ ] Public CMS source of truth decided and implemented
- [ ] Backups + restore drill documented
- [ ] Edge rate limits + alerting live
- [ ] Treasurer reconciliation process documented
- [ ] Incident contact / break-glass SUPER_ADMIN procedure

---

## Architecture notes (handoff)

```
Public (content/*)     Member portal          Admin portal
      |                     |                        |
      +-------- App Router + Auth.js session --------+
                            |
                     Services / RBAC
                            |
              Prisma <--> Postgres
                            |
              PaymentProvider <--> Razorpay / mock
                            |
              Webhooks (signed, idempotent)
```

Trust boundary details and threat model: [`docs/security.md`](./security.md).

---

## Testing expectations before go-live

Minimum:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Recommended additions before live payments:

- Razorpay test-mode webhook suite (order → payment linkage)
- RBAC matrix tests (treasurer vs content manager)
- IDOR tests for payments/receipts
- Staging load smoke on login + webhooks

---

## Content architecture guidance

- Keep `provenance: "verified" | "sample" | "placeholder"` discipline.
- Production must not index sample content.
- Replace placeholders in contact, privacy, registration, and heritage before public launch.
- Plan a single write path (Prisma → public queries, or admin publishing into content pipeline) before promising CMS self-service to the committee.
