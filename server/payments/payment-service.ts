import "server-only";

import { prisma } from "@/server/db/prisma";
import { getPaymentProvider } from "@/server/payments/factory";
import { paymentLog } from "@/server/payments/logging";
import { PaymentServiceError } from "@/server/payments/mandate-service";

/**
 * Create a provider payment in CREATED/PENDING state only.
 * SUCCESS is applied exclusively by verified webhook processing.
 */
export async function initiateMemberPayment(input: {
  memberId: string;
  amountPaise: number;
  mandateId?: string;
  actorUserId?: string;
}) {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, deletedAt: null },
  });
  if (!member) {
    throw new PaymentServiceError("Member not found.", "NOT_FOUND");
  }

  const provider = getPaymentProvider();
  const mandate = input.mandateId
    ? await prisma.paymentMandate.findFirst({
        where: { id: input.mandateId, memberId: member.id, deletedAt: null },
      })
    : null;

  const remote = await provider.createPayment({
    amountPaise: input.amountPaise,
    currency: "INR",
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

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        memberId: member.id,
        mandateId: mandate?.id,
        amountPaise: input.amountPaise,
        currency: "INR",
        status,
        method: mandate ? "MANDATE" : "OTHER",
        provider: provider.name,
        providerOrderRef: remote.providerOrderRef ?? null,
        // Payment id may arrive later via webhook (Razorpay order ≠ payment).
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
    mandateStatus: payment.mandate?.status ?? null,
    attemptCount: payment.attempts.length,
    latestAttemptStatus: payment.attempts[0]?.status ?? null,
    needsReconciliation:
      payment.status === "PENDING" ||
      payment.status === "AUTHORIZED" ||
      (payment.status === "SUCCESS" && !payment.receipt),
  }));
}
