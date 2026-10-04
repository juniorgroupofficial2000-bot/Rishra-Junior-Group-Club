-- Persist provider order ids separately from payment ids (Razorpay orders ≠ payments).
ALTER TABLE "Payment" ADD COLUMN "providerOrderRef" TEXT;

CREATE INDEX "Payment_providerOrderRef_idx" ON "Payment"("providerOrderRef");
