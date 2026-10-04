import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  cancelMemberEventRegistration,
  EventRegistrationError,
  listMemberEventRegistrations,
  registerMemberForEvent,
} from "@/server/services/event-registration-service";

const prisma = new PrismaClient();
const suffix = `evt${Date.now().toString(36)}`;

describe("event registration integration", () => {
  let activeMemberId: string;
  let suspendedMemberId: string;
  let publishedEventId: string;
  let draftEventId: string;
  let pastEventId: string;

  beforeAll(async () => {
    const active = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-EVT-A-${suffix}`,
        firstName: "Active",
        lastName: "Reg",
        displayName: `[SAMPLE] Active Reg ${suffix}`,
        email: `evt.a.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    const suspended = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-EVT-S-${suffix}`,
        firstName: "Susp",
        lastName: "Reg",
        displayName: `[SAMPLE] Susp Reg ${suffix}`,
        email: `evt.s.${suffix}@rjgc.local`,
        status: "SUSPENDED",
        isSample: true,
      },
    });
    activeMemberId = active.id;
    suspendedMemberId = suspended.id;

    const published = await prisma.event.create({
      data: {
        slug: `reg-pub-${suffix}`,
        title: `[SAMPLE] Published Event ${suffix}`,
        description: "Registration test",
        startsAt: new Date(Date.now() + 7 * 86400_000),
        contentStatus: "PUBLISHED",
        status: "SCHEDULED",
        published: true,
        registrationRequired: true,
        capacity: 50,
        isSample: true,
      },
    });
    const draft = await prisma.event.create({
      data: {
        slug: `reg-draft-${suffix}`,
        title: `[SAMPLE] Draft Event ${suffix}`,
        startsAt: new Date(Date.now() + 7 * 86400_000),
        contentStatus: "DRAFT",
        status: "DRAFT",
        published: false,
        isSample: true,
      },
    });
    const past = await prisma.event.create({
      data: {
        slug: `reg-past-${suffix}`,
        title: `[SAMPLE] Past Event ${suffix}`,
        startsAt: new Date(Date.now() - 14 * 86400_000),
        endsAt: new Date(Date.now() - 13 * 86400_000),
        contentStatus: "PUBLISHED",
        status: "COMPLETED",
        published: true,
        isSample: true,
      },
    });
    publishedEventId = published.id;
    draftEventId = draft.id;
    pastEventId = past.id;
  });

  afterAll(async () => {
    await prisma.eventRegistration.deleteMany({
      where: { memberId: { in: [activeMemberId, suspendedMemberId] } },
    });
    await prisma.event.deleteMany({
      where: { id: { in: [publishedEventId, draftEventId, pastEventId] } },
    });
    await prisma.member.deleteMany({
      where: { id: { in: [activeMemberId, suspendedMemberId] } },
    });
    await prisma.$disconnect();
  });

  it("registers an active member and lists the registration", async () => {
    const reg = await registerMemberForEvent({
      memberId: activeMemberId,
      eventId: publishedEventId,
    });
    expect(reg.status).toBe("REGISTERED");

    const list = await listMemberEventRegistrations(activeMemberId);
    expect(list.some((r) => r.eventId === publishedEventId)).toBe(true);
  });

  it("rejects duplicate registration", async () => {
    await expect(
      registerMemberForEvent({
        memberId: activeMemberId,
        eventId: publishedEventId,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects suspended members, draft events, and past events", async () => {
    await expect(
      registerMemberForEvent({
        memberId: suspendedMemberId,
        eventId: publishedEventId,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(
      registerMemberForEvent({
        memberId: activeMemberId,
        eventId: draftEventId,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    await expect(
      registerMemberForEvent({
        memberId: activeMemberId,
        eventId: pastEventId,
      }),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("cancels only the owning member registration", async () => {
    const cancelled = await cancelMemberEventRegistration({
      memberId: activeMemberId,
      eventId: publishedEventId,
    });
    expect(cancelled.status).toBe("CANCELLED");

    await expect(
      cancelMemberEventRegistration({
        memberId: suspendedMemberId,
        eventId: publishedEventId,
      }),
    ).rejects.toBeInstanceOf(EventRegistrationError);

    const list = await listMemberEventRegistrations(activeMemberId);
    expect(list.some((r) => r.eventId === publishedEventId)).toBe(false);
  });
});
