-- Payment / mandate status realignment + webhook persistence

CREATE TYPE "WebhookProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'DUPLICATE_IGNORED');

CREATE TYPE "PaymentStatus_new" AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "MandateStatus_new" AS ENUM ('CREATED', 'PENDING', 'ACTIVE', 'PAUSED', 'FAILED', 'CANCELLED', 'EXPIRED');

ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment"
  ALTER COLUMN "status" TYPE "PaymentStatus_new"
  USING (
    CASE "status"::text
      WHEN 'RECORDED' THEN 'SUCCESS'
      WHEN 'PENDING_VERIFICATION' THEN 'PENDING'
      WHEN 'FAILED' THEN 'FAILED'
      WHEN 'REFUNDED' THEN 'REFUNDED'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      ELSE 'PENDING'
    END::"PaymentStatus_new"
  );
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"PaymentStatus_new";

ALTER TABLE "PaymentMandate" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PaymentMandate"
  ALTER COLUMN "status" TYPE "MandateStatus_new"
  USING (
    CASE "status"::text
      WHEN 'NOT_SETUP' THEN 'CREATED'
      WHEN 'PENDING' THEN 'PENDING'
      WHEN 'ACTIVE' THEN 'ACTIVE'
      WHEN 'PAUSED' THEN 'PAUSED'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      WHEN 'FAILED' THEN 'FAILED'
      ELSE 'CREATED'
    END::"MandateStatus_new"
  );
ALTER TABLE "PaymentMandate" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"MandateStatus_new";

DROP TYPE "PaymentStatus";
DROP TYPE "MandateStatus";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
ALTER TYPE "MandateStatus_new" RENAME TO "MandateStatus";

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "mandateId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "authorizedAt" TIMESTAMP(3);

ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "providerCustomerRef" TEXT;
ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "providerPlanRef" TEXT;
ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "providerSubscriptionRef" TEXT;
ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "amountPaise" INTEGER;
ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "PaymentMandate" ADD COLUMN IF NOT EXISTS "nextDebitAt" TIMESTAMP(3);

CREATE TABLE "ProviderWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "processingStatus" "WebhookProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProviderWebhookEvent_provider_providerEventId_key" ON "ProviderWebhookEvent"("provider", "providerEventId");
CREATE INDEX "ProviderWebhookEvent_eventType_idx" ON "ProviderWebhookEvent"("eventType");
CREATE INDEX "ProviderWebhookEvent_processingStatus_idx" ON "ProviderWebhookEvent"("processingStatus");
CREATE INDEX "ProviderWebhookEvent_createdAt_idx" ON "ProviderWebhookEvent"("createdAt");

CREATE INDEX "Payment_mandateId_idx" ON "Payment"("mandateId");
CREATE INDEX "PaymentMandate_providerSubscriptionRef_idx" ON "PaymentMandate"("providerSubscriptionRef");
CREATE INDEX "PaymentMandate_nextDebitAt_idx" ON "PaymentMandate"("nextDebitAt");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_mandateId_fkey" FOREIGN KEY ("mandateId") REFERENCES "PaymentMandate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
