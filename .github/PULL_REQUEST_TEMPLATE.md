## Summary

<!-- What changed and why -->

## Type

- [ ] `feature/*` → targets `develop`
- [ ] `fix/*` → targets `develop`
- [ ] `hotfix/*` → targets `main` (back-merge to `develop` after)
- [ ] Release: `develop` → `main`

## Risk

- [ ] No schema / data changes
- [ ] Additive migration only
- [ ] Destructive or data backfill (describe below — never auto-reset production)

## Checklist

- [ ] CI green (lint, typecheck, unit, integration, build, schema)
- [ ] No production secrets used in preview / local notes
- [ ] English-only UI copy
- [ ] Docs updated if workflow or env mapping changed

## Test plan

- [ ]
