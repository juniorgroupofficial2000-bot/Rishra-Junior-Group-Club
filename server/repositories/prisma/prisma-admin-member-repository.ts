import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import type {
  AdminMemberRecord,
  AdminMemberRepository,
  AdminMemberSearchParams,
} from "@/server/repositories/contracts/admin-member-repository";
import { toAdminMemberRecord } from "@/server/repositories/prisma/mappers";
import { writeAuditEvent } from "@/server/services/audit-service";
import type { Prisma } from "@prisma/client";

const memberInclude = {
  memberships: {
    where: { deletedAt: null },
    include: { plan: true },
    orderBy: { updatedAt: "desc" as const },
    take: 3,
  },
} satisfies Prisma.MemberInclude;

function buildWhere(
  params: Omit<AdminMemberSearchParams, "page" | "pageSize">,
): Prisma.MemberWhereInput {
  const where: Prisma.MemberWhereInput = {};

  if (!params.includeDeleted) {
    where.deletedAt = null;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (typeof params.sampleOnly === "boolean") {
    where.isSample = params.sampleOnly;
  }

  if (params.query?.trim()) {
    const q = params.query.trim();
    where.OR = [
      { membershipNumber: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

async function writeAudit(input: {
  actorUserId: string | null;
  action: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: "Member",
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

export const prismaAdminMemberRepository: AdminMemberRepository = {
  async create(input, actorUserId) {
    const member = await prisma.$transaction(async (tx) => {
      const created = await tx.member.create({
        data: {
          membershipNumber: input.membershipNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          email: input.email,
          phone: input.phone,
          status: input.status,
          joinedOn: input.joinedOn ?? null,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          internalNotes: input.internalNotes,
          userId: input.userId ?? null,
          createdById: actorUserId,
          updatedById: actorUserId,
          isSample: false,
        },
        include: memberInclude,
      });

      if (input.planId) {
        await tx.membership.create({
          data: {
            memberId: created.id,
            planId: input.planId,
            status: "ACTIVE",
            isCurrent: true,
            startsOn: new Date(),
            createdById: actorUserId,
            updatedById: actorUserId,
          },
        });
      }

      return tx.member.findUniqueOrThrow({
        where: { id: created.id },
        include: memberInclude,
      });
    });

    await writeAudit({
      actorUserId,
      action: AuditActions.MEMBER_CREATED,
      entityId: member.id,
      metadata: { membershipNumber: member.membershipNumber },
    });

    return toAdminMemberRecord(member);
  },

  async update(id, input, actorUserId) {
    const existing = await prisma.member.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new Error("Member not found.");
    }

    await prisma.member.update({
      where: { id },
      data: {
        ...(input.membershipNumber !== undefined
          ? { membershipNumber: input.membershipNumber }
          : {}),
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.displayName !== undefined
          ? { displayName: input.displayName }
          : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.joinedOn !== undefined ? { joinedOn: input.joinedOn } : {}),
        ...(input.addressLine1 !== undefined
          ? { addressLine1: input.addressLine1 }
          : {}),
        ...(input.addressLine2 !== undefined
          ? { addressLine2: input.addressLine2 }
          : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.state !== undefined ? { state: input.state } : {}),
        ...(input.postalCode !== undefined
          ? { postalCode: input.postalCode }
          : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.internalNotes !== undefined
          ? { internalNotes: input.internalNotes }
          : {}),
        ...(input.userId !== undefined ? { userId: input.userId } : {}),
        updatedById: actorUserId,
      },
    });

    if (input.planId) {
      await prisma.$transaction(async (tx) => {
        await tx.membership.updateMany({
          where: { memberId: id, isCurrent: true, deletedAt: null },
          data: { isCurrent: false, updatedById: actorUserId },
        });
        await tx.membership.create({
          data: {
            memberId: id,
            planId: input.planId!,
            status: "ACTIVE",
            isCurrent: true,
            startsOn: new Date(),
            createdById: actorUserId,
            updatedById: actorUserId,
          },
        });
      });
    }

    const refreshed = await prisma.member.findUniqueOrThrow({
      where: { id },
      include: memberInclude,
    });

    await writeAudit({
      actorUserId,
      action: AuditActions.MEMBER_UPDATED,
      entityId: id,
      metadata: { fields: Object.keys(input) },
    });

    return toAdminMemberRecord(refreshed);
  },

  async softDelete(id, actorUserId) {
    const member = await prisma.member.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: actorUserId,
        status: "INACTIVE",
      },
      select: { userId: true },
    });

    // Soft-deleted members must lose portal login immediately.
    if (member.userId) {
      await prisma.user.update({
        where: { id: member.userId },
        data: { active: false, updatedById: actorUserId },
      });
    }

    await writeAudit({
      actorUserId,
      action: AuditActions.MEMBER_DELETED,
      entityId: id,
    });
  },

  async findById(id, includeDeleted = false) {
    const member = await prisma.member.findFirst({
      where: includeDeleted ? { id } : { id, deletedAt: null },
      include: memberInclude,
    });
    return member ? toAdminMemberRecord(member) : null;
  },

  async search(params) {
    const where = buildWhere(params);
    const skip = (params.page - 1) * params.pageSize;

    const [total, rows] = await prisma.$transaction([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        include: memberInclude,
        orderBy: [{ updatedAt: "desc" }, { membershipNumber: "asc" }],
        skip,
        take: params.pageSize,
      }),
    ]);

    return {
      items: rows.map(toAdminMemberRecord),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  async setStatus(id, status, actorUserId, reason) {
    const member = await prisma.member.update({
      where: { id },
      data: {
        status,
        updatedById: actorUserId,
      },
      include: memberInclude,
    });

    // Keep linked login entitlement aligned with membership status.
    if (member.userId) {
      const portalAllowed = status === "ACTIVE";
      await prisma.user.update({
        where: { id: member.userId },
        data: { active: portalAllowed, updatedById: actorUserId },
      });
    }

    await writeAudit({
      actorUserId,
      action: AuditActions.MEMBER_STATUS_CHANGED,
      entityId: id,
      metadata: { status, reason: reason ?? null },
    });

    return toAdminMemberRecord(member);
  },

  async listForExport(params) {
    const where = buildWhere(params);
    const rows = await prisma.member.findMany({
      where,
      include: memberInclude,
      orderBy: { membershipNumber: "asc" },
      take: 500,
    });
    return rows.map(toAdminMemberRecord);
  },
};

export type { AdminMemberRecord };
