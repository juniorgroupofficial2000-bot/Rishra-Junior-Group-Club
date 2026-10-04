import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/server/db/prisma";
import { getPaymentProvider } from "@/server/payments/factory";
import { paymentLog } from "@/server/payments/logging";
import { logPaymentFailure } from "@/server/observability/events";
import { PaymentServiceError } from "@/server/payments/mandate-service";
import { applyVerifiedWebhookEvent } from "@/server/payments/webhook-processor";

/**
 * Create a provider payment in CREATED/PENDING state only.
 * SUCCESS is applied exclusively by verified webhook processing
 * (or server-side provider fetch during reconciliation — never browser callbacks).
 */
export async function initiateMemberPayment(input: {
  memberId: string;
  /** Optional. When a current plan exists, plan amount is authoritative. */
  amountPaise?: number;
  mandateId?: string;
  actorUserId?: string;
}) {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, deletedAt: null },
  });
  if (!member) {
    throw new PaymentServiceError("Member not found.", "NOT_FOUND");
  }

  const membership = await prisma.membership.findFirst({
    where: { memberId: member.id, deletedAt: null, isCurrent: true },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });

  const planAmount = membership?.plan?.amountPaise;
  if (planAmount != null && planAmount > 0) {
    if (
      input.amountPaise != null &&
      input.amountPaise !== planAmount
    ) {
      throw new PaymentServiceError(
        "Payment amount must match the member's current membership plan.",
        "INVALID_STATE",
      );
    }
  }

  const amountPaise = planAmount && planAmount > 0 ? planAmount : input.amountPaise;
  if (!Number.isInteger(amountPaise) || !amountPaise || amountPaise <= 0) {
    throw new PaymentServiceError(
      "Payment amount must be a positive integer (paise).",
      "INVALID_STATE",
    );
  }

  const provider = getPaymentProvider();
  const mandate = input.mandateId
    ? await prisma.paymentMandate.findFirst({
        where: { id: input.mandateId, memberId: member.id, deletedAt: null },
      })
    : null;

  const remote = await provider.createPayment({
    amountPaise,
    currency: membership?.plan?.currency || "INR",
    memberId: member.id,
    providerCustomerRef: mandate?.providerCustomerRef ?? undefined,
    providerMandateRef: mandate?.providerMandateRef ?? undefined,
  });

  // Even if mock returns FAILED immediately, persist that failure from provider response.
  // SUCCESS from createPayment is treated as PENDING until webhook confirms (except FAILED).
  const status =
    remote.status === "FAILED"
      ? "FAILED"
      : remote.status === "CANCELLED"
        ? "CANCELLED"
        : "PENDING";

  const currency = membership?.plan?.currency || "INR";

  const payment = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        memberId: member.id,
        membershipId: membership?.id,
        number: `INV-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`.toUpperCase(),
        amountPaise,
        currency,
        status: "ISSUED",
        issuedOn: new Date(),
        dueOn: new Date(),
        notes: "Issued for checkout / provider order.",
        createdById: input.actorUserId,
      },
    });

    const created = await tx.payment.create({
      data: {
        memberId: member.id,
        mandateId: mandate?.id,
        invoiceId: invoice.id,
        amountPaise,
        currency,
        status,
        method: mandate ? "MANDATE" : "OTHER",
        provider: provider.name,
        providerOrderRef: remote.providerOrderRef ?? null,
        providerPaymentRef: remote.providerPaymentRef,
        notes:
          status === "FAILED"
            ? remote.failureMessage ?? "Provider reported failure."
            : "Awaiting verified webhook confirmation for success.",
        paidAt: null,
        createdById: input.actorUserId,
        isSample: provider.name === "mock",
      },
    });

    await tx.paymentAttempt.create({
      data: {
        paymentId: created.id,
        status: status === "FAILED" ? "FAILED" : "STARTED",
        provider: provider.name,
        providerAttemptRef:
          remote.providerOrderRef ?? remote.providerPaymentRef,
        failureCode: remote.failureCode,
        failureMessage: remote.failureMessage,
      },
    });

    return created;
  });

  paymentLog.info("payment_initiated", {
    paymentId: payment.id,
    status: payment.status,
    provider: provider.name,
  });

  return payment;
}

