import { randomUUID } from "node:crypto";

import { notifyFromVerifiedWebhook } from "@/server/notifications/payment-hooks";
import { WebhookNonRetryableError } from "@/server/payments/errors";
import type { PaymentProvider } from "@/server/payments/provider";
import { createScopedLog } from "@/server/observability/logger";

const webhookLog = createScopedLog("webhooks");
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
  | {
      status: "failed";
      eventId?: string;
      error: string;
      /** When false, HTTP layer should acknowledge without provider retry. */
      retryable: boolean;
    };

/** Stale PROCESSING rows older than this may be retried (crash recovery). */
const STALE_PROCESSING_MS = 2 * 60_000;

const TERMINAL_PAYMENT_STATUSES = new Set<PaymentStatus>([
  "SUCCESS",
  "REFUNDED",
  "CANCELLED",
]);

const CLOSED_MANDATE_STATUSES = new Set<MandateStatus>([
  "CANCELLED",
  "EXPIRED",
]);

function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function resolveAmountPaise(
  preferred: number | null | undefined,
  fallback: number | null | undefined,
): number {
  const amount = preferred ?? fallback;
  if (amount == null || amount <= 0) {
    throw new WebhookNonRetryableError(
      "Payment amount must be a positive paise value.",
    );
  }
  return amount;
}

/**
 * Monotonic payment status transitions for webhook updates.
 * SUCCESS may only move to REFUNDED; REFUNDED/CANCELLED are terminal.
 */
export function nextPaymentStatus(
  current: PaymentStatus,
  incoming: PaymentStatus,
): PaymentStatus | null {
  if (current === incoming) {
    return current;
  }
  if (current === "REFUNDED" || current === "CANCELLED") {
    return null;
  }
  if (current === "SUCCESS") {
    return incoming === "REFUNDED" ? "REFUNDED" : null;
  }
  return incoming;
}

async function issueInvoice(
  tx: Tx,
  input: {
    memberId: string;
    amountPaise: number;
    currency: string;
  },
) {
  const number = `INV-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`.toUpperCase();
  return tx.invoice.create({
    data: {
      memberId: input.memberId,
      number,
      amountPaise: input.amountPaise,
      currency: input.currency,
      status: "ISSUED",
      issuedOn: new Date(),
      dueOn: new Date(),
      notes: "Issued for provider payment / recurring debit.",
    },
  });
}

async function markInvoicePaid(tx: Tx, invoiceId: string | null | undefined) {
  if (!invoiceId) return;
  await tx.invoice.updateMany({
    where: {
      id: invoiceId,
      status: { in: ["DRAFT", "ISSUED", "OVERDUE"] },
    },
    data: { status: "PAID" },
  });
}

