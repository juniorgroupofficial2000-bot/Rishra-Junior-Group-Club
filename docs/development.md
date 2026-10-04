# Development utilities

Tools for **local**, **development**, and **staging** only.  
They are completely unavailable when `APP_ENV=production` (HTTP **404**, not a hidden button).

Related: [security-environments.md](./security-environments.md), [environments.md](./environments.md), [git-workflow.md](./git-workflow.md).

## Environment indicator

Non-production surfaces show a subtle ribbon / admin title badge:

| APP_ENV | Badge |
| --- | --- |
| `local` | `LOCAL` |
| `development` | `DEVELOPMENT` |
| `staging` | `STAGING` |
| `production` | *(never shown)* |

Admin header example: `STAGING · RISHRA JUNIOR GROUP CLUB`.

## Admin environment panel

`/admin/settings` shows safe diagnostics for authorized staff:

- Environment
- Application version (`package.json` / `APP_VERSION`)
- Git commit SHA (when `GIT_COMMIT_SHA`, Vercel, or GitHub Actions provide it)
- Build timestamp
- API version (`v1`)
- Database environment label (lane + database **name** only — never credentials)
- Payment mode / provider (extra detail outside production)

Never shown: database URLs with passwords, API keys, secrets, access tokens.

Production admins still see version / commit / build / payment mode — not infrastructure secrets.

## Developer utilities UI

| Path | Access |
| --- | --- |
| `/admin/developer` | Staff with `SETTINGS_WRITE`, non-production only |

Nav item **Developer** appears only when utilities are enabled for the current `APP_ENV`.

### Available actions

| Action | What it does |
| --- | --- |
| Seed database | Runs SAMPLE demo seed (`runDemoSeed`) — wipe + fictional fixtures |
| Reset development database | Same SAMPLE wipe + re-seed (not `prisma migrate reset`) |
| Create test member | Inserts one SAMPLE member (`@rjgc.local`) |
| Create test event | Inserts one SAMPLE published event |
| Create test announcement | Inserts one SAMPLE published announcement |
| Test notification | Dispatches in-app/email via lane-safe channels |
| Test payment webhook | Creates SAMPLE payment + processes mock `payment.captured` |

Destructive seed/reset still go through `assertDestructiveOpAllowed()` (production blocked; staging needs dual confirmation; production markers refused).

Test payment webhook requires `PAYMENT_PROVIDER=mock`.

## Developer APIs

Base path: `/api/dev/[action]`

| Method | Behavior |
| --- | --- |
| `GET` | Describes the action (non-production only) |
| `POST` | Runs the action (session + `SETTINGS_WRITE`) |

Actions: `seed`, `reset`, `create-test-member`, `create-test-event`, `create-test-announcement`, `test-notification`, `test-payment-webhook`.

### Production behavior

- Proxy returns **404** for `/api/dev/*` and `/admin/developer`
- Route handlers return **404**
- Page calls `notFound()`

Do not rely on UI omission alone.

### Example (non-production)

```bash
# Authenticated browser session cookie required in practice.
curl -X POST "$APP_URL/api/dev/create-test-member" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## CLI counterparts

Prefer npm scripts for local machines:

```bash
npm run db:seed    # guarded by scripts/assert-safe-db.ts
npm run db:reset   # requires ALLOW_DESTRUCTIVE_OPS + confirm phrase
```

Never run these against production-marked `DATABASE_URL` values.

## Build metadata

`next.config.ts` injects (non-secret):

- `APP_VERSION` / `NEXT_PUBLIC_APP_VERSION`
- `GIT_COMMIT_SHA` / `NEXT_PUBLIC_GIT_COMMIT_SHA`
- `BUILD_TIMESTAMP` / `NEXT_PUBLIC_BUILD_TIMESTAMP`
- `API_VERSION`

CI/Vercel should pass `GITHUB_SHA` or rely on `VERCEL_GIT_COMMIT_SHA`.
