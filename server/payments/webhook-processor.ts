import { notifyFromVerifiedWebhook } from "@/server/notifications/payment-hooks";
import type { PaymentProvider } from "@/server/payments/provider";
import { paymentLog } from "@/server/payments/logging";
import type { VerifiedWebhookEvent } from "@/server/payments/types";
import type {
  MandateStatus,
  PaymentStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

export class WebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookSignatureError";
  }
}

export type WebhookProcessResult =
  | { status: "processed"; eventId: string }
  | { status: "duplicate"; eventId: string }
  | { status: "failed"; eventId?: string; error: string };

/**
 * Verify, persist, and apply a provider webhook with:
 * - signature verification
 * - idempotency via unique (provider, providerEventId)
 * - retry-safe / transaction-safe DB updates
 */
export async function processProviderWebhook(input: {
  prisma: PrismaClient;
  provider: PaymentProvider;
  rawBody: string;
  signatureHeader: string | null;
}): Promise<WebhookProcessResult> {
  let verified: VerifiedWebhookEvent;
  try {
    verified = await input.provider.verifyWebhook({
      rawBody: input.rawBody,
      signatureHeader: input.signatureHeader,
    });
  } catch (error) {
    paymentLog.error("webhook_signature_invalid", {
      provider: input.provider.name,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw new WebhookSignatureError(
      error instanceof Error ? error.message : "Invalid webhook signature.",
    );
  }

  const provider = input.provider.name;

  try {
    const result = await input.prisma.$transaction(async (tx) => {
      const existing = await tx.providerWebhookEvent.findUnique({
        where: {
          provider_providerEventId: {
            provider,
            providerEventId: verified.providerEventId,
          },
        },
      });

      if (existing?.processingStatus === "PROCESSED") {
        paymentLog.info("webhook_duplicate_ignored", {
          provider,
          providerEventId: verified.providerEventId,
        });
        return {
          status: "duplicate" as const,
          eventId: existing.id,
        };
      }

      if (existing?.processingStatus === "PROCESSING") {
        paymentLog.warn("webhook_already_processing", {
          provider,
          providerEventId: verified.providerEventId,
        });
        return {
          status: "duplicate" as const,
          eventId: existing.id,
        };
      }

      const eventRow =
        existing ??
        (await tx.providerWebhookEvent.create({
          data: {
            provider,
            providerEventId: verified.providerEventId,
            eventType: verified.eventType,
            payload: verified.payload as Prisma.InputJsonValue,
            signatureValid: true,
            processingStatus: "RECEIVED",
          },
        }));

      await tx.providerWebhookEvent.update({
        where: { id: eventRow.id },
        data: { processingStatus: "PROCESSING" },
      });

      await applyVerifiedWebhookEvent(tx, verified, provider);

      await tx.providerWebhookEvent.update({
        where: { id: eventRow.id },
        data: {
          processingStatus: "PROCESSED",
          processedAt: new Date(),
          errorMessage: null,
        },
      });

      paymentLog.info("webhook_processed", {
        provider,
        providerEventId: verified.providerEventId,
        eventType: verified.eventType,
      });

      return { status: "processed" as const, eventId: eventRow.id };
    });

    if (result.status === "processed") {
      await notifyFromVerifiedWebhook(verified).catch((error) => {
        paymentLog.warn("webhook_notification_failed", {
          error: error instanceof Error ? error.message : "unknown",
          providerEventId: verified.providerEventId,
        });
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    paymentLog.error("webhook_processing_failed", {
      provider,
      providerEventId: verified.providerEventId,
      error: message,
    });

    await input.prisma.providerWebhookEvent
      .upsert({
        where: {
          provider_providerEventId: {
            provider,
            providerEventId: verified.providerEventId,
          },
        },
        create: {
          provider,
          providerEventId: verified.providerEventId,
          eventType: verified.eventType,
          payload: verified.payload as Prisma.InputJsonValue,
          signatureValid: true,
          processingStatus: "FAILED",
          errorMessage: message,
        },
        update: {
          processingStatus: "FAILED",
          errorMessage: message,
        },
      })
      .catch(() => undefined);

    return { status: "failed", error: message };
  }
}

type Tx = Prisma.TransactionClient;

export async function applyVerifiedWebhookEvent(
  tx: Tx,
  event: VerifiedWebhookEvent,
  provider: string,
) {
  if (event.mandateRef && event.mandateStatus) {
    await updateMandateFromWebhook(tx, {
      provider,
      mandateRef: event.mandateRef,
      subscriptionRef: event.subscriptionRef ?? event.mandateRef,
      status: event.mandateStatus as MandateStatus,
      nextDebitAt: event.nextDebitAt ?? null,
      note: `Updated from verified webhook ${event.eventType}`,
    });
  }

  if (event.paymentRef && event.paymentStatus) {
    await updatePaymentFromWebhook(tx, {
      provider,
      paymentRef: event.paymentRef,
      orderRef: event.orderRef,
      status: event.paymentStatus as PaymentStatus,
      amountPaise: event.amountPaise,
      failureCode: event.failureCode,
      failureMessage: event.failureMessage,
      occurredAt: event.occurredAt ?? new Date(),
      mandateRef: event.mandateRef,
    });
  }

  // Recurring debit failure/success events that only carry subscription + amount
  if (
    !event.paymentRef &&
    event.mandateRef &&
    (event.eventType.includes("charged") ||
      event.eventType.includes("payment.failed") ||
      event.eventType === "subscription.charged" ||
      event.eventType === "recurring.debit.failed")
  ) {
    await recordRecurringDebitFromWebhook(tx, {
      provider,
      mandateRef: event.mandateRef,
      status: (event.paymentStatus ??
        (event.eventType.includes("fail")
          ? "FAILED"
          : "PENDING")) as PaymentStatus,
      amountPaise: event.amountPaise ?? undefined,
      failureCode: event.failureCode,
      failureMessage: event.failureMessage,
      occurredAt: event.occurredAt ?? new Date(),
      eventType: event.eventType,
    });
  }
}

async function updateMandateFromWebhook(
  tx: Tx,
  input: {
    provider: string;
    mandateRef: string;
    subscriptionRef: string;
    status: MandateStatus;
    nextDebitAt: Date | null;
    note: string;
  },
) {
  const mandate = await tx.paymentMandate.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { providerMandateRef: input.mandateRef },
        { providerSubscriptionRef: input.subscriptionRef },
      ],
    },
  });
  if (!mandate) {
    paymentLog.warn("webhook_mandate_not_found", {
      mandateRef: input.mandateRef,
    });
    return;
  }

  await tx.paymentMandate.update({
    where: { id: mandate.id },
    data: {
      status: input.status,
      nextDebitAt: input.nextDebitAt ?? mandate.nextDebitAt,
      lastStatusAt: new Date(),
      note: input.note,
      provider: input.provider,
    },
  });
}

async function updatePaymentFromWebhook(
  tx: Tx,
  input: {
    provider: string;
    paymentRef: string;
    orderRef?: string | null;
    status: PaymentStatus;
    amountPaise?: number | null;
    failureCode?: string | null;
    failureMessage?: string | null;
    occurredAt: Date;
    mandateRef?: string | null;
  },
) {
  let payment = await tx.payment.findFirst({
    where: { providerPaymentRef: input.paymentRef, deletedAt: null },
  });

  // Razorpay: local row is keyed by order id until the payment id is known.
  if (!payment && input.orderRef) {
    payment = await tx.payment.findFirst({
      where: { providerOrderRef: input.orderRef, deletedAt: null },
    });
  }

  if (!payment && input.mandateRef) {
    const mandate = await tx.paymentMandate.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { providerMandateRef: input.mandateRef },
          { providerSubscriptionRef: input.mandateRef },
        ],
      },
    });
    if (mandate) {
      // Amount must match mandate when provided — reject silent under/over billing.
      if (
        input.amountPaise != null &&
        mandate.amountPaise != null &&
        input.amountPaise !== mandate.amountPaise
      ) {
        paymentLog.warn("webhook_amount_mismatch", {
          paymentRef: input.paymentRef,
          expected: mandate.amountPaise,
          received: input.amountPaise,
        });
        throw new Error("Webhook amount does not match mandate amount.");
      }
      payment = await tx.payment.create({
        data: {
          memberId: mandate.memberId,
          mandateId: mandate.id,
          amountPaise: input.amountPaise ?? mandate.amountPaise ?? 0,
          currency: mandate.currency,
          status: "CREATED",
          method: "MANDATE",
          provider: input.provider,
          providerOrderRef: input.orderRef ?? null,
          providerPaymentRef: input.paymentRef,
        },
      });
    }
  }

  if (!payment) {
    paymentLog.warn("webhook_payment_not_found", {
      paymentRef: input.paymentRef,
      orderRef: input.orderRef ?? null,
    });
    return;
  }

  if (
    input.amountPaise != null &&
    payment.amountPaise !== input.amountPaise &&
    input.status === "SUCCESS"
  ) {
    paymentLog.warn("webhook_amount_mismatch", {
      paymentId: payment.id,
      expected: payment.amountPaise,
      received: input.amountPaise,
    });
    throw new Error("Webhook amount does not match payment amount.");
  }

  // Do not claim SUCCESS unless verified webhook says SUCCESS.
  const paidAt =
    input.status === "SUCCESS" ? input.occurredAt : payment.paidAt;
  const authorizedAt =
    input.status === "AUTHORIZED" || input.status === "SUCCESS"
      ? payment.authorizedAt ?? input.occurredAt
      : payment.authorizedAt;

  await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: input.status,
      paidAt,
      authorizedAt,
      provider: input.provider,
      providerOrderRef: input.orderRef ?? payment.providerOrderRef,
      providerPaymentRef: input.paymentRef,
      notes:
        input.failureMessage ??
        payment.notes ??
        `Status ${input.status} via verified webhook`,
    },
  });

  await tx.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status:
        input.status === "SUCCESS"
          ? "SUCCEEDED"
          : input.status === "FAILED"
            ? "FAILED"
            : input.status === "CANCELLED"
              ? "CANCELLED"
              : "STARTED",
      provider: input.provider,
      providerAttemptRef: input.paymentRef,
      failureCode: input.failureCode,
      failureMessage: input.failureMessage,
      attemptedAt: input.occurredAt,
    },
  });

  if (input.status === "SUCCESS") {
    const existingReceipt = await tx.receipt.findUnique({
      where: { paymentId: payment.id },
    });
    if (!existingReceipt) {
      await tx.receipt.create({
        data: {
          paymentId: payment.id,
          number: `RJGC-RCPT-${payment.id.slice(-10).toUpperCase()}`,
          issuedOn: input.occurredAt,
        },
      });
    }
  }
}

