# Payment architecture — recurring e-mandates

**Scope:** Monthly membership dues via provider e-mandates (Razorpay) with a mock sandbox adapter.  
**Related:** [`docs/database.md`](./database.md), [`docs/security.md`](./security.md), [`.env.example`](../.env.example)

**Non-negotiable rules**

1. Never trust frontend / browser payment status.
2. Never mark a payment `SUCCESS` from checkout return URLs or client callbacks.
3. Settlement uses **verified provider webhooks** or **server-side provider API fetches** (reconciliation only).
4. Payment secrets never appear in `NEXT_PUBLIC_*` or client bundles.

---

## Lifecycle

```
Member
  → Mandate setup (server: plan amount)
  → Provider (Razorpay / mock)
  → Recurring debit / one-off order
  → Signed webhook (or reconcile fetch)
  → Payment record (+ PaymentAttempt)
  → Invoice (ISSUED → PAID)
  → Receipt (on SUCCESS)
  → Member ledger (portal / admin reads DB)
```

| Stage | Authority | Notes |
| --- | --- | --- |
| Mandate create | Server action + provider API | Local status stays `CREATED`/`PENDING` until webhook says `ACTIVE` |
| Mandate cancel | Server + provider | Final `CANCELLED` from provider webhook preferred |
| Checkout / order | `initiateMemberPayment` | Persists `PENDING` + `Invoice ISSUED`; amount from **current plan** |
| Capture / fail | Webhook HMAC verified | Updates `Payment`, attempt history, receipt, invoice |
| Refund | Admin requests provider refund | Local `REFUNDED` only after verified `payment.refunded` (or reconcile) |
| Ledger | PostgreSQL | Soft-deleted members retain payment history |

---

## Providers & configuration

| Env | Sandbox | Production |
| --- | --- | --- |
| `PAYMENT_PROVIDER` | `mock` | `razorpay` |
| `PAYMENT_MODE` | `test` | `test` then `live` |
| Keys | `rzp_test_*` / mock webhook secret | `rzp_live_*` + webhook secret |
| Mock in prod | Dual confirm flags only | Prefer never |

Factory (`server/payments/factory.ts`) and `assertProductionConfig()` fail closed: no silent mock fallback, no live keys under `PAYMENT_MODE=test`.

**Sandbox vs live stay separate** — never enable production credentials in this repo’s defaults.

---

## Webhook guarantees

| Concern | Implementation |
| --- | --- |
| Signature verification | HMAC-SHA256 + `timingSafeEqual` (Razorpay + mock) |
| Idempotency | Unique `(provider, providerEventId)` on `ProviderWebhookEvent` |
| Replay | Same event id → `duplicate` / HTTP 200 |
| Claim lock | `updateMany` claim to `PROCESSING`; stale (>2m) can retry |
| Duplicate payments | Partial unique `(provider, providerPaymentRef)` / order ref |
| Dual path guard | If `paymentRef` handled, skip synthetic recurring path |
| Amount mismatch | `WebhookNonRetryableError` → persist `FAILED`, HTTP **200** (no infinite retry) |
| Closed mandate debit | Non-retryable reject |
| Monotonic status | `SUCCESS` → only `REFUNDED`; ignore FAILED after SUCCESS |
| Receipt | Created once on SUCCESS |
| Invoice | Linked on initiate / mandate debit; `PAID` on SUCCESS |
| Notifications | After successful DB txn; lookup by payment **or** order ref |

Ingress: `POST /api/webhooks/payments/[provider]` — path must match configured provider, body size cap, rate limit, raw body for HMAC.

---

## Transaction boundaries

Webhook apply runs in a single Prisma `$transaction`:

1. Load / create event row  
2. Claim `PROCESSING`  
3. Apply mandate + payment + attempt + receipt + invoice  
4. Mark `PROCESSED`  

Notifications/audit run **after** commit (retry-safe for side effects).

---

## Failure & ops scenarios

| Scenario | Expected behavior |
| --- | --- |
| Invalid signature | HTTP 401; no ledger write |
| Provider outage on setup | Action error to user; no SUCCESS |
| Webhook delay | Member/admin see `PENDING` until webhook or reconcile job |
| Stale PENDING | `reconcileStalePendingPayments()` fetches provider status server-side |
| Transient apply error | HTTP 500 → provider retries |
| Permanent apply error | HTTP 200 + `retryable: false` |
| Cancelled mandate + debit | Rejected; no new payment |
| Refund | Request via provider; settle via webhook |

---

## Member ledger

Portal and admin UIs read **database** status only (`Payment`, `Receipt`, `Invoice`, `PaymentMandate`). Checkout UX may show “awaiting confirmation” but must not invent SUCCESS.

---

## Key modules

| Module | Role |
| --- | --- |
| `server/payments/provider.ts` | Adapter interface |
| `server/payments/razorpay-provider.ts` | Live/test Razorpay |
| `server/payments/mock-provider.ts` | Local sandbox |
| `server/payments/mandate-service.ts` | Mandate setup/cancel |
| `server/payments/payment-service.ts` | Initiate, refund request, reconcile |
| `server/payments/webhook-processor.ts` | Verify + apply + idempotency |
| `app/api/webhooks/payments/[provider]/route.ts` | HTTP ingress |

---

## Tests

- `tests/payments/webhook.test.ts` — happy path, duplicates, mandate cancel, recurring fail  
- `tests/payments/webhook-failures.test.ts` — amount mismatch, monotonicity, refunds, order link, closed mandate, invoice PAID, dual receipt  
- `tests/payments/razorpay-webhook-parse.test.ts` — nested `subscription.charged` payment entity + signature  
- `tests/payments/mock-provider.test.ts` — adapter basics  

---

## Go-live checklist (payments)

- [ ] Razorpay **test** mode E2E: mandate auth → charged → receipt → invoice PAID  
- [ ] Webhook URL + secret rotated; only HTTPS  
- [ ] Switch `PAYMENT_MODE=live` with `rzp_live_*` only after certification  
- [ ] Monitor `ProviderWebhookEvent` `FAILED` / stuck `PROCESSING`  
- [ ] Schedule `reconcileStalePendingPayments` (cron / ops job)  
- [ ] Confirm no payment secrets in client bundles  
