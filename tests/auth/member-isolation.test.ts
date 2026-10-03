import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { allowFinancialHardDelete } from "@/server/db/financial-mutation";
import { assertMemberOwnsResource } from "@/server/auth/authorize";
import { prismaMemberRepository } from "@/server/repositories/prisma/prisma-member-repository";

const prisma = new PrismaClient();
const suffix = `iso${Date.now().toString(36)}`;

describe("member data isolation", () => {
  let memberAId: string;
  let memberBId: string;

  beforeAll(async () => {
    const memberA = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-ISO-A-${suffix}`,
        firstName: "Ada",
        lastName: "Alpha",
        displayName: `[SAMPLE] Ada Alpha ${suffix}`,
        email: `ada.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
        internalNotes: "Isolation test member A",
      },
    });
    const memberB = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-ISO-B-${suffix}`,
        firstName: "Bea",
        lastName: "Beta",
        displayName: `[SAMPLE] Bea Beta ${suffix}`,
        email: `bea.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
        internalNotes: "Isolation test member B",
      },
    });
    memberAId = memberA.id;
    memberBId = memberB.id;

    await prisma.payment.create({
      data: {
        memberId: memberAId,
        amountPaise: 1111,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerPaymentRef: `pay_a_${suffix}`,
        notes: "[SAMPLE] Member A only",
        isSample: true,
      },
    });
    await prisma.payment.create({
      data: {
        memberId: memberBId,
        amountPaise: 2222,
        status: "PENDING",
        method: "OTHER",
        provider: "mock",
        providerPaymentRef: `pay_b_${suffix}`,
        notes: "[SAMPLE] Member B only",
        isSample: true,
      },
    });
  });

  afterAll(async () => {
    await allowFinancialHardDelete(prisma);
    await prisma.payment.deleteMany({
      where: { memberId: { in: [memberAId, memberBId] } },
    });
    await prisma.member.deleteMany({
      where: { id: { in: [memberAId, memberBId] } },
    });
    await prisma.$disconnect();
  });

  it("does not return Member B payments when querying as Member A", async () => {
    const paymentsA = await prismaMemberRepository.getPayments(memberAId);
    const paymentsB = await prismaMemberRepository.getPayments(memberBId);

    expect(paymentsA).toHaveLength(1);
    expect(paymentsB).toHaveLength(1);
    expect(paymentsA.every((p) => p.memberId === memberAId)).toBe(true);
    expect(paymentsB.every((p) => p.memberId === memberBId)).toBe(true);
    expect(paymentsA.some((p) => p.memberId === memberBId)).toBe(false);
    expect(paymentsA[0]?.amountLabel).not.toBe(paymentsB[0]?.amountLabel);
  });

  it("rejects cross-member ownership checks used by actions", () => {
    expect(() => assertMemberOwnsResource(memberAId, memberBId)).toThrow();
    expect(() => assertMemberOwnsResource(memberAId, memberAId)).not.toThrow();
  });
});
