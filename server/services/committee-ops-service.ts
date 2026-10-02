import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import { writeAuditEvent } from "@/server/services/audit-service";
import { z } from "zod";

const assignSchema = z.object({
  memberId: z.string().cuid(),
  positionId: z.string().cuid(),
  startsOn: z.coerce.date(),
});

/** Committee assignment changes always emit `committee.updated` audit events. */
export async function assignCommitteePosition(
  raw: unknown,
  actorUserId: string | null,
) {
  const parsed = assignSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid assignment.");
  }

  const assignment = await prisma.$transaction(async (tx) => {
    await tx.committeeAssignment.updateMany({
      where: {
        positionId: parsed.data.positionId,
        isCurrent: true,
        deletedAt: null,
      },
      data: { isCurrent: false, endsOn: new Date() },
    });

    return tx.committeeAssignment.create({
      data: {
        memberId: parsed.data.memberId,
        positionId: parsed.data.positionId,
        startsOn: parsed.data.startsOn,
        isCurrent: true,
        createdById: actorUserId,
      },
      include: {
        position: true,
        member: { select: { membershipNumber: true, displayName: true } },
      },
    });
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.COMMITTEE_UPDATED,
    entityType: "CommitteeAssignment",
    entityId: assignment.id,
    metadata: {
      positionCode: assignment.position.code,
      membershipNumber: assignment.member.membershipNumber,
      memberName: assignment.member.displayName,
    },
  });

  return assignment;
}