async function recordRecurringDebitFromWebhook(
  tx: Tx,
  input: {
    provider: string;
    mandateRef: string;
    status: PaymentStatus;
    amountPaise?: number;
    failureCode?: string | null;
    failureMessage?: string | null;
    occurredAt: Date;
    eventType: string;
  },
) {
  const mandate = await tx.paymentMandate.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { providerMandateRef: input.mandateRef },
        { providerSubscriptionRef: input.mandateRef },
      ],
    },
  });
  if (!mandate) return;

  const payment = await tx.payment.create({
    data: {
      memberId: mandate.memberId,
      mandateId: mandate.id,
      amountPaise: input.amountPaise ?? mandate.amountPaise ?? 0,
      currency: mandate.currency,
      status: input.status,
      method: "MANDATE",
      provider: input.provider,
      providerPaymentRef: `wh_${input.eventType}_${input.occurredAt.getTime()}`,
      paidAt: input.status === "SUCCESS" ? input.occurredAt : null,
      notes: input.failureMessage ?? `Recurring debit via ${input.eventType}`,
    },
  });

  await tx.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status: input.status === "SUCCESS" ? "SUCCEEDED" : "FAILED",
      provider: input.provider,
      failureCode: input.failureCode,
      failureMessage: input.failureMessage,
      attemptedAt: input.occurredAt,
    },
  });

  if (input.status === "FAILED") {
    await tx.paymentMandate.update({
      where: { id: mandate.id },
      data: {
        lastStatusAt: input.occurredAt,
        note: `Recurring debit failed: ${input.failureMessage ?? input.failureCode ?? "unknown"}`,
      },
    });
  }
}