/**
 * Verify, persist, and apply a provider webhook with:
 * - signature verification
 * - idempotency via unique (provider, providerEventId)
 * - claim locking for PROCESSING
 * - monotonic settled payment status
 * - invoice + receipt updates on SUCCESS
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
    webhookLog.error("webhook_signature_invalid", {
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
        webhookLog.info("webhook_duplicate_ignored", {
          provider,
          providerEventId: verified.providerEventId,
        });
        return {
          status: "duplicate" as const,
          eventId: existing.id,
        };
      }

      if (existing?.processingStatus === "PROCESSING") {
        const started = existing.processingStartedAt ?? existing.updatedAt;
        const ageMs = Date.now() - started.getTime();
        if (ageMs < STALE_PROCESSING_MS) {
          webhookLog.warn("webhook_already_processing", {
            provider,
            providerEventId: verified.providerEventId,
          });
          return {
            status: "duplicate" as const,
            eventId: existing.id,
          };
        }
        webhookLog.warn("webhook_stale_processing_retry", {
          provider,
          providerEventId: verified.providerEventId,
          ageMs,
        });
      }

      let eventRow = existing;
      if (!eventRow) {
        try {
          eventRow = await tx.providerWebhookEvent.create({
            data: {
              provider,
              providerEventId: verified.providerEventId,
              eventType: verified.eventType,
              payload: verified.payload as Prisma.InputJsonValue,
              signatureValid: true,
              processingStatus: "RECEIVED",
            },
          });
        } catch (error) {
          if (!isPrismaUniqueViolation(error)) {
            throw error;
          }
          eventRow = await tx.providerWebhookEvent.findUniqueOrThrow({
            where: {
              provider_providerEventId: {
                provider,
                providerEventId: verified.providerEventId,
              },
            },
          });
          if (eventRow.processingStatus === "PROCESSED") {
            return {
              status: "duplicate" as const,
              eventId: eventRow.id,
            };
          }
        }
      }

      const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);
      const claimed = await tx.providerWebhookEvent.updateMany({
        where: {
          id: eventRow.id,
          OR: [
            { processingStatus: { in: ["RECEIVED", "FAILED"] } },
            {
              processingStatus: "PROCESSING",
              processingStartedAt: { lt: staleBefore },
            },
          ],
        },
        data: {
          processingStatus: "PROCESSING",
          processingStartedAt: new Date(),
          errorMessage: null,
        },
      });

      if (claimed.count === 0) {
        return {
          status: "duplicate" as const,
          eventId: eventRow.id,
        };
      }

      await applyVerifiedWebhookEvent(tx, verified, provider);

      await tx.providerWebhookEvent.update({
        where: { id: eventRow.id },
        data: {
          processingStatus: "PROCESSED",
          processedAt: new Date(),
          errorMessage: null,
        },
      });

      webhookLog.info("webhook_processed", {
        provider,
        providerEventId: verified.providerEventId,
        eventType: verified.eventType,
      });

      return { status: "processed" as const, eventId: eventRow.id };
    });

    if (result.status === "processed") {
      await notifyFromVerifiedWebhook(verified).catch((error) => {
        webhookLog.warn("webhook_notification_failed", {
          error: error instanceof Error ? error.message : "unknown",
          providerEventId: verified.providerEventId,
        });
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    const retryable = !(error instanceof WebhookNonRetryableError);
    webhookLog.error("webhook_processing_failed", {
      provider,
      providerEventId: verified.providerEventId,
      error: message,
      retryable,
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

    return { status: "failed", error: message, retryable };
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

  let paymentPathHandled = false;
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
    paymentPathHandled = true;
  }

  // Recurring debit events without a provider payment id (synthetic ledger row).
  // Never run when the payment path already handled the same event.
  if (
    !paymentPathHandled &&
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
    webhookLog.warn("webhook_mandate_not_found", {
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
    where: {
      providerPaymentRef: input.paymentRef,
      deletedAt: null,
      provider: input.provider,
    },
  });

  // Razorpay: local row is keyed by order id until the payment id is known.
  if (!payment && input.orderRef) {
    payment = await tx.payment.findFirst({
      where: {
        providerOrderRef: input.orderRef,
        deletedAt: null,
        provider: input.provider,
      },
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
      if (
        CLOSED_MANDATE_STATUSES.has(mandate.status) &&
        input.status !== "REFUNDED"
      ) {
        throw new WebhookNonRetryableError(
          `Cannot create payment for closed mandate (${mandate.status}).`,
        );
      }
      if (
        input.amountPaise != null &&
        mandate.amountPaise != null &&
        input.amountPaise !== mandate.amountPaise
      ) {
        webhookLog.warn("webhook_amount_mismatch", {
          paymentRef: input.paymentRef,
          expected: mandate.amountPaise,
          received: input.amountPaise,
        });
        throw new WebhookNonRetryableError(
          "Webhook amount does not match mandate amount.",
        );
      }
      const amountPaise = resolveAmountPaise(
        input.amountPaise,
        mandate.amountPaise,
      );
      const invoice = await issueInvoice(tx, {
        memberId: mandate.memberId,
        amountPaise,
        currency: mandate.currency,
      });
      payment = await tx.payment.create({
        data: {
          memberId: mandate.memberId,
          mandateId: mandate.id,
          invoiceId: invoice.id,
          amountPaise,
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
    webhookLog.warn("webhook_payment_not_found", {
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
    webhookLog.warn("webhook_amount_mismatch", {
      paymentId: payment.id,
      expected: payment.amountPaise,
      received: input.amountPaise,
    });
    throw new WebhookNonRetryableError(
      "Webhook amount does not match payment amount.",
    );
  }

  const status = nextPaymentStatus(payment.status, input.status);
  if (!status) {
    webhookLog.info("webhook_status_ignored", {
      paymentId: payment.id,
      current: payment.status,
      incoming: input.status,
    });
    if (TERMINAL_PAYMENT_STATUSES.has(payment.status)) {
      await tx.paymentAttempt.create({
        data: {
          paymentId: payment.id,
          status: "CANCELLED",
          provider: input.provider,
          providerAttemptRef: `${input.paymentRef}:ignored:${randomUUID().slice(0, 8)}`,
          failureCode: input.failureCode ?? "STATUS_IGNORED",
          failureMessage:
            input.failureMessage ??
            `Ignored transition ${payment.status} → ${input.status}`,
          attemptedAt: input.occurredAt,
        },
      });
    }
    return;
  }

  const paidAt =
    status === "SUCCESS" ? (payment.paidAt ?? input.occurredAt) : payment.paidAt;
  const authorizedAt =
    status === "AUTHORIZED" || status === "SUCCESS"
      ? (payment.authorizedAt ?? input.occurredAt)
      : payment.authorizedAt;

  await tx.payment.update({
    where: { id: payment.id },
    data: {
      status,
      paidAt,
      authorizedAt,
      provider: input.provider,
      providerOrderRef: input.orderRef ?? payment.providerOrderRef,
      providerPaymentRef: input.paymentRef,
      notes:
        input.failureMessage ??
        payment.notes ??
        `Status ${status} via verified webhook`,
    },
  });

  await tx.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status:
        status === "SUCCESS"
          ? "SUCCEEDED"
          : status === "FAILED"
            ? "FAILED"
            : status === "CANCELLED" || status === "REFUNDED"
              ? "CANCELLED"
              : "STARTED",
      provider: input.provider,
      providerAttemptRef: input.paymentRef,
      failureCode: input.failureCode,
      failureMessage: input.failureMessage,
      attemptedAt: input.occurredAt,
    },
  });

  if (status === "SUCCESS") {
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
    await markInvoicePaid(tx, payment.invoiceId);
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

  if (CLOSED_MANDATE_STATUSES.has(mandate.status)) {
    throw new WebhookNonRetryableError(
      `Ignoring recurring debit for closed mandate (${mandate.status}).`,
    );
  }

  const amountPaise = resolveAmountPaise(
    input.amountPaise,
    mandate.amountPaise,
  );

  const providerPaymentRef = `wh_${input.eventType}_${input.occurredAt.getTime()}_${randomUUID().slice(0, 8)}`;

  const existing = await tx.payment.findFirst({
    where: {
      provider: input.provider,
      providerPaymentRef,
      deletedAt: null,
    },
  });
  if (existing) {
    webhookLog.info("webhook_recurring_duplicate_ignored", {
      paymentId: existing.id,
      providerPaymentRef,
    });
    return;
  }

  const invoice = await issueInvoice(tx, {
    memberId: mandate.memberId,
    amountPaise,
    currency: mandate.currency,
  });

  const payment = await tx.payment.create({
    data: {
      memberId: mandate.memberId,
      mandateId: mandate.id,
      invoiceId: invoice.id,
      amountPaise,
      currency: mandate.currency,
      status: input.status,
      method: "MANDATE",
      provider: input.provider,
      providerPaymentRef,
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

  if (input.status === "SUCCESS") {
    await tx.receipt.create({
      data: {
        paymentId: payment.id,
        number: `RJGC-RCPT-${payment.id.slice(-10).toUpperCase()}`,
        issuedOn: input.occurredAt,
      },
    });
    await markInvoicePaid(tx, invoice.id);
  }

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
