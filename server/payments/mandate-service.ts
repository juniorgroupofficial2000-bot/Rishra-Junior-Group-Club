import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import {
  getNotificationService,
  resolveMemberRecipient,
} from "@/server/notifications/service";
import { NotificationEvents } from "@/server/notifications/types";
import { getPaymentProvider } from "@/server/payments/factory";
import { paymentLog } from "@/server/payments/logging";
import { logPaymentFailure } from "@/server/observability/events";
import { writeAuditEvent } from "@/server/services/audit-service";

export class PaymentServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "INVALID_STATE"
      | "INVALID_AMOUNT"
      | "PROVIDER" = "PROVIDER",
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

/**
 * Start mandate setup for a member. Status remains PENDING until a verified
 * webhook confirms ACTIVE — never claimed successful from the provider create call alone.
 * Amount is taken from the member's current membership plan — never from client input.
 */
export async function setupMemberMandate(input: {
  memberId: string;
  actorUserId: string;
  planName?: string;
}) {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, deletedAt: null },
    include: { user: true },
  });
  if (!member) {
    throw new PaymentServiceError("Member not found.", "NOT_FOUND");
  }

  const membership = await prisma.membership.findFirst({
    where: { memberId: member.id, deletedAt: null, isCurrent: true },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!membership?.plan || !membership.plan.active) {
    throw new PaymentServiceError(
      "No active membership plan is assigned. Contact the treasurer.",
      "INVALID_STATE",
    );
  }
  if (membership.plan.amountPaise < 100) {
    throw new PaymentServiceError(
      "Membership plan amount is not configured for billing.",
      "INVALID_STATE",
    );
  }
  const amountPaise = membership.plan.amountPaise;

  const existing = await prisma.paymentMandate.findFirst({
    where: {
      memberId: member.id,
      deletedAt: null,
      status: { in: ["CREATED", "PENDING", "ACTIVE", "PAUSED"] },
    },
  });
  if (existing) {
    throw new PaymentServiceError(
      "An open mandate already exists for this member.",
      "INVALID_STATE",
    );
  }

  const provider = getPaymentProvider();

  try {
    const customer = await provider.createCustomer({
      email: member.email,
      name: member.displayName,
      memberId: member.id,
    });
    const plan = await provider.createPlan({
      name:
        input.planName ??
        `${membership.plan.name} (${member.membershipNumber})`,
      amountPaise,
      currency: membership.plan.currency || "INR",
      interval:
        membership.plan.billingCycle === "YEARLY" ? "yearly" : "monthly",
    });
    const mandate = await provider.createMandate({
      providerCustomerRef: customer.providerCustomerRef,
      providerPlanRef: plan.providerPlanRef,
      memberId: member.id,
    });

    // Persist as PENDING/CREATED from provider response — SUCCESS/ACTIVE only via webhook confirmation path when provider reports it.
    // createMandate may return PENDING; we never force ACTIVE here.
    const status =
      mandate.status === "ACTIVE" ? "PENDING" : mandate.status === "CREATED"
        ? "CREATED"
        : "PENDING";

    const setupNote = mandate.setupUrl
      ? `Mandate setup initiated. Complete authorization at the provider URL. Active status requires a verified webhook.`
      : "Mandate setup initiated. Active status requires a verified provider webhook.";

    const row = await prisma.paymentMandate.create({
      data: {
        memberId: member.id,
        status,
        provider: provider.name,
        providerCustomerRef: customer.providerCustomerRef,
        providerPlanRef: plan.providerPlanRef,
        providerMandateRef: mandate.providerMandateRef,
        providerSubscriptionRef: mandate.providerSubscriptionRef,
        amountPaise,
        currency: membership.plan.currency || "INR",
        nextDebitAt: mandate.nextDebitAt,
        note: setupNote,
        lastStatusAt: new Date(),
        isSample: provider.name === "mock",
      },
    });

    await writeAuditEvent({
      actorUserId: input.actorUserId,
      action: AuditActions.MANDATE_CREATED,
      entityType: "PaymentMandate",
      entityId: row.id,
      metadata: {
        provider: provider.name,
        providerMandateRef: mandate.providerMandateRef,
        status: row.status,
      },
    });

    const recipient = await resolveMemberRecipient(member.id);
    if (recipient) {
      await getNotificationService().notifyEvent({
        event: NotificationEvents.MANDATE_CREATED,
        recipient,
        data: {
          providerMandateRef: mandate.providerMandateRef,
          status: row.status,
        },
      });
    }

    paymentLog.info("mandate_setup_initiated", {
      mandateId: row.id,
      provider: provider.name,
      status: row.status,
    });

    return {
      mandateId: row.id,
      status: row.status,
      setupUrl: mandate.setupUrl ?? null,
      provider: provider.name,
      mode: provider.mode,
      nextDebitAt: row.nextDebitAt,
    };
  } catch (error) {
    logPaymentFailure({
      event: "mandate_setup_failed",
      memberId: member.id,
      error,
    });
    throw new PaymentServiceError(
      error instanceof Error ? error.message : "Mandate setup failed.",
      "PROVIDER",
    );
  }
}

export async function cancelMemberMandate(input: {
  memberId: string;
  actorUserId: string;
}) {
  const mandate = await prisma.paymentMandate.findFirst({
    where: {
      memberId: input.memberId,
      deletedAt: null,
      status: { in: ["PENDING", "ACTIVE", "PAUSED", "CREATED"] },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!mandate?.providerMandateRef) {
    throw new PaymentServiceError("No cancellable mandate found.", "NOT_FOUND");
  }

  const provider = getPaymentProvider();
  const remote = await provider.cancelMandate(mandate.providerMandateRef);

  const updated = await prisma.paymentMandate.update({
    where: { id: mandate.id },
    data: {
      status: remote.status === "CANCELLED" ? "CANCELLED" : "PENDING",
      lastStatusAt: new Date(),
      note:
        remote.status === "CANCELLED"
          ? "Cancellation requested; confirmed by provider response."
          : "Cancellation requested; awaiting verified webhook confirmation.",
    },
  });

  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: AuditActions.MANDATE_CANCELLED,
    entityType: "PaymentMandate",
    entityId: updated.id,
    metadata: {
      provider: provider.name,
      providerStatus: remote.status,
      localStatus: updated.status,
    },
  });

  if (updated.status === "CANCELLED") {
    const recipient = await resolveMemberRecipient(input.memberId);
    if (recipient) {
      await getNotificationService().notifyEvent({
        event: NotificationEvents.MANDATE_CANCELLED,
        recipient,
        data: { providerMandateRef: updated.providerMandateRef },
      });
    }
  }

  return updated;
}

export async function getMemberMandateView(memberId: string) {
  const membership = await prisma.membership.findFirst({
    where: { memberId, deletedAt: null, isCurrent: true },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });

  const mandate = await prisma.paymentMandate.findFirst({
    where: { memberId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  const latestFailed = await prisma.payment.findFirst({
    where: { memberId, deletedAt: null, status: "FAILED" },
    orderBy: { createdAt: "desc" },
  });

  return {
    mandate,
    latestFailedPayment: latestFailed,
    plan: membership?.plan
      ? {
          name: membership.plan.name,
          amountPaise: membership.plan.amountPaise,
          currency: membership.plan.currency,
          billingCycle: membership.plan.billingCycle,
        }
      : null,
  };
}
