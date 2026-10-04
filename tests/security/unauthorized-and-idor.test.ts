import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  assertCanWritePayments,
  assertMemberOwnsResource,
  assertPermission,
  AuthorizationError,
} from "@/server/auth/authorize";
import { Permissions, hasPermission } from "@/server/domain/permissions";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { prismaMemberRepository } from "@/server/repositories/prisma/prisma-member-repository";
import {
  listMemberEventRegistrations,
  registerMemberForEvent,
} from "@/server/services/event-registration-service";

const prisma = new PrismaClient();
const suffix = `sec${Date.now().toString(36)}`;

describe("security: unauthorized access, IDOR, role escalation", () => {
  let memberAId: string;
  let memberBId: string;
  let eventId: string;

  beforeAll(async () => {
    const a = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-SEC-A-${suffix}`,
        firstName: "SecA",
        lastName: "Test",
        displayName: `[SAMPLE] SecA ${suffix}`,
        email: `seca.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    const b = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-SEC-B-${suffix}`,
        firstName: "SecB",
        lastName: "Test",
        displayName: `[SAMPLE] SecB ${suffix}`,
        email: `secb.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
      },
    });
    memberAId = a.id;
    memberBId = b.id;
    await prisma.payment.create({
      data: {
        memberId: memberAId,
        amountPaise: 4242,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerPaymentRef: `sec_a_${suffix}`,
        isSample: true,
      },
    });
    const event = await prisma.event.create({
      data: {
        slug: `sec-event-${suffix}`,
        title: `[SAMPLE] Sec Event ${suffix}`,
        startsAt: new Date(Date.now() + 86400_000),
        contentStatus: "PUBLISHED",
        status: "SCHEDULED",
        published: true,
        registrationRequired: true,
        isSample: true,
      },
    });
    eventId = event.id;
  });

  afterAll(async () => {
    await allowFinancialHardDelete(prisma);
    await prisma.eventRegistration.deleteMany({
      where: { memberId: { in: [memberAId, memberBId] } },
    });
    await prisma.payment.deleteMany({
      where: { memberId: { in: [memberAId, memberBId] } },
    });
    await prisma.event.delete({ where: { id: eventId } });
    await prisma.member.deleteMany({
      where: { id: { in: [memberAId, memberBId] } },
    });
    await prisma.$disconnect();
  });

  it("blocks unauthorized financial writes (role escalation)", () => {
    expect(() => assertCanWritePayments("MEMBER")).toThrow(AuthorizationError);
    expect(() => assertCanWritePayments("CONTENT_MANAGER")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanWritePayments("COMMITTEE_MEMBER")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanWritePayments("TREASURER")).not.toThrow();
    expect(hasPermission("PRESIDENT", Permissions.USERS_WRITE)).toBe(true);
    // Role changes still require SUPER_ADMIN in service layer — permission alone is insufficient.
    expect(hasPermission("PRESIDENT", Permissions.USERS_WRITE)).toBe(true);
    expect(hasPermission("TREASURER", Permissions.USERS_WRITE)).toBe(false);
  });

  it("blocks IDOR via ownership assert and scoped payment queries", async () => {
    expect(() => assertMemberOwnsResource(memberAId, memberBId)).toThrow(
      AuthorizationError,
    );

    const paymentsA = await prismaMemberRepository.getPayments(memberAId);
    expect(paymentsA.every((p) => p.memberId === memberAId)).toBe(true);
    expect(paymentsA.some((p) => p.memberId === memberBId)).toBe(false);
  });

  it("keeps event registrations isolated per member id", async () => {
    await registerMemberForEvent({
      memberId: memberAId,
      eventId,
    });
    const listA = await listMemberEventRegistrations(memberAId);
    const listB = await listMemberEventRegistrations(memberBId);
    expect(listA.some((r) => r.eventId === eventId)).toBe(true);
    expect(listB).toHaveLength(0);
  });

  it("denies admin content write to members", () => {
    expect(() =>
      assertPermission("MEMBER", Permissions.CONTENT_WRITE),
    ).toThrow(AuthorizationError);
    expect(() =>
      assertPermission("MEMBER", Permissions.ADMIN_ACCESS),
    ).toThrow(AuthorizationError);
  });
});
