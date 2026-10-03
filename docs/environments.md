# Environments

Rishra Junior Group Club uses four **logical** application environments via `APP_ENV`.  
This is separate from `NODE_ENV` (which is `production` for both staging and production builds).

Isolation safeguards (payments, storage buckets `club-dev` / `club-staging` / `club-production`, email redirect, destructive ops) are documented in [security-environments.md](./security-environments.md).

| APP_ENV | Purpose | Example URL | Typical NODE_ENV |
| --- | --- | --- | --- |
| `local` | Developer laptop | `http://localhost:3000` | `development` |
| `development` | Shared feature integration | `https://dev.rishrajuniorgroupclub.in` | `production` or `development` |
| `staging` | Production-like pre-release | `https://staging.rishrajuniorgroupclub.in` | `production` |
| `production` | Real members | `https://rishrajuniorgroupclub.in` | `production` |

Configuration is centralized in [`config/`](../config/). Prefer:

```ts
import { env, getServerEnv, getPublicEnv, isFeatureEnabled } from "@/config";
```

Do **not** scatter `process.env.X` through components (Edge-safe exceptions: `proxy.ts`, Auth.js edge config, thin helpers).

---

## Responsibilities

### LOCAL

- Local Next.js (`next dev`)
- Local or dedicated laptop database (`rjgc_local`)
- Mock or Razorpay **test** payments only
- Local filesystem media (`.data/media`)
- Verbose / debug logging
- Never production `DATABASE_URL`, live Razorpay keys, or production storage

Template: [`.env.local.example`](../.env.local.example)

### DEVELOPMENT

- Shared team environment for active features
- Separate database and media bucket/prefix
- Test payments + development email
- May include seeded SAMPLE data (`CONTENT_INCLUDE_SAMPLE`, `ALLOW_DEMO_SEED`)
- Debug logging allowed

Template: [`.env.development.example`](../.env.development.example)

### STAGING

- Production **build** (`next build` + `next start`)
- Production-like infra, separate data
- Razorpay **test** keys only (`PAYMENT_MODE=test`, `rzp_test_*`)
- Staff MFA recommended (`REQUIRE_STAFF_MFA=true`)
- Monitoring DSN optional but recommended
- Never live payment keys or production member dumps

Template: [`.env.staging.example`](../.env.staging.example)

### PRODUCTION

- Real users and live systems
- `PAYMENT_MODE=live` + `rzp_live_*` when collecting dues
- Resend (or equivalent) email required for live payments
- `REQUIRE_STAFF_MFA=true`
- Minimal sensitive logging (`LOG_LEVEL=warn`)
- Backups + alerting owned by ops
- Demo/sample/E2E flags forbidden

Template: [`.env.production.example`](../.env.production.example)

---

## Required variable groups

### Application

| Variable | Notes |
| --- | --- |
| `APP_ENV` | `local` \| `development` \| `staging` \| `production` |
| `APP_NAME` | Display name |
| `APP_URL` | Canonical origin (no trailing slash) |
| `NEXT_PUBLIC_APP_ENV` / `_NAME` / `_URL` | Browser mirrors; must match server values |

Legacy aliases: `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`.

### Database

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Per-environment Postgres |
| `REPOSITORY_DRIVER` | `prisma` (required outside intentional local mock) |

### Authentication

| Variable | Notes |
| --- | --- |
| `AUTH_SECRET` | ≥32 characters |
| `AUTH_URL` | Auth.js public origin |
| `REQUIRE_STAFF_MFA` | Required in production for live payments |

### Storage

| Variable | Notes |
| --- | --- |
| `MEDIA_STORAGE_DRIVER` | `local` or `s3` |
| `MEDIA_LOCAL_ROOT` | Local only |
| `MEDIA_S3_*` | Bucket, keys, endpoint, region |
| `MEDIA_PUBLIC_BASE_URL` | CDN / public origin |

### Email

| Variable | Notes |
| --- | --- |
| `EMAIL_PROVIDER` | `console` \| `resend` |
| `RESEND_API_KEY` | Server-only |
| `EMAIL_FROM` | Verified sender |

### Payments

