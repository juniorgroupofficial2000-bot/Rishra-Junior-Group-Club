# Rishra Junior Group Club

Production Next.js application for the Club’s public website, member portal, and admin portal — with Prisma/PostgreSQL, Auth.js sessions, RBAC, Razorpay payments/mandates, CMS content, and media object storage.

Site language: **English only**.

## Documentation

| Doc | Purpose |
| --- | --- |
| [`docs/PRODUCTION-READINESS.md`](./docs/PRODUCTION-READINESS.md) | Go-live verdict, severity findings, deploy checklist |
| [`docs/security.md`](./docs/security.md) | Threat model and controls |
| [`docs/payment-architecture.md`](./docs/payment-architecture.md) | Mandates, webhooks, reconciliation |
| [`docs/database.md`](./docs/database.md) | Schema, migrations, financial integrity |
| [`docs/auth.md`](./docs/auth.md) | Sessions, RBAC, MFA |
| [`docs/observability.md`](./docs/observability.md) | Structured logs and monitoring |
| [`docs/testing.md`](./docs/testing.md) | Unit / integration / e2e |
| [`docs/environments.md`](./docs/environments.md) | LOCAL / DEVELOPMENT / STAGING / PRODUCTION |
| [`docs/git-workflow.md`](./docs/git-workflow.md) | `main` / `develop` / feature·fix·hotfix + PR checks |
| [`docs/deployment.md`](./docs/deployment.md) | CI/CD, previews, staging, safe migrations |
| [`docs/security-environments.md`](./docs/security-environments.md) | Isolation guards so dev mistakes cannot hit production |
| [`docs/development.md`](./docs/development.md) | Env badge, admin diagnostics, developer utilities |
| [`.env.example`](./.env.example) | Environment contract (+ lane-specific `*.example` files) |

Configuration is typed and validated via [`config/`](./config/) (`import { env } from "@/config"`). Prefer that over scattered `process.env` reads.

## Local development

```bash
cp .env.local.example .env
# Set APP_ENV=local, DATABASE_URL, AUTH_SECRET (≥32 chars), APP_URL=http://localhost:3000
npm ci
npx prisma migrate dev
npm run db:seed          # SAMPLE demo data only — never on production DB
npm run dev
```

Optional: `REPOSITORY_DRIVER=mock` and `PAYMENT_PROVIDER=mock` for offline UI work (local lane only).

## Git & deploy (summary)

- Branches: `main` (production), `develop` (development), `feature/*`, `fix/*`, `hotfix/*` — see [`docs/git-workflow.md`](./docs/git-workflow.md).
- CI on every PR; CD maps `develop` → Development, `main` → Production; staging is manual — see [`docs/deployment.md`](./docs/deployment.md).
- Never deploy feature branches to production; never point previews at production secrets.

Manual production bootstrap (if not using Actions yet):

1. Provision PostgreSQL with automated backups and TLS.
2. Set production env from `.env.production.example` (`APP_ENV=production`) — see [`docs/environments.md`](./docs/environments.md).
3. `npm ci`
4. `npm run db:migrate:deploy` (never `migrate reset` on production)
5. `npx prisma generate`
6. `npm run build`
7. `npm start` (or your process manager)
8. Point HTTPS domain at the app; set `APP_URL` / `AUTH_URL` to that origin.
9. Configure Razorpay webhook → `POST /api/webhooks/payments/razorpay`
10. Schedule `POST /api/cron/reconcile-payments` with `Authorization: Bearer $CRON_SECRET`
11. **Do not** run `db:seed` against production.

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Security notes

- Never commit `.env` or Razorpay secrets.
- `PAYMENT_MODE=live` requires `REQUIRE_STAFF_MFA=true` and Resend email config.
- Demo seed accounts (`admin@rjgc.local`) must never exist on production databases.
