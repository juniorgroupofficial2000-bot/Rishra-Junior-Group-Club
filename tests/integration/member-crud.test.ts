import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  createMember,
  getMemberForAdmin,
  MemberAdminServiceError,
  softDeleteMember,
  updateMember,
} from "@/server/services/member-admin-service";

const prisma = new PrismaClient();
const suffix = `crud${Date.now().toString(36)}`;
const createdIds: string[] = [];

describe("member CRUD integration", () => {
  beforeAll(async () => {
    // Ensure prisma driver path is used by repositories.
    process.env.REPOSITORY_DRIVER = "prisma";
  });

  afterAll(async () => {
    if (createdIds.length) {
      await prisma.member.deleteMany({ where: { id: { in: createdIds } } });
    }
    await prisma.$disconnect();
  });

  it("creates, reads, updates, and soft-deletes a member", async () => {
    const created = await createMember({
      membershipNumber: `RJGC-CRUD-${suffix}`,
      firstName: "Create",
      lastName: "Update",
      displayName: `[SAMPLE] CRUD ${suffix}`,
      email: `crud.${suffix}@rjgc.local`,
      status: "PENDING",
      phone: "9876543210",
      country: "IN",
      internalNotes: "CRUD integration test",
    });
    createdIds.push(created.id);

    const loaded = await getMemberForAdmin(created.id);
    expect(loaded.membershipNumber).toBe(`RJGC-CRUD-${suffix}`);
    expect(loaded.email).toBe(`crud.${suffix}@rjgc.local`);

    const updated = await updateMember(created.id, {
      firstName: "Updated",
      displayName: `[SAMPLE] Updated ${suffix}`,
    });
    expect(updated.firstName).toBe("Updated");

    await softDeleteMember(created.id);
    await expect(getMemberForAdmin(created.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects duplicate membership numbers", async () => {
    const first = await createMember({
      membershipNumber: `RJGC-DUP-${suffix}`,
      firstName: "One",
      lastName: "Dup",
      displayName: `[SAMPLE] Dup ${suffix}`,
      email: `dup1.${suffix}@rjgc.local`,
      status: "PENDING",
      country: "IN",
    });
    createdIds.push(first.id);

    await expect(
      createMember({
        membershipNumber: `RJGC-DUP-${suffix}`,
        firstName: "Two",
        lastName: "Dup",
        displayName: `[SAMPLE] Dup2 ${suffix}`,
        email: `dup2.${suffix}@rjgc.local`,
        status: "PENDING",
        country: "IN",
      }),
    ).rejects.toBeInstanceOf(MemberAdminServiceError);
  });

  it("rejects invalid create payloads", async () => {
    await expect(
      createMember({
        membershipNumber: "x",
        firstName: "",
        lastName: "X",
        displayName: "X",
        email: "not-email",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
