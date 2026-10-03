-- Production financial integrity:
-- - CHECK amounts > 0
-- - Partial unique provider refs / one-current membership / one open mandate
-- - RESTRICT FKs (no CASCADE erase of payment attempts)
-- - Hard-delete guards + SUCCESS immutability triggers
-- - Webhook processingStartedAt for stale PROCESSING recovery

-- ─── Data hygiene (idempotent) before constraints ────────────────────────────

-- Collapse duplicate current memberships: keep newest, clear others.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "memberId"
           ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
         ) AS rn
  FROM "Membership"
  WHERE "isCurrent" = true AND "deletedAt" IS NULL
)
UPDATE "Membership" m
SET "isCurrent" = false
FROM ranked r
WHERE m.id = r.id AND r.rn > 1;

-- Collapse duplicate open mandates: keep newest open row per member.
WITH open_mandates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "memberId"
           ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
         ) AS rn
  FROM "PaymentMandate"
  WHERE "deletedAt" IS NULL
    AND status IN ('CREATED', 'PENDING', 'ACTIVE', 'PAUSED')
)
UPDATE "PaymentMandate" pm
SET status = 'CANCELLED',
    "lastStatusAt" = CURRENT_TIMESTAMP,
    note = COALESCE(note, '') || ' [deduped open mandate before unique index]'
FROM open_mandates r
WHERE pm.id = r.id AND r.rn > 1;

-- Remove zero-amount non-success sample noise that would fail CHECK.
DELETE FROM "PaymentAttempt" WHERE "paymentId" IN (
  SELECT id FROM "Payment" WHERE "amountPaise" <= 0
);
DELETE FROM "Receipt" WHERE "paymentId" IN (
  SELECT id FROM "Payment" WHERE "amountPaise" <= 0
);
DELETE FROM "Payment" WHERE "amountPaise" <= 0;

UPDATE "MembershipPlan" SET "amountPaise" = 1 WHERE "amountPaise" <= 0;
UPDATE "Invoice" SET "amountPaise" = 1 WHERE "amountPaise" <= 0;
UPDATE "PaymentMandate" SET "amountPaise" = NULL WHERE "amountPaise" IS NOT NULL AND "amountPaise" <= 0;

-- Deduplicate provider payment refs (keep newest).
WITH dup_pay AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY provider, "providerPaymentRef"
           ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
         ) AS rn
  FROM "Payment"
  WHERE "providerPaymentRef" IS NOT NULL AND "deletedAt" IS NULL AND provider IS NOT NULL
)
UPDATE "Payment" p
SET "deletedAt" = CURRENT_TIMESTAMP,
    notes = COALESCE(notes, '') || ' [deduped providerPaymentRef soft-delete]'
FROM dup_pay d
WHERE p.id = d.id AND d.rn > 1;

WITH dup_ord AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY provider, "providerOrderRef"
           ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
         ) AS rn
  FROM "Payment"
  WHERE "providerOrderRef" IS NOT NULL AND "deletedAt" IS NULL AND provider IS NOT NULL
)
UPDATE "Payment" p
SET "deletedAt" = CURRENT_TIMESTAMP,
    notes = COALESCE(notes, '') || ' [deduped providerOrderRef soft-delete]'
FROM dup_ord d
WHERE p.id = d.id AND d.rn > 1;

-- ─── Schema columns ──────────────────────────────────────────────────────────

ALTER TABLE "ProviderWebhookEvent"
  ADD COLUMN IF NOT EXISTS "processingStartedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ProviderWebhookEvent_processingStatus_processingStartedAt_idx"
  ON "ProviderWebhookEvent"("processingStatus", "processingStartedAt");

CREATE INDEX IF NOT EXISTS "Payment_memberId_status_paidAt_idx"
  ON "Payment"("memberId", "status", "paidAt");

CREATE INDEX IF NOT EXISTS "Invoice_memberId_status_idx"
  ON "Invoice"("memberId", "status");

-- ─── CHECK constraints ───────────────────────────────────────────────────────

ALTER TABLE "MembershipPlan"
  DROP CONSTRAINT IF EXISTS "MembershipPlan_amountPaise_positive";
ALTER TABLE "MembershipPlan"
  ADD CONSTRAINT "MembershipPlan_amountPaise_positive" CHECK ("amountPaise" > 0);

ALTER TABLE "Invoice"
  DROP CONSTRAINT IF EXISTS "Invoice_amountPaise_positive";
ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_amountPaise_positive" CHECK ("amountPaise" > 0);

ALTER TABLE "Payment"
  DROP CONSTRAINT IF EXISTS "Payment_amountPaise_positive";
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_amountPaise_positive" CHECK ("amountPaise" > 0);

ALTER TABLE "PaymentMandate"
  DROP CONSTRAINT IF EXISTS "PaymentMandate_amountPaise_positive_or_null";
ALTER TABLE "PaymentMandate"
  ADD CONSTRAINT "PaymentMandate_amountPaise_positive_or_null"
  CHECK ("amountPaise" IS NULL OR "amountPaise" > 0);

