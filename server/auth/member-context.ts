import "server-only";

import { requireMemberSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

export async function requireMemberId() {
  const session = await requireMemberSession();
  if (!session.user.memberId) {
    redirect("/login?error=AccessDenied");
  }
  return {
    session,
    userId: session.user.id,
    memberId: session.user.memberId,
  };
}
