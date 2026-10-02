"use server";

import { requireMemberId } from "@/server/auth/member-context";
import {
  cancelMemberMandate,
  PaymentServiceError,
  setupMemberMandate,
} from "@/server/payments/mandate-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setupMandateAction() {
  const { memberId, userId } = await requireMemberId();

  try {
    // Amount is resolved server-side from the member's current plan — never from the client.
    await setupMemberMandate({
      memberId,
      actorUserId: userId,
    });
  } catch (error) {
    const message =
      error instanceof PaymentServiceError
        ? error.message
        : "Could not start mandate setup.";
    redirect(`/member/mandate?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/member/mandate");
  revalidatePath("/member/dashboard");
  redirect("/member/mandate?started=1");
}

export async function cancelMandateAction() {
  const { memberId, userId } = await requireMemberId();
  try {
    await cancelMemberMandate({ memberId, actorUserId: userId });
  } catch (error) {
    const message =
      error instanceof PaymentServiceError
        ? error.message
        : "Could not cancel mandate.";
    redirect(`/member/mandate?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/member/mandate");
  revalidatePath("/member/dashboard");
  redirect("/member/mandate?cancelled=1");
}
