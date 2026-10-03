import "server-only";

import { prisma } from "@/server/db/prisma";
import { notifyEventRegistration } from "@/server/notifications/ops";

export class EventRegistrationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "INVALID_STATE"
      | "CONFLICT"
      | "FULL" = "INVALID_STATE",
  ) {
    super(message);
    this.name = "EventRegistrationError";
  }
}

/**
 * Register an ACTIVE member for a published event that requires registration.
 * `memberId` must come from the session — never from an untrusted client id alone.
 */
export async function registerMemberForEvent(input: {
  memberId: string;
  eventId: string;
}) {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, deletedAt: null },
  });
  if (!member) {
    throw new EventRegistrationError("Member not found.", "NOT_FOUND");
  }
  if (member.status !== "ACTIVE") {
    throw new EventRegistrationError(
      "Only active members can register for events.",
      "FORBIDDEN",
    );
  }

  const event = await prisma.event.findFirst({
    where: {
      id: input.eventId,
      deletedAt: null,
      contentStatus: "PUBLISHED",
    },
  });
  if (!event) {
    throw new EventRegistrationError("Event not found.", "NOT_FOUND");
  }
  if (!event.registrationRequired) {
    throw new EventRegistrationError(
      "This event does not require registration.",
      "INVALID_STATE",
    );
  }
  if (event.endsAt && event.endsAt.getTime() < Date.now()) {
    throw new EventRegistrationError(
      "Cannot register for a past event.",
      "INVALID_STATE",
    );
  }

  const existing = await prisma.eventRegistration.findFirst({
    where: {
      eventId: event.id,
      memberId: member.id,
      deletedAt: null,
      status: { in: ["REGISTERED", "WAITLISTED"] },
    },
  });
  if (existing) {
    throw new EventRegistrationError(
      "Already registered for this event.",
      "CONFLICT",
    );
  }

  const registration = await prisma.$transaction(async (tx) => {
    const activeCount = await tx.eventRegistration.count({
      where: {
        eventId: event.id,
        deletedAt: null,
        status: "REGISTERED",
      },
    });

    const atCapacity =
      event.capacity != null && activeCount >= event.capacity;

    return tx.eventRegistration.create({
      data: {
        eventId: event.id,
        memberId: member.id,
        status: atCapacity ? "WAITLISTED" : "REGISTERED",
      },
    });
  });

  await notifyEventRegistration({
    memberId: member.id,
    eventId: event.id,
  });

  return registration;
}

/** Cancel the caller's own registration (soft-cancel). */
export async function cancelMemberEventRegistration(input: {
  memberId: string;
  eventId: string;
}) {
  const registration = await prisma.eventRegistration.findFirst({
    where: {
      eventId: input.eventId,
      memberId: input.memberId,
      deletedAt: null,
      status: { in: ["REGISTERED", "WAITLISTED"] },
    },
  });
  if (!registration) {
    throw new EventRegistrationError(
      "Registration not found.",
      "NOT_FOUND",
    );
  }

  return prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: "CANCELLED" },
  });
}

export async function listMemberEventRegistrations(memberId: string) {
  return prisma.eventRegistration.findMany({
    where: {
      memberId,
      deletedAt: null,
      status: { in: ["REGISTERED", "WAITLISTED"] },
    },
    include: {
      event: {
        select: { id: true, title: true, slug: true, startsAt: true },
      },
    },
    orderBy: { registeredAt: "desc" },
  });
}

export async function getEventRegistrationStats(eventId: string) {
  const [registered, waitlisted, attended] = await Promise.all([
    prisma.eventRegistration.count({
      where: { eventId, deletedAt: null, status: "REGISTERED" },
    }),
    prisma.eventRegistration.count({
      where: { eventId, deletedAt: null, status: "WAITLISTED" },
    }),
    prisma.eventAttendance.count({
      where: {
        eventId,
        deletedAt: null,
        status: { in: ["PRESENT", "ABSENT"] },
      },
    }),
  ]);
  return { registered, waitlisted, attended };
}

export async function listEventRegistrationsForAdmin(eventId: string) {
  return prisma.eventRegistration.findMany({
    where: {
      eventId,
      deletedAt: null,
      status: { in: ["REGISTERED", "WAITLISTED", "CANCELLED"] },
    },
    include: {
      member: {
        select: {
          id: true,
          membershipNumber: true,
          displayName: true,
          email: true,
          status: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { registeredAt: "asc" }],
  });
}

export async function listEventAttendanceForAdmin(eventId: string) {
  return prisma.eventAttendance.findMany({
    where: { eventId, deletedAt: null },
    include: {
      member: {
        select: {
          id: true,
          membershipNumber: true,
          displayName: true,
          email: true,
        },
      },
    },
    orderBy: { recordedAt: "desc" },
  });
}
