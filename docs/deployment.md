# Deployment

This document describes CI/CD, environment mapping, preview isolation, and safe database migrations for Rishra Junior Group Club.

Git branching rules live in [git-workflow.md](./git-workflow.md). Logical `APP_ENV` values live in [environments.md](./environments.md).

## Hosting model

Primary target: **Vercel** (Next.js) + **managed Postgres** + optional object storage.

GitHub Actions owns quality gates and orchestrated deploys. Vercel may also build Preview deployments for pull requests; those must use **isolated** credentials (never Production).

Alternative hosts can subscribe via `DEPLOY_HOOK_URL` on each GitHub Environment.

## Environment mapping

| Git ref / action | GitHub Environment | `APP_ENV` | Deploy trigger |
| --- | --- | --- | --- |
| `develop` | `development` | `development` | Automatic after CI succeeds on `develop` |
| `main` | `production` | `production` | Automatic after CI succeeds on `main` (or manual with confirmation) |
| Manual **Deploy Staging** | `staging` | `staging` | `workflow_dispatch` only — type `staging` to confirm |
| Pull request | Host Preview (Vercel Preview) | `local` / `development` (never `production`) | Provider preview; isolated secrets |

**Never** map every preview deployment to production resources.

## Pipeline stages

### CI (required on every PR)

Workflow: `.github/workflows/ci.yml`

1. Checkout
2. Setup Node 22 + npm cache
3. `npm ci`
4. `prisma generate` + `npm run db:validate`
5. Lint → typecheck → unit → security tests
6. Integration tests against ephemeral Postgres (`prisma migrate deploy` on CI DB only)
7. Production build
8. Aggregate job **CI passed**

Optional: `npm audit --audit-level=high` (non-blocking advisory signal).

Configure branch protection so PRs cannot merge when **CI passed** fails.

### CD — Development

Workflow: `.github/workflows/deploy-development.yml`

- Trigger: CI completed successfully on `develop`
- Uses GitHub Environment **`development`**
- Build with `APP_ENV=development`
- `prisma migrate deploy` against the **development** database only
- Deploy via Vercel project IDs for development (non-`--prod` path) and/or `DEPLOY_HOOK_URL`

### CD — Staging (explicit)

Workflow: `.github/workflows/deploy-staging.yml`

- Trigger: **manual** only (`workflow_dispatch`)
- Inputs: git `ref` + confirmation string `staging`
- Re-runs verify gates on the selected ref
- Uses GitHub Environment **`staging`**
- Test payment mode only
- Never auto-triggered from feature branches

### CD — Production

Workflow: `.github/workflows/deploy-production.yml`

- Trigger: CI success on `main`, or manual dispatch with confirmation `production`
- Uses GitHub Environment **`production`** (require reviewers in GitHub settings)
- Build with `APP_ENV=production`
- Non-destructive migrate (`prisma migrate deploy`) then Vercel `--prod` / deploy hook

Feature / fix / random branches must not run this workflow.

## Preview deployments

When Vercel (or equivalent) creates PR previews:

### Allowed

- Ephemeral or shared **non-production** database
- Razorpay **test** keys / mock payments
- Preview media bucket or local/dev prefix
- Distinct `AUTH_SECRET`, `CRON_SECRET`, webhook secrets

### Forbidden

- Production `DATABASE_URL`
- Live payment credentials (`rzp_live_*`, `PAYMENT_MODE=live`)
- Production object storage buckets/credentials
- Production email / cron / monitoring write keys that can affect live ops

### Configuration checklist (Vercel)

1. Project → Settings → Environment Variables
2. Scope Production variables to **Production** only
3. Scope Preview variables separately (dev/staging-like values)
4. Do **not** enable “Sensitive” production secrets for Preview
5. Prefer a separate Vercel project for true production if team size allows
6. Keep Production domain aliases tied to `main` / Production deploys only (`github.autoAlias: false` in `vercel.json`)

Guard workflow: `.github/workflows/preview-isolation.yml` rejects PR contexts that claim `APP_ENV=production`.

## GitHub Environments and secrets

Create three Environments in the repo settings:

| Environment | Required secrets (examples) | Variables (examples) |
| --- | --- | --- |
| `development` | `DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`, optional Vercel / hook | `APP_URL`, `PAYMENT_PROVIDER`, `MEDIA_STORAGE_DRIVER` |
| `staging` | Same shape, **staging** DB + test Razorpay | `APP_URL`, `REQUIRE_STAFF_MFA` |
| `production` | Production DB, live/test payments as policy, Resend, S3 | `APP_URL`, `PAYMENT_MODE`, `EMAIL_FROM` |

Optional deploy secrets (per environment / project):

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `DEPLOY_HOOK_URL`

Use **different** `VERCEL_PROJECT_ID` values for development vs staging vs production when possible so a misconfigured workflow cannot overwrite the wrong project.

Set Environment protection rules:

- `production`: required reviewers + wait timer optional
- `staging`: optional reviewers
- `development`: optional

## Database migrations

### Never in production

- `prisma migrate reset`
- `prisma db push --force-reset`
- Dropping databases or truncating member/payment tables as “deploy steps”
- Auto-applying unreviewed destructive SQL from feature branches

### Production migration workflow

1. **Validate** — `npm run db:validate` and CI green on the release PR
2. **Backup** — take a managed Postgres snapshot / backup before applying
3. **Apply** — `npx prisma migrate deploy` (forward-only; used by Deploy Production)
4. **Verify** — `npx prisma migrate status`, smoke login/admin/payments
5. **Monitor** — error tracking, payment webhooks, auth failures

To skip migrate during an emergency code-only rollback deploy, set Environment variable `SKIP_DB_MIGRATE=true` on `production` temporarily, then clear it.

### Development / staging

`prisma migrate deploy` is acceptable against non-production databases after CI. Prefer reviewing migration SQL in the PR.

Local development uses `npm run db:migrate` (`prisma migrate dev`) against a laptop database only.

## Required scripts

| Script | Role |
| --- | --- |
| `npm ci` | Clean install in CI |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test:unit` | Unit tests |
| `npm run test:integration` | Integration + payment tests |
| `npm run test:security` | Auth / security tests |
| `npm run db:validate` | Prisma schema validation |
| `npm run db:migrate:deploy` | Apply migrations (non-destructive) |
| `npm run db:migrate:status` | Post-migrate verification |
| `npm run build` | Next.js production build |

## Branch protection (operators)

On GitHub → Settings → Branches:

**`main` and `develop`**

- Require a pull request before merging
- Require status checks: **CI passed** (and optionally **Preview Isolation Guard**)
- Restrict who can push
- Do not allow bypassing for routine work

## First-time setup

1. Create `develop` from `main` and push:  
   `git checkout main && git pull && git checkout -b develop && git push -u origin develop`
2. Add GitHub Environments `development`, `staging`, `production` with isolated secrets
3. Connect Vercel projects; disable copying Production env into Preview
4. Enable branch protection with required check **CI passed**
5. Merge a no-op PR to verify CI → Deploy Development
6. Run **Deploy Staging** once manually against `main`
7. Merge `develop` → `main` only when ready for production

## Related docs

- [git-workflow.md](./git-workflow.md)
- [environments.md](./environments.md)
- [database.md](./database.md)
- [security.md](./security.md)
