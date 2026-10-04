# Security: multi-environment isolation

**A mistake in development must never affect production.**

This project enforces that with fail-fast configuration checks, CLI guards, and runtime isolation — not developer discipline alone.

Related: [environments.md](./environments.md), [deployment.md](./deployment.md), [security.md](./security.md).

## Environment isolation

Logical lanes via `APP_ENV` (independent of `NODE_ENV`):

| APP_ENV | Database | Payments | Storage bucket | Email |
| --- | --- | --- | --- | --- |
| `local` | Local Postgres (`localhost` / `rjgc_local`) | Mock / test | Local disk (`.data/media`) | Console log |
| `development` | Development DB only | Sandbox / test | `club-dev` | Redirect / allowlist |
| `staging` | Staging DB only | Sandbox / test | `club-staging` | Controlled recipients |
| `production` | Production DB only | Live | `club-production` | Real delivery |

Boot validation: `assertEnvironmentConfig()` in `instrumentation.ts` and Prisma init (`config/assert.ts`).

## Secret management

- `.env` / `.env.*` are gitignored; only `*.example` templates are committed.
- Secrets must never use `NEXT_PUBLIC_*` prefixes.
- Structured logs redact secret-like keys, connection strings, Bearer tokens, and Razorpay/Resend key shapes (`server/observability/redact.ts`).
- Error messages are scrubbed before logging (`errorMessage()`).
- Do not print secrets in seed output, admin UI, or client bundles.
- Use a **different** `AUTH_SECRET`, `CRON_SECRET`, Razorpay keys, storage keys, and `DATABASE_URL` per environment.

### Credential scan policy

Before release, search the tree for live key patterns (`rzp_live_…`, `AKIA…`, private key PEM blocks). Examples in docs/templates must stay placeholders (`xxxxxxxx` / `replace-me`).

## Database isolation

- Non-production refuses `DATABASE_URL` / `APP_URL` matching `PRODUCTION_RESOURCE_MARKERS` (merged with defaults: `club-production`, `rjgc_production`, `rjgc-prod`, …).
- `APP_ENV=local` requires a local database unless `ALLOW_REMOTE_LOCAL_DATABASE=true`.
- Production refuses localhost databases.
- npm scripts run `scripts/assert-safe-db.ts` before migrate/seed/reset.
- `prisma migrate reset` is never allowed against staging/production.
- Destructive seed / financial hard-delete calls `assertDestructiveOpAllowed()` (`config/destructive-ops.ts`).

### Production migration path

1. Validate (`db:validate` + CI)
2. Backup
3. Apply (`db:migrate:deploy` — forward-only)
4. Verify (`db:migrate:status`)
5. Monitor

Never run `migrate reset`, `db push --force-reset`, or seed wipe against production.

## Payment isolation

| Lane | Allowed |
| --- | --- |
| local / development / staging | `PAYMENT_MODE=test`, `rzp_test_*`, or mock with dual confirm |
| production | `PAYMENT_MODE=live`, `rzp_live_*` only |

**Fail fast**

- Non-production + live keys / `PAYMENT_MODE=live` → boot failure
- Production + test keys / `PAYMENT_MODE=test` / mock provider → boot failure

## Storage isolation

When `MEDIA_STORAGE_DRIVER=s3`, bucket names are enforced:

- development → `club-dev`
- staging → `club-staging`
- production → `club-production`

Escape hatch only: `ALLOW_NONSTANDARD_MEDIA_BUCKET=true` (explicit, logged via failed assert if omitted).

Non-production also refuses media URLs/buckets matching production markers so development uploads cannot appear on the production site.

## Email isolation

| Lane | Strategy |
| --- | --- |
| local | `EMAIL_PROVIDER=console` (log only). Resend requires `EMAIL_REDIRECT_TO`. |
| development | Resend allowed only with `EMAIL_REDIRECT_TO` and/or `EMAIL_RECIPIENT_ALLOWLIST`. |
| staging | Same — controlled QA inboxes / allowlisted domains. |
| production | Real send. `EMAIL_REDIRECT_TO` forbidden. `EMAIL_PROVIDER=console` forbidden. |

`ResendEmailChannel` redirects or blocks non-allowlisted recipients outside production.

## Authentication isolation

- Separate `AUTH_SECRET` (≥32 chars) per deployed lane.
- Separate `AUTH_URL` / `APP_URL` callback origins.
- Do not copy production Auth.js / OAuth client secrets into development or Preview.
- Preview / PR environments must never use production `AUTH_SECRET` (see [deployment.md](./deployment.md)).

## Production data protection

- Never automatically copy production member data into development.
- Demo seed creates **SAMPLE / fictional** rows only and is blocked in production.
- If production data is required for debugging:
  1. Use an approved ops process
  2. Anonymize PII (names, phones, emails, addresses)
  3. Drop unnecessary columns (payment instruments, document numbers)
  4. Store dumps outside the repo — **never commit**
  5. Destroy copies when finished

## Runtime safety (destructive operations)

Guarded operations include:

- database reset (`npm run db:reset`)
- seed wipe (`npm run db:seed`)
- financial hard-delete bypass (`allowFinancialHardDelete`)
- (reserved) bulk member purge / storage bucket purge

Rules:

- **production** — always refused
- **staging** — requires `ALLOW_DESTRUCTIVE_OPS=true` **and** `DESTRUCTIVE_OPS_CONFIRM=I_UNDERSTAND_DATA_LOSS`
- **local** — refused against non-local `DATABASE_URL` unless `ALLOW_REMOTE_LOCAL_DATABASE=true`
- Member admin delete remains **soft-delete**; media delete is soft-delete; financial tables are protected by DB triggers unless the session bypass is explicitly enabled (and that bypass itself is gated)

Never expose destructive development tools in production builds or admin UI.

## Operator checklist

1. Create four isolated databases and three S3 buckets (`club-dev`, `club-staging`, `club-production`).
2. Configure GitHub / Vercel Environments with **non-overlapping** secrets.
3. Set `PRODUCTION_RESOURCE_MARKERS` on every non-production lane.
4. Set email redirect/allowlist on development and staging.
5. Confirm boot fails if you intentionally misconfigure (live keys on development, test keys on production, wrong bucket name).
6. Keep Preview env vars on the host scoped away from Production.
