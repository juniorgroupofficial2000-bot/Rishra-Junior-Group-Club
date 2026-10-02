import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import type { AppRole } from "@/server/domain/roles";
import { writeAuditEvent } from "@/server/services/audit-service";
import { hash } from "bcryptjs";
import { z } from "zod";

const createAdminSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(1).max(120),
  role: z.enum([
    "SUPER_ADMIN",
    "PRESIDENT",
    "SECRETARY",
    "TREASURER",
    "VICE_PRESIDENT",
    "COMMITTEE_MEMBER",
    "CONTENT_MANAGER",
    "EVENT_MANAGER",
  ]),
  temporaryPassword: z.string().min(10).max(128),
});

const changeRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum([
    "SUPER_ADMIN",
    "PRESIDENT",
    "SECRETARY",
    "TREASURER",
    "VICE_PRESIDENT",
    "COMMITTEE_MEMBER",
    "CONTENT_MANAGER",
    "EVENT_MANAGER",
    "MEMBER",
  ]),
});

/**
 * Admin identity operations with mandatory audit events.
 * Never logs password hashes or secrets in audit metadata.
 */
export async function createAdminUser(
  raw: unknown,
  actorUserId: string | null,
) {
  const parsed = createAdminSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid admin payload.");
  }

  const passwordHash = await hash(parsed.data.temporaryPassword, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
      active: true,
      createdById: actorUserId,
      updatedById: actorUserId,
    },
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.ADMIN_CREATED,
    entityType: "User",
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
      // temporaryPassword intentionally omitted
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AppRole,
  };
}

export async function changeAdminPermission(
  raw: unknown,
  actorUserId: string | null,
) {
  const parsed = changeRoleSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid role payload.");
  }

  const existing = await prisma.user.findFirst({
    where: { id: parsed.data.userId, deletedAt: null },
  });
  if (!existing) throw new Error("User not found.");

  const previousRole = existing.role;
  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: {
      role: parsed.data.role,
      updatedById: actorUserId,
    },
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.ADMIN_PERMISSION_CHANGED,
    entityType: "User",
    entityId: updated.id,
    metadata: {
      previousRole,
      role: updated.role,
      email: updated.email,
    },
  });

  return {
    id: updated.id,
    email: updated.email,
    role: updated.role as AppRole,
    previousRole: previousRole as AppRole,
  };
}
