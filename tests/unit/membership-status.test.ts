import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  MemberAdminServiceError,
  updateMemberStatus,
} from "@/server/services/member-admin-service";

const prisma = new PrismaClient();
const suffix = `mst${Date.now().toString(36)}`;

describe("membership / member status transitions", () => {
  let memberId: string;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await hash("TempPass1!", 4);
    const user = await prisma.user.create({
      data: {
        email: `status.${suffix}@rjgc.local`,
        name: "Status Test",
        passwordHash,
        role: "MEMBER",
        active: true,
      },
    });
    userId = user.id;
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-ST-${suffix}`,
        firstName: "Status",
        lastName: "Test",
        displayName: `[SAMPLE] Status Test ${suffix}`,
        email: user.email,
        status: "PENDING",
        isSample: true,
        userId: user.id,
        internalNotes: "Status transition test",
      },
    });
    memberId = member.id;
  });

  afterAll(async () => {
    // Soft-delete member; leave user (AuditLog append-only may reference actor).
    await prisma.member.updateMany({
      where: { id: memberId },
      data: { deletedAt: new Date(), userId: null },
    });
    await prisma.user.updateMany({
      where: { id: userId },
      data: { active: false, email: `deleted.${suffix}@rjgc.local` },
    });
    await prisma.$disconnect();
  });

  it("activates a pending member and keeps portal user active", async () => {
    const updated = await updateMemberStatus(
      memberId,
      { status: "ACTIVE", reason: "Committee approved" },
      userId,
    );
    expect(updated.status).toBe("ACTIVE");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.active).toBe(true);
  });

  it("suspends a member and disables MEMBER portal login", async () => {
    const updated = await updateMemberStatus(
      memberId,
      { status: "SUSPENDED", reason: "Dues overdue" },
      userId,
    );
    expect(updated.status).toBe("SUSPENDED");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.active).toBe(false);
  });

  it("rejects unknown members and invalid payloads", async () => {
    await expect(
      updateMemberStatus("missing", { status: "ACTIVE" }),
    ).rejects.toBeInstanceOf(MemberAdminServiceError);

    await expect(
      updateMemberStatus(memberId, { status: "NOPE" }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
