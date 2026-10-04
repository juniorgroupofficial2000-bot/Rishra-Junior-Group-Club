import "server-only";

import { requireMemberSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { isMockRepositoryDriver } from "@/server/repositories";
import { redirect } from "next/navigation";

/**
 * Resolve the authenticated member id from the session only.
 * Never accepts memberId from request params/body (IDOR prevention).
 * Re-checks that the linked member is ACTIVE, not soft-deleted, and owned by the session user.
 */
export async function requireMemberId() {
  const session = await requireMemberSession();
  if (!session.user.memberId || !session.user.id) {
    redirect("/login?error=AccessDenied");
  }

  // Mock driver has no Prisma member rows for demo sessions.
  if (isMockRepositoryDriver()) {
    return {
      session,
      userId: session.user.id,
      memberId: session.user.memberId,
    };
  }

  const member = await prisma.member.findFirst({
    where: {
      id: session.user.memberId,
      userId: session.user.id,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!member) {
    redirect("/login?error=AccessDenied");
  }

  return {
    session,
    userId: session.user.id,
    memberId: member.id,
  };
}
