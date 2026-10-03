# Production testing strategy — Rishra Junior Group Club

This document defines how we test for production readiness. Happy paths alone are insufficient — every suite must include failure and abuse cases.

## Layers

| Layer | Tooling | Location | Purpose |
| --- | --- | --- | --- |
| **Unit** | Vitest | `tests/unit/**` | Pure rules: validation, RBAC, amount labels, status transitions |
| **Integration** | Vitest + Postgres | `tests/integration/**`, `tests/payments/**` | Services against real Prisma/DB + mock payment provider |
| **Security** | Vitest | `tests/security/**`, `tests/auth/**` | Unauthorized access, IDOR, escalation, webhook forgery/replay |
| **End-to-end** | Playwright | `e2e/**` | Browser flows: login, portals, payments surface, admin members |

## Commands

```bash
# Unit + integration + security (Vitest)
npm test

# Focused slices
npm run test:unit
npm run test:integration
npm run test:security

# End-to-end (requires seed demo users + Playwright browsers)
npx playwright install chromium   # once per machine
npm run test:e2e

# Full local gate
npm run test:all
```

**Prerequisites for integration/e2e**

- `DATABASE_URL` pointing at a local Postgres schema
- `REPOSITORY_DRIVER=prisma`
- `PAYMENT_PROVIDER=mock` (sandbox)
- Seeded demo accounts: `npm run db:seed`  
  - Member: `member@rjgc.local` / `MemberDemo1!`  
  - Admin: `admin@rjgc.local` / `AdminDemo1!`
- Playwright sets `E2E_TEST=1` on the Next.js webServer so auth rate limits do not block browser suites

Override e2e credentials with `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.

---

## Unit coverage (required)

| Area | Tests | Failure cases |
| --- | --- | --- |
| Validation | `tests/unit/validation.test.ts` | Invalid email/password, bad membership numbers, invalid slugs/status |
| Permissions / media purpose | `tests/auth/permissions.test.ts`, `tests/unit/media-purpose-authz.test.ts` | Role denied writes; MEDIA_WRITE cannot widen purposes |
| Payment calculations | `tests/unit/payment-calculations.test.ts` | Label/paise consistency |
| Membership status | `tests/unit/membership-status.test.ts` | Suspend disables MEMBER login; invalid payloads |
| Payment status transitions | `tests/unit/payment-status-transitions.test.ts` | SUCCESS↛FAILED; REFUNDED/CANCELLED terminal |

---

## Integration coverage (required)

| Area | Tests | Failure cases |
| --- | --- | --- |
| Authentication | `tests/integration/authentication.test.ts` | Wrong password; inactive user; rate-limit exhaustion |
| Member CRUD | `tests/integration/member-crud.test.ts` | Duplicate membership number; validation errors; soft-delete hide |
| Payment initiation | `tests/integration/payment-initiation.test.ts` | Plan amount mismatch; oversize refund; missing member |
| Payment webhooks | `tests/payments/webhook*.test.ts` | Invalid signature; amount mismatch; monotonic ignore |
| Mandate lifecycle | `tests/integration/mandate-lifecycle.test.ts` | No plan; duplicate open mandate; ACTIVE only via webhook |
| Event registration | `tests/integration/event-registration.test.ts` | Suspended member; draft/past event; duplicate; cancel isolation |

---

## Security coverage (required)

| Abuse case | Tests |
| --- | --- |
| Unauthorized access | `tests/security/unauthorized-and-idor.test.ts`, `tests/auth/authorize.test.ts` |
| IDOR (cross-member data) | `tests/auth/member-isolation.test.ts`, `tests/security/unauthorized-and-idor.test.ts` |
| Role escalation | `tests/auth/admin-actions-authz.test.ts`, financial write denies |
| Invalid webhook | `tests/security/webhook-security.test.ts`, `tests/payments/webhook.test.ts` |
| Replayed webhook | Same — expects `duplicate` and stable SUCCESS once |
| CSV formula injection | `tests/security/csv-safe.test.ts`, `tests/security/admin-export-csv.test.ts` |
| Upload abuse | `tests/security/media-upload.test.ts` |

---

## End-to-end coverage (required)

| Flow | Spec | Notes |
| --- | --- | --- |
| Member login → dashboard | `e2e/auth-and-portals.spec.ts` | Failure: wrong password |
| Member payments / mandate pages | same | Query `memberId` must not pivot data |
| Admin login → members | same | |
| Public events; member events gated | same | Unauthenticated `/member/events` → login |
| Payment sandbox | same | UI surface; settlement still webhook-driven in unit/integration |

E2E does **not** replace webhook/IDOR integration tests. Browser tests prove routing and session gates; financial integrity stays in Vitest.

---

## Non-negotiable failure scenarios

Always keep tests (or add new ones) for:

1. Member A cannot read Member B payments / registrations  
2. SUCCESS cannot regress to FAILED  
3. Forged webhook signatures never settle payments  
4. Replayed provider events are idempotent  
5. Client-supplied payment amounts cannot override plan dues  
6. Refund amount cannot exceed the original payment  
7. Suspended members lose portal login (`User.active=false` for MEMBER)  
8. Draft media / draft events are not publicly actionable  

---

## CI recommendations

1. `npm run typecheck`  
2. `npm test` (Vitest) against a disposable Postgres service  
3. `npm run test:e2e` against seeded sandbox (optional nightly if browsers heavy)  
4. Fail the pipeline on any flaky retry exhaustion  

---

## Adding new features

Before merge:

- [ ] Unit tests for new validation / state machines  
- [ ] Integration test for the service + at least one failure path  
- [ ] Security check if the feature touches authz, ids, files, or money  
- [ ] E2E only when a user-visible flow changes  

Do not ship payment or membership changes with happy-path-only coverage.
