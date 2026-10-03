# Database architecture — PostgreSQL / Prisma

**Scope:** Production readiness of the persistence layer for Rishra Junior Group Club.  
**Related:** [`docs/security.md`](./security.md), [`docs/production-audit.md`](./production-audit.md), [`.env.example`](../.env.example)

---

## Overview

| Item | Choice |
| --- | --- |
| Engine | PostgreSQL |
| ORM | Prisma (`prisma/schema.prisma`) |
| Driver | `REPOSITORY_DRIVER=prisma` (required in production) |
| Money unit | Integer **paise** (`amountPaise`) — never floats |
| Secrets | Never stored (no card/UPI PIN/webhook secrets in rows) |
| Soft delete | Members, content, and rare financial redaction via `deletedAt` |
| Sample data | `isSample` + demo seed gated by `ALLOW_DEMO_SEED` |

---

## Entity map (financial core)

```
User 1──0..1 Member
Member 1──* Membership  *──1 MembershipPlan
Member 1──* Invoice
Member 1──* PaymentMandate
Member 1──* Payment
Payment *──0..1 Invoice          (RESTRICT — invoice kept if payments exist)
Payment *──0..1 PaymentMandate   (RESTRICT — mandate kept if payments exist)
Payment 1──* PaymentAttempt      (RESTRICT — attempts never CASCADE-erased)
Payment 1──0..1 Receipt          (RESTRICT)
ProviderWebhookEvent             (idempotency key: provider + providerEventId)
AuditLog                         (append-only; UPDATE/DELETE blocked)
```

**Invariant:** Making a member `INACTIVE` / soft-deleted **does not** delete payments, invoices, receipts, mandates, or attempts. FKs use `ON DELETE RESTRICT` on financial edges; application soft-delete only updates `Member`.

---

## Normalization & enums

- Identity vs membership vs billing are separate tables (3NF-oriented).
- Status/method fields use Prisma enums mapped to PostgreSQL enums (`PaymentStatus`, `MandateStatus`, `MemberStatus`, …).
- Provider refs are opaque strings (`providerPaymentRef`, `providerOrderRef`, `providerMandateRef`) — not credentials.
- Public CMS content under `content/` is **not** in this schema (dual CMS — see production audit H3).

---

## Indexes & uniqueness

| Constraint | Purpose |
| --- | --- |
| `User.email` unique | Login identity |
| `Member.membershipNumber` unique | Human membership id |
| `Member.userId` unique nullable | At most one portal user per member |
| `Membership_one_current_per_member` (partial) | At most one `isCurrent` membership per member |
| `PaymentMandate_one_open_per_member` (partial) | At most one open mandate (`CREATED`/`PENDING`/`ACTIVE`/`PAUSED`) |
| `Payment_provider_payment_ref_unique` (partial) | Idempotent provider payment id per provider |
| `Payment_provider_order_ref_unique` (partial) | Idempotent provider order id per provider |
| `ProviderWebhookEvent (provider, providerEventId)` | Webhook idempotency |
| `Receipt.paymentId` / `Receipt.number` unique | One receipt per payment |
| Composite indexes | `Payment(memberId, status, paidAt)`, webhook processing stale recovery |

Partial uniques live in SQL migration `20261003120000_production_financial_integrity` (Prisma cannot express them fully in the schema DSL).

---

## CHECK constraints

- `MembershipPlan.amountPaise > 0`
- `Invoice.amountPaise > 0`
- `Payment.amountPaise > 0`
- `PaymentMandate.amountPaise IS NULL OR amountPaise > 0`

---

## Cascading behavior

| Relation | ON DELETE | Rationale |
| --- | --- | --- |
| Payment → Member | RESTRICT | Never erase ledger with member hard-delete |
| PaymentAttempt → Payment | **RESTRICT** | Attempt history is financial audit trail |
| Receipt → Payment | RESTRICT | Receipts outlive accidental deletes |
| Payment → Mandate / Invoice | RESTRICT | Keep linkage; cancel/void via status instead |
| GalleryMedia → Album | CASCADE | Content-only |
| Notification → User | CASCADE | Ephemeral UX |
| AuditLog → User | SET NULL | Preserve audit if actor user removed |

