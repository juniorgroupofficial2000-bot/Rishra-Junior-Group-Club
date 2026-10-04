"use server";

import {
  AuthorizationError,
  assertCanWriteMandates,
  assertCanWritePayments,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import {
  cancelMemberMandate,
  PaymentServiceError,
} from "@/server/payments/mandate-service";
import {
  initiateMemberPayment,
  requestPaymentRefund,
} from "@/server/payments/payment-service";
import { revalidatePath } from "next/cache";

export type AdminPaymentActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Admin-initiated payment. Amount is resolved from the member's current plan
 * when present — client-supplied amounts cannot override the plan.
 */
export async function adminInitiatePaymentAction(input: {
  memberId: string;
  /** Ignored when a current plan amount exists; kept for optional ad-hoc drafts. */
  amountPaise?: number;
}): Promise<AdminPaymentActionResult> {
  const session = await requireAdminSession("/admin/payments");
  try {
    assertCanWritePayments(session.user.role);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  try {
    await initiateMemberPayment({
      memberId: input.memberId,
      amountPaise: input.amountPaise,
      actorUserId: session.user.id,
    });
    revalidatePath("/admin/payments");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PaymentServiceError
          ? error.message
          : "Could not initiate payment.",
    };
  }
}

/**
 * Request a provider refund. Ledger becomes REFUNDED only after a verified webhook.
 */
export async function adminRequestRefundAction(input: {
  paymentId: string;
  amountPaise?: number;
  reason?: string;
}): Promise<AdminPaymentActionResult> {
  const session = await requireAdminSession("/admin/payments");
  try {
    assertCanWritePayments(session.user.role);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  try {
    await requestPaymentRefund({
      paymentId: input.paymentId,
      actorUserId: session.user.id,
      amountPaise: input.amountPaise,
      reason: input.reason,
    });
    revalidatePath("/admin/payments");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PaymentServiceError
          ? error.message
          : "Could not request refund.",
    };
  }
}

/**
 * Admin mandate cancellation — requires MANDATES_WRITE (not merely READ).
 */
export async function adminCancelMandateAction(input: {
  memberId: string;
}): Promise<AdminPaymentActionResult> {
  const session = await requireAdminSession("/admin/mandates");
  try {
    assertCanWriteMandates(session.user.role);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  try {
    await cancelMemberMandate({
      memberId: input.memberId,
      actorUserId: session.user.id,
    });
    revalidatePath("/admin/mandates");
    revalidatePath("/admin/payments");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PaymentServiceError
          ? error.message
          : "Could not cancel mandate.",
    };
  }
}
