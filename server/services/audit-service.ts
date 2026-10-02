import "server-only";

import { sanitizeAuditMetadata } from "@/server/audit/sanitize";
import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditEvent(input: {
  actorUserId: string | null | undefined;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue | Record<string, unknown>;
  ipAddress?: string | null;
}) {
  const sanitized = sanitizeAuditMetadata(input.metadata ?? null);

  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata:
        sanitized === null
          ? undefined
          : (sanitized as Prisma.InputJsonValue),
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export async function listAuditLogs(input?: {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
}) {
  const page = input?.page ?? 1;
  const pageSize = Math.min(input?.pageSize ?? 30, 100);
  const where: Prisma.AuditLogWhereInput = {
    ...(input?.action
      ? { action: { contains: input.action, mode: "insensitive" } }
      : {}),
    ...(input?.entityType
      ? { entityType: { contains: input.entityType, mode: "insensitive" } }
      : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, page, pageSize, items };
}