/**
 * Request a provider refund. Local status becomes REFUNDED only via verified
 * webhook (or reconciliation fetch) — never from the browser.
 */
export async function requestPaymentRefund(input: {
  paymentId: string;
  actorUserId: string;
  amountPaise?: number;
  reason?: string;
}) {
  const payment = await prisma.payment.findFirst({
    where: { id: input.paymentId, deletedAt: null },
  });
  if (!payment) {
    throw new PaymentServiceError("Payment not found.", "NOT_FOUND");
  }
  if (payment.status !== "SUCCESS") {
    throw new PaymentServiceError(
      "Only successful payments can be refunded.",
      "INVALID_STATE",
    );
  }
  if (!payment.providerPaymentRef) {
    throw new PaymentServiceError(
      "Payment has no provider reference to refund.",
      "INVALID_STATE",
    );
  }

  const amountPaise = input.amountPaise ?? payment.amountPaise;
  if (
    !Number.isInteger(amountPaise) ||
    amountPaise <= 0 ||
    amountPaise > payment.amountPaise
  ) {
    throw new PaymentServiceError(
      "Refund amount must be a positive integer not exceeding the payment.",
      "INVALID_AMOUNT",
    );
  }

  const provider = getPaymentProvider();
  const refund = await provider.refundPayment({
    providerPaymentRef: payment.providerPaymentRef,
    amountPaise,
    reason: input.reason,
  });

  if (!refund) {
    throw new PaymentServiceError(
      "Provider does not support refunds.",
      "PROVIDER",
    );
  }

  await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      status: refund.status === "FAILED" ? "FAILED" : "STARTED",
      provider: provider.name,
      providerAttemptRef: refund.providerRefundRef,
      failureMessage:
        refund.status === "FAILED"
          ? "Provider rejected refund request."
          : "Refund requested — awaiting verified webhook confirmation.",
    },
  });

  paymentLog.info("refund_requested", {
    paymentId: payment.id,
    providerRefundRef: refund.providerRefundRef,
    actorUserId: input.actorUserId,
    status: refund.status,
  });

  return refund;
}

export async function listPaymentAttempts(limit = 100) {
  return prisma.paymentAttempt.findMany({
    include: {
      payment: {
        include: {
          member: {
            select: {
              id: true,
              displayName: true,
              membershipNumber: true,
            },
          },
        },
      },
    },
    orderBy: { attemptedAt: "desc" },
    take: limit,
  });
}

