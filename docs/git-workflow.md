# Git workflow

Rishra Junior Group Club uses a fixed branch model so production only receives reviewed, CI-green code from `main`.

## Branch model

| Branch | Purpose |
| --- | --- |
| `main` | Production. Deployable only after CI. |
| `develop` | Integration / development environment. |
| `feature/*` | New work. Opens PR into `develop`. |
| `fix/*` | Bug fixes. Opens PR into `develop` (or `main` only for urgent production defects via hotfix). |
| `hotfix/*` | Critical production fixes. Opens PR into `main`, then back-merge into `develop`. |

Do **not** deploy random feature branches to production.

## Feature flow

```text
feature/*  →  Pull Request  →  develop  →  Development deployment
```

1. Branch from `develop`: `git checkout -b feature/short-name develop`
2. Open a PR targeting **`develop`**
3. Required CI checks must pass (see below)
4. Merge (squash or merge commit per team preference)
5. Successful CI on `develop` triggers **Deploy Development**

## Release to production

When `develop` is stable:

```text
develop  →  Pull Request  →  main  →  Production deployment
```

1. Open a PR: `develop` → `main`
2. Required CI checks must pass
3. Merge into `main`
4. Successful CI on `main` triggers **Deploy Production**
5. Staging remains **manual** (see [deployment.md](./deployment.md))

## Hotfix flow

```text
hotfix/*  →  PR → main  →  Production
                ↘ back-merge → develop
```

1. Branch from `main`: `git checkout -b hotfix/short-name main`
2. PR into `main` with CI green
3. After deploy, merge `main` back into `develop` so the fix is not lost

## Fix branches

- Day-to-day bugs: `fix/*` → PR → `develop`
- Production-only emergencies: prefer `hotfix/*` → `main`

## Pull request checks

Every PR into `main` or `develop` runs the **CI** workflow:

1. Install dependencies (`npm ci`, npm cache)
2. Prisma schema validation (`npm run db:validate`)
3. Lint
4. Typecheck
5. Unit tests
6. Security / auth unit tests
7. Integration tests (ephemeral Postgres)
8. Production build

The aggregate job **CI passed** must be green. Configure GitHub **branch protection** on `main` and `develop` so merges require that check (and optionally code review).

Additional guard: **Preview Isolation Guard** fails if a PR context claims `APP_ENV=production`.

## Naming examples

```text
feature/member-card-qr
feature/admin-content-editor
fix/payment-webhook-idempotency
hotfix/auth-session-null-totp
```

## Rules of thumb

- Never push directly to `main` or `develop` without a PR (except emergency ops with explicit approval).
- Never point a feature preview at production DB, payments, or storage.
- Never run `prisma migrate reset` / destructive DB commands against shared or production databases.
- Keep commits focused; PR description should state risk and migration impact.

## Related docs

- [deployment.md](./deployment.md) — CI/CD, environments, migrations
- [environments.md](./environments.md) — `APP_ENV` and secrets