-- ─── Partial unique indexes ──────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "Membership_one_current_per_member"
  ON "Membership"("memberId")
  WHERE "isCurrent" = true AND "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentMandate_one_open_per_member"
  ON "PaymentMandate"("memberId")
  WHERE "deletedAt" IS NULL
    AND status IN ('CREATED', 'PENDING', 'ACTIVE', 'PAUSED');

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_provider_payment_ref_unique"
  ON "Payment"(provider, "providerPaymentRef")
  WHERE "providerPaymentRef" IS NOT NULL
    AND provider IS NOT NULL
    AND "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_provider_order_ref_unique"
  ON "Payment"(provider, "providerOrderRef")
  WHERE "providerOrderRef" IS NOT NULL
    AND provider IS NOT NULL
    AND "deletedAt" IS NULL;

-- ─── Foreign keys: tighten financial integrity ───────────────────────────────

ALTER TABLE "PaymentAttempt" DROP CONSTRAINT IF EXISTS "PaymentAttempt_paymentId_fkey";
ALTER TABLE "PaymentAttempt"
  ADD CONSTRAINT "PaymentAttempt_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_mandateId_fkey";
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_mandateId_fkey"
  FOREIGN KEY ("mandateId") REFERENCES "PaymentMandate"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_invoiceId_fkey";
ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Receipt" DROP CONSTRAINT IF EXISTS "Receipt_paymentId_fkey";
ALTER TABLE "Receipt"
  ADD CONSTRAINT "Receipt_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Hard-delete / immutability guards ───────────────────────────────────────
-- Bypass for seed/tests: SET LOCAL app.allow_financial_delete = 'on';

CREATE OR REPLACE FUNCTION rjgc_allow_financial_delete()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('app.allow_financial_delete', true), '') = 'on';
$$;

CREATE OR REPLACE FUNCTION rjgc_deny_financial_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF rjgc_allow_financial_delete() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION
    'Hard delete of %.% is forbidden. Soft-delete members/mandates instead; financial history is retained.',
    TG_TABLE_SCHEMA, TG_TABLE_NAME
    USING ERRCODE = 'integrity_constraint_violation';
END;
$$;

DROP TRIGGER IF EXISTS payment_deny_hard_delete ON "Payment";
CREATE TRIGGER payment_deny_hard_delete
  BEFORE DELETE ON "Payment"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_financial_hard_delete();

DROP TRIGGER IF EXISTS payment_attempt_deny_hard_delete ON "PaymentAttempt";
CREATE TRIGGER payment_attempt_deny_hard_delete
  BEFORE DELETE ON "PaymentAttempt"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_financial_hard_delete();

DROP TRIGGER IF EXISTS receipt_deny_hard_delete ON "Receipt";
CREATE TRIGGER receipt_deny_hard_delete
  BEFORE DELETE ON "Receipt"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_financial_hard_delete();

DROP TRIGGER IF EXISTS invoice_deny_hard_delete ON "Invoice";
CREATE TRIGGER invoice_deny_hard_delete
  BEFORE DELETE ON "Invoice"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_financial_hard_delete();

DROP TRIGGER IF EXISTS webhook_deny_hard_delete ON "ProviderWebhookEvent";
CREATE TRIGGER webhook_deny_hard_delete
  BEFORE DELETE ON "ProviderWebhookEvent"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_financial_hard_delete();

CREATE OR REPLACE FUNCTION rjgc_deny_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF rjgc_allow_financial_delete() THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION
    'AuditLog is append-only. UPDATE/DELETE are forbidden.'
    USING ERRCODE = 'integrity_constraint_violation';
END;
$$;

DROP TRIGGER IF EXISTS audit_log_deny_update ON "AuditLog";
CREATE TRIGGER audit_log_deny_update
  BEFORE UPDATE ON "AuditLog"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_audit_mutation();

DROP TRIGGER IF EXISTS audit_log_deny_delete ON "AuditLog";
CREATE TRIGGER audit_log_deny_delete
  BEFORE DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_deny_audit_mutation();

-- SUCCESS/REFUNDED ledger rows: freeze identity + amount; status only SUCCESS→REFUNDED.
CREATE OR REPLACE FUNCTION rjgc_payment_settled_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF rjgc_allow_financial_delete() THEN
    RETURN NEW;
  END IF;

  IF OLD.status IN ('SUCCESS', 'REFUNDED') THEN
    IF NEW."amountPaise" IS DISTINCT FROM OLD."amountPaise"
       OR NEW.currency IS DISTINCT FROM OLD.currency
       OR NEW."memberId" IS DISTINCT FROM OLD."memberId"
       OR NEW."invoiceId" IS DISTINCT FROM OLD."invoiceId"
       OR NEW."mandateId" IS DISTINCT FROM OLD."mandateId"
       OR NEW.method IS DISTINCT FROM OLD.method THEN
      RAISE EXCEPTION
        'Settled payment % fields are immutable (amount/member/invoice/mandate/method/currency).',
        OLD.id
        USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    IF OLD.status = 'SUCCESS' AND NEW.status NOT IN ('SUCCESS', 'REFUNDED') THEN
      RAISE EXCEPTION
        'Payment % cannot move from SUCCESS to %.',
        OLD.id, NEW.status
        USING ERRCODE = 'integrity_constraint_violation';
    END IF;

    IF OLD.status = 'REFUNDED' AND NEW.status IS DISTINCT FROM 'REFUNDED' THEN
      RAISE EXCEPTION
        'Refunded payment % status is immutable.',
        OLD.id
        USING ERRCODE = 'integrity_constraint_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_settled_immutable ON "Payment";
CREATE TRIGGER payment_settled_immutable
  BEFORE UPDATE ON "Payment"
  FOR EACH ROW EXECUTE PROCEDURE rjgc_payment_settled_immutable();