export async function listPaymentsForReconciliation(limit = 100) {
  const payments = await prisma.payment.findMany({
    where: { deletedAt: null },
    include: {
      member: {
        select: { id: true, displayName: true, membershipNumber: true },
      },
      mandate: {
        select: { id: true, status: true, providerMandateRef: true },
      },
      invoice: { select: { id: true, number: true, status: true } },
      attempts: { orderBy: { attemptedAt: "desc" }, take: 3 },
      receipt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return payments.map((payment) => ({
    id: payment.id,
    memberName: payment.member.displayName,
    membershipNumber: payment.member.membershipNumber,
    amountPaise: payment.amountPaise,
    status: payment.status,
    method: payment.method,
    provider: payment.provider,
    providerPaymentRef: payment.providerPaymentRef,
    paidAt: payment.paidAt,
    receiptNumber: payment.receipt?.number ?? null,
    invoiceNumber: payment.invoice?.number ?? null,
    invoiceStatus: payment.invoice?.status ?? null,
    mandateStatus: payment.mandate?.status ?? null,
    attemptCount: payment.attempts.length,
    latestAttemptStatus: payment.attempts[0]?.status ?? null,
    needsReconciliation:
      payment.status === "PENDING" ||
      payment.status === "AUTHORIZED" ||
      (payment.status === "SUCCESS" && !payment.receipt),
  }));
}

/**
 * Server-side reconciliation against the provider API for delayed webhooks /
 * provider outages. Uses provider fetch responses — never browser callbacks.
 */
export async function reconcileStalePendingPayments(input?: {
  olderThanMs?: number;
  limit?: number;
}) {
  const olderThanMs = input?.olderThanMs ?? 6 * 60 * 60_000;
  const limit = input?.limit ?? 50;
  const cutoff = new Date(Date.now() - olderThanMs);
  const provider = getPaymentProvider();

  const stale = await prisma.payment.findMany({
    where: {
      deletedAt: null,
      status: { in: ["PENDING", "AUTHORIZED"] },
      provider: provider.name,
      providerPaymentRef: { not: null },
      updatedAt: { lt: cutoff },
    },
    take: limit,
    orderBy: { updatedAt: "asc" },
  });

  const results: Array<{
    paymentId: string;
    outcome: "updated" | "unchanged" | "error";
    remoteStatus?: string;
    error?: string;
  }> = [];

  for (const payment of stale) {
    try {
      const remote = await provider.fetchPayment(payment.providerPaymentRef!);
      if (
        remote.status !== "SUCCESS" &&
        remote.status !== "FAILED" &&
        remote.status !== "REFUNDED" &&
        remote.status !== "CANCELLED"
      ) {
        results.push({
          paymentId: payment.id,
          outcome: "unchanged",
          remoteStatus: remote.status,
        });
        continue;
      }

      const eventId = `reconcile:fetch:${payment.id}:${remote.status}:${remote.providerPaymentRef ?? "none"}`;
      await prisma.$transaction(async (tx) => {
        const existing = await tx.providerWebhookEvent.findUnique({
          where: {
            provider_providerEventId: {
              provider: provider.name,
              providerEventId: eventId,
            },
          },
        });
        if (existing?.processingStatus === "PROCESSED") {
          return;
        }
        const row =
          existing ??
          (await tx.providerWebhookEvent.create({
            data: {
              provider: provider.name,
              providerEventId: eventId,
              eventType: "reconciliation.fetch",
              payload: {
                source: "provider_fetch",
                paymentId: payment.id,
                remoteStatus: remote.status,
              },
              signatureValid: true,
              processingStatus: "PROCESSING",
              processingStartedAt: new Date(),
            },
          }));

        await applyVerifiedWebhookEvent(
          tx,
          {
            providerEventId: eventId,
            eventType: "reconciliation.fetch",
            payload: { source: "provider_fetch" },
            paymentRef: remote.providerPaymentRef ?? payment.providerPaymentRef,
            orderRef: remote.providerOrderRef ?? payment.providerOrderRef,
            paymentStatus: remote.status,
            amountPaise: remote.amountPaise,
            occurredAt: remote.paidAt ?? new Date(),
          },
          provider.name,
        );

        await tx.providerWebhookEvent.update({
          where: { id: row.id },
          data: {
            processingStatus: "PROCESSED",
            processedAt: new Date(),
            errorMessage: null,
          },
        });
      });

      results.push({
        paymentId: payment.id,
        outcome: "updated",
        remoteStatus: remote.status,
      });
    } catch (error) {
      logPaymentFailure({
        event: "reconciliation_payment_failed",
        paymentId: payment.id,
        error,
      });
      results.push({
        paymentId: payment.id,
        outcome: "error",
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  paymentLog.info("reconciliation_batch", {
    scanned: stale.length,
    updated: results.filter((r) => r.outcome === "updated").length,
    errors: results.filter((r) => r.outcome === "error").length,
  });

  return results;
}