| Variable | Notes |
| --- | --- |
| `PAYMENT_PROVIDER` | `mock` \| `razorpay` |
| `PAYMENT_MODE` | `test` \| `live` |
| `RAZORPAY_KEY_ID` / `_SECRET` / `_WEBHOOK_SECRET` | Server-only |
| `ALLOW_MOCK_PAYMENTS` + `MOCK_PAYMENTS_CONFIRM` | Non-production mock only |

### Monitoring

| Variable | Notes |
| --- | --- |
| `SENTRY_DSN` | Server |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser (public DSN only) |
| `ANALYTICS_ENABLED` | Feature toggle |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` |

### Feature flags

`FEATURE_MEMBER_PORTAL`, `FEATURE_PAYMENTS`, `FEATURE_EVENTS`, `FEATURE_PUJA_ARCHIVE`, `FEATURE_GALLERY`, `FEATURE_ANNOUNCEMENTS`, `FEATURE_MEMBERSHIP_APPLICATION`

Use `isFeatureEnabled("payments")` from `@/config`.

### Safety

| Variable | Notes |
| --- | --- |
| `PRODUCTION_RESOURCE_MARKERS` | Comma-separated substrings; non-prod refuses matching DB/URL |
| `CONTENT_INCLUDE_SAMPLE` | Forbidden in production |
| `ALLOW_DEMO_SEED` | Forbidden in production |
| `E2E_TEST` | Forbidden in production/staging |
| `CRON_SECRET` | ≥32 characters where cron is deployed |

---

## Safeguards

Boot-time validation: `assertEnvironmentConfig()` (see [`config/assert.ts`](../config/assert.ts)), invoked from:

- `instrumentation.register()`
- Prisma client bootstrap

**Production (`APP_ENV=production`) refuses to start when:**

- `DATABASE_URL` missing or localhost
- secrets missing / weak (`AUTH_SECRET`, `CRON_SECRET`)
- `APP_URL` missing, localhost, or non-HTTPS
- demo/sample/E2E/debug flags enabled
- mock payments or `PAYMENT_MODE=test`
- live Razorpay without MFA + email

**Non-production refuses:**

- `PAYMENT_MODE=live` or `rzp_live_*` keys
- `DATABASE_URL` / `APP_URL` matching `PRODUCTION_RESOURCE_MARKERS`

---

## Deployment flow

```
LOCAL (feature branch)
   → DEVELOPMENT (shared integration)
      → STAGING (prod build + test payments)
         → PRODUCTION (live keys, MFA, backups)
```

1. Develop against LOCAL with a dedicated database.
2. Merge to the development deploy target; smoke-test on DEVELOPMENT.
3. Promote the same commit to STAGING; run Playwright + payment sandbox certification.
4. Promote to PRODUCTION only after staging sign-off.

Each lane has its **own** database, storage bucket/prefix, Auth secret, webhook secrets, and cron secret.

---

## Strategy notes

### Database

One Postgres database (or schema) per `APP_ENV`. Never share production data with lower lanes. Migrations run per lane (`prisma migrate deploy`).

### Storage

- LOCAL: `MEDIA_STORAGE_DRIVER=local`
- DEVELOPMENT / STAGING / PRODUCTION: separate S3/R2 buckets or prefixes

### Payments

| Lane | Provider mode |
| --- | --- |
| local / development | mock or Razorpay test |
| staging | Razorpay test only |
| production | Razorpay live only |

### Authentication

Per-lane `AUTH_SECRET` and `AUTH_URL` / `APP_URL`. Cookie `secure` follows HTTPS origins. Staff MFA required for production live payments.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Boot error `Environment configuration invalid (APP_ENV=production)` | Missing `APP_URL`, weak secrets, mock/test payments, or demo flags |
| Boot error about `PRODUCTION_RESOURCE_MARKERS` | LOCAL/DEV `DATABASE_URL` still points at prod host substring |
| Staging using live Razorpay | `PAYMENT_MODE=live` or `rzp_live_*` — forbidden |
| Canonical URLs show localhost | `APP_URL` / `SITE_URL` unset on the deployed lane |
| Mock payments in production build on staging | Set `ALLOW_MOCK_PAYMENTS` + confirm string, or use Razorpay test |
| `NEXT_PUBLIC_APP_ENV` mismatch | Must equal `APP_ENV` |

Reset caches in tests after stubbing env:

```ts
import {
  resetPublicEnvCacheForTests,
  resetServerEnvCacheForTests,
  resetEnvironmentAssertForTests,
} from "@/config";
```