---

## Soft deletion

| Entity | Soft-delete? | Notes |
| --- | --- | --- |
| Member / User | Yes | Portal access revoked; **financial rows kept** |
| Membership / Mandate | Yes + status | Prefer status (`CANCELLED`) for mandates |
| Payment / Invoice / Receipt | Column present | Reserved for rare compliance redaction — **not** member inactivity |
| AuditLog / ProviderWebhookEvent | No soft-delete | Append-oriented |

Hard `DELETE` on payment, attempt, receipt, invoice, webhook event, and audit rows is **blocked by triggers** unless the session sets:

```sql
SELECT set_config('app.allow_financial_delete', 'on', false);
```

Use only from demo seed / test teardown (`server/db/financial-mutation.ts`).

---

## Financial immutability

After a payment reaches **`SUCCESS`** or **`REFUNDED`**:

- Immutable: `amountPaise`, `currency`, `memberId`, `invoiceId`, `mandateId`, `method`
- Status: `SUCCESS` → `REFUNDED` only; `REFUNDED` is terminal
- Application layer also ignores regressive webhook status transitions and records a forensic `PaymentAttempt`

Receipts are created once on verified SUCCESS (idempotent by `paymentId`).

---

## Transactions & race conditions

| Path | Boundary |
| --- | --- |
| Webhook process | Single `$transaction`: claim event → apply → `PROCESSED` |
| Payment initiate | `$transaction`: `Payment` + first `PaymentAttempt` |
| Membership plan switch | `$transaction`: clear `isCurrent` → create new current |
| Mandate setup | Provider API then DB insert (provider-side orphans possible; DB unique protects double open mandates) |

Webhook concurrency:

1. Unique `(provider, providerEventId)` prevents double apply of the same event.
2. Concurrent create races map `P2002` → load winner and continue / duplicate.
3. Stale `PROCESSING` older than 2 minutes may be retried (`processingStartedAt`).
4. Provider payment/order refs are partially unique to stop double ledger rows.

---

## Auditability

- `AuditLog`: action, entity, sanitized metadata, actor, IP, `createdAt`
- `ProviderWebhookEvent`: verified payload + processing status
- `PaymentAttempt`: chronological provider outcomes per payment
- DB triggers enforce AuditLog append-only in production sessions

---

## Seed data

`prisma/seed.ts` creates **fictional SAMPLE only**:

| Login | Role | Password |
| --- | --- | --- |
| `member@rjgc.local` | MEMBER | `MemberDemo1!` |
| `admin@rjgc.local` | SUPER_ADMIN | `AdminDemo1!` |

Blocked when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=true` (sandbox DBs only). Never seed real PII.

---

## Migrations

```bash
npx prisma migrate deploy   # production
npx prisma migrate dev      # local development
npx prisma validate
npx prisma generate
```

Key migrations:

1. `20261002170944_init_persistence` — base schema
2. `20261002171655_expand_app_roles` — staff roles
3. `20261002173000_payment_provider_architecture` — payment/mandate/webhook realignment
4. `20261002190000_payment_order_ref` — order vs payment refs
5. `20261003120000_production_financial_integrity` — CHECKs, partial uniques, RESTRICT FKs, immutability triggers

---

## Operational checklist

- [ ] Managed Postgres with automated backups + restore drill
- [ ] App DB role: DML only; no `BYPASSRLS` / superuser
- [ ] `DATABASE_URL` pooled (e.g. PgBouncer transaction mode) compatible with Prisma
- [ ] Never run demo seed against production member data
- [ ] Monitor webhook `FAILED` / stuck `PROCESSING` counts
- [ ] Retain financial tables under backup retention ≥ statutory requirement
