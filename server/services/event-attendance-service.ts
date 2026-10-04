import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import { writeAuditEvent } from "@/server/services/audit-service";
import type { AttendanceStatus } from "@prisma/client";

export class EventAttendanceError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INVALID_STATE" = "INVALID_STATE",
  ) {
    super(message);
    this.name = "EventAttendanceError";
  }
}

export async function recordEventAttendance(input: {
  eventId: string;
  memberId: string;
  status: Extract<AttendanceStatus, "PRESENT" | "ABSENT">;
  actorUserId: string | null;
}) {
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, deletedAt: null },
  });
  if (!event) {
    throw new EventAttendanceError("Event not found.", "NOT_FOUND");
  }

  const member = await prisma.member.findFirst({
    where: { id: input.memberId, deletedAt: null },
  });
  if (!member) {
    throw new EventAttendanceError("Member not found.", "NOT_FOUND");
  }

  const row = await prisma.eventAttendance.upsert({
    where: {
      eventId_memberId: {
        eventId: input.eventId,
        memberId: input.memberId,
      },
    },
    create: {
      eventId: input.eventId,
      memberId: input.memberId,
      status: input.status,
      recordedById: input.actorUserId,
      recordedAt: new Date(),
    },
    update: {
      status: input.status,
      recordedById: input.actorUserId,
      recordedAt: new Date(),
      deletedAt: null,
    },
  });

  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: AuditActions.EVENT_ATTENDANCE_RECORDED,
    entityType: "EventAttendance",
    entityId: row.id,
    metadata: {
      eventId: input.eventId,
      memberId: input.memberId,
      status: input.status,
    },
  });

  return row;
}
