import "server-only";

import {
  designationLabel,
  isCommitteeDesignation,
} from "@/server/domain/committee-designations";
import { allocateMembershipNumber } from "@/server/domain/membership-number";
import { prisma } from "@/server/db/prisma";
import { AuditActions } from "@/server/audit/actions";
import { writeAuditEvent } from "@/server/services/audit-service";
import { slugifyCommitteeName } from "@/lib/committees/slug";
import type { CommitteeKind, ContentStatus, Prisma } from "@prisma/client";
import { z } from "zod";

export class OrgCommitteeError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "NOT_FOUND" | "CONFLICT" = "VALIDATION",
  ) {
    super(message);
    this.name = "OrgCommitteeError";
  }
}

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const kindSchema = z.enum(["EXECUTIVE", "SUB"]);

export const committeeUpsertSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case."),
  summary: z.string().trim().max(280).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  responsibilities: z.string().trim().max(8000).optional().nullable(),
  iconKey: z.string().trim().max(64).optional().nullable(),
  coverAssetId: z.string().trim().optional().nullable(),
  imageAssetId: z.string().trim().optional().nullable(),
  kind: kindSchema.default("SUB"),
  termStart: z.string().optional().nullable(),
  termEnd: z.string().optional().nullable(),
  termYear: z.coerce.number().int().min(1990).max(2100).optional().nullable(),
  status: statusSchema.default("DRAFT"),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  historicallyImportant: z.boolean().default(false),
});

export const membershipUpsertSchema = z.object({
  memberId: z.string().trim().min(1),
  designation: z.string().trim().min(1).max(64),
  designationLabel: z.string().trim().max(120).optional().nullable(),
  shortBio: z.string().trim().max(2000).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: statusSchema.default("PUBLISHED"),
  joinedAt: z.string().optional().nullable(),
  leftAt: z.string().optional().nullable(),
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new OrgCommitteeError("Invalid date value.");
  }
  return d;
}

function parseOrThrow<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new OrgCommitteeError(
      parsed.error.issues[0]?.message ?? "Invalid payload.",
    );
  }
  return parsed.data;
}

export async function listAdminCommittees(input?: {
  query?: string;
  status?: string;
  kind?: string;
}) {
  const where: Prisma.CommitteeWhereInput = { deletedAt: null };
  if (input?.status && statusSchema.safeParse(input.status).success) {
    where.status = input.status as ContentStatus;
  }
  if (input?.kind && kindSchema.safeParse(input.kind).success) {
    where.kind = input.kind as CommitteeKind;
  }
  if (input?.query?.trim()) {
    const q = input.query.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.committee.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      memberships: {
        where: { deletedAt: null },
        include: {
          member: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return rows.map((row) => {
    const active = row.memberships.filter((m) => m.status !== "ARCHIVED");
    const chair = active.find((m) => m.designation === "chairperson");
    const convenor = active.find((m) => m.designation === "convenor");
    const president = active.find((m) => m.designation === "president");
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      kind: row.kind,
      status: row.status,
      termYear: row.termYear,
      termStart: row.termStart,
      termEnd: row.termEnd,
      displayOrder: row.displayOrder,
      memberCount: active.length,
      chairpersonName:
        chair?.member.displayName ??
        (row.kind === "EXECUTIVE" ? president?.member.displayName : null) ??
        null,
      convenorName: convenor?.member.displayName ?? null,
    };
  });
}

export async function getAdminCommittee(id: string) {
  const row = await prisma.committee.findFirst({
    where: { id, deletedAt: null },
    include: {
      coverAsset: true,
      imageAsset: true,
      memberships: {
        where: { deletedAt: null },
        include: {
          member: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              membershipNumber: true,
              email: true,
              portraitAssetId: true,
              status: true,
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!row) throw new OrgCommitteeError("Committee not found.", "NOT_FOUND");
  return row;
}

export async function upsertCommittee(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(committeeUpsertSchema, raw);
  const slug = data.slug || slugifyCommitteeName(data.name);

  if (data.kind === "EXECUTIVE") {
    const other = await prisma.committee.findFirst({
      where: {
        kind: "EXECUTIVE",
        deletedAt: null,
        ...(id ? { NOT: { id } } : {}),
      },
      select: { id: true },
    });
    if (other) {
      throw new OrgCommitteeError(
        "Only one Executive Committee is allowed. Edit the existing one.",
        "CONFLICT",
      );
    }
  }

  const slugTaken = await prisma.committee.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });
  if (slugTaken) {
    throw new OrgCommitteeError("That slug is already in use.", "CONFLICT");
  }

  const payload = {
    name: data.name,
    slug,
    summary: data.summary ?? null,
    description: data.description ?? null,
    responsibilities: data.responsibilities ?? null,
    iconKey: data.iconKey ?? null,
    coverAssetId: data.coverAssetId ?? null,
    imageAssetId: data.imageAssetId ?? null,
    kind: data.kind,
    termStart: parseDate(data.termStart),
    termEnd: parseDate(data.termEnd),
    termYear: data.termYear ?? null,
    status: data.status,
    displayOrder: data.displayOrder,
    historicallyImportant: data.historicallyImportant,
    updatedById: actorUserId,
  };

  const row = id
    ? await prisma.committee.update({
        where: { id },
        data: payload,
      })
    : await prisma.committee.create({
        data: { ...payload, createdById: actorUserId },
      });

  await writeAuditEvent({
    actorUserId,
    action: id ? AuditActions.CONTENT_UPDATED : AuditActions.CONTENT_CREATED,
    entityType: "Committee",
    entityId: row.id,
    metadata: { name: row.name, slug: row.slug, kind: row.kind },
  });

  return row;
}

export async function archiveCommittee(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.committee.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new OrgCommitteeError("Committee not found.", "NOT_FOUND");

  const row = await prisma.committee.update({
    where: { id },
    data: {
      status: "ARCHIVED",
      updatedById: actorUserId,
    },
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.CONTENT_UPDATED,
    entityType: "Committee",
    entityId: row.id,
    metadata: { name: row.name, archived: true },
  });

  return row;
}

export async function softDeleteCommittee(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.committee.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new OrgCommitteeError("Committee not found.", "NOT_FOUND");
  if (existing.historicallyImportant) {
    throw new OrgCommitteeError(
      "Historically important committees cannot be deleted. Archive instead.",
    );
  }

  const row = await prisma.committee.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED", updatedById: actorUserId },
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "Committee",
    entityId: row.id,
    metadata: { name: row.name },
  });

  return row;
}

export async function upsertCommitteeMembership(
  committeeId: string,
  raw: unknown,
  actorUserId: string | null,
  membershipId?: string,
) {
  const data = parseOrThrow(membershipUpsertSchema, raw);
  if (!isCommitteeDesignation(data.designation) && data.designation.length < 2) {
    throw new OrgCommitteeError("Invalid designation.");
  }

  const committee = await prisma.committee.findFirst({
    where: { id: committeeId, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!committee) {
    throw new OrgCommitteeError("Committee not found.", "NOT_FOUND");
  }

  const member = await prisma.member.findFirst({
    where: { id: data.memberId, deletedAt: null },
    select: { id: true, displayName: true },
  });
  if (!member) {
    throw new OrgCommitteeError("Member not found.", "NOT_FOUND");
  }

  const duplicate = await prisma.committeeMembership.findFirst({
    where: {
      committeeId,
      memberId: data.memberId,
      deletedAt: null,
      ...(membershipId ? { NOT: { id: membershipId } } : {}),
    },
    select: { id: true },
  });
  if (duplicate) {
    throw new OrgCommitteeError(
      "This member is already assigned to this committee.",
      "CONFLICT",
    );
  }

  const payload = {
    designation: data.designation,
    designationLabel: data.designationLabel ?? null,
    shortBio: data.shortBio ?? null,
    displayOrder: data.displayOrder,
    status: data.status,
    joinedAt: parseDate(data.joinedAt),
    leftAt: parseDate(data.leftAt),
    updatedById: actorUserId,
    memberId: data.memberId,
    committeeId,
  };

  const row = membershipId
    ? await prisma.committeeMembership.update({
        where: { id: membershipId },
        data: payload,
      })
    : await prisma.committeeMembership.create({
        data: { ...payload, createdById: actorUserId },
      });

  await writeAuditEvent({
    actorUserId,
    action: membershipId
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "CommitteeMembership",
    entityId: row.id,
    metadata: {
      committeeId,
      memberId: member.id,
      displayName: member.displayName,
      designation: designationLabel(row.designation, row.designationLabel),
    },
  });

  return row;
}

export async function removeCommitteeMembership(
  membershipId: string,
  actorUserId: string | null,
) {
  const existing = await prisma.committeeMembership.findFirst({
    where: { id: membershipId, deletedAt: null },
  });
  if (!existing) {
    throw new OrgCommitteeError("Membership not found.", "NOT_FOUND");
  }

  const row = await prisma.committeeMembership.update({
    where: { id: membershipId },
    data: {
      deletedAt: new Date(),
      leftAt: existing.leftAt ?? new Date(),
      status: "ARCHIVED",
      updatedById: actorUserId,
    },
  });

  await writeAuditEvent({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "CommitteeMembership",
    entityId: row.id,
    metadata: { committeeId: row.committeeId, memberId: row.memberId },
  });

  return row;
}

export async function reorderCommittees(
  orderedIds: string[],
  actorUserId: string | null,
) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.committee.updateMany({
        where: { id, deletedAt: null },
        data: { displayOrder: (index + 1) * 10, updatedById: actorUserId },
      }),
    ),
  );
  await writeAuditEvent({
    actorUserId,
    action: AuditActions.CONTENT_UPDATED,
    entityType: "Committee",
    entityId: null,
    metadata: { reordered: orderedIds },
  });
}

export async function reorderCommitteeMemberships(
  committeeId: string,
  orderedIds: string[],
  actorUserId: string | null,
) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.committeeMembership.updateMany({
        where: { id, committeeId, deletedAt: null },
        data: { displayOrder: (index + 1) * 10, updatedById: actorUserId },
      }),
    ),
  );
  await writeAuditEvent({
    actorUserId,
    action: AuditActions.CONTENT_UPDATED,
    entityType: "CommitteeMembership",
    entityId: committeeId,
    metadata: { reordered: orderedIds },
  });
}

export async function searchMembersForCommitteeAssign(query: string, limit = 12) {
  const q = query.trim();
  if (q.length < 1) return [];
  return prisma.member.findMany({
    where: {
      deletedAt: null,
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { membershipNumber: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      membershipNumber: true,
      email: true,
      status: true,
    },
    take: limit,
    orderBy: { displayName: "asc" },
  });
}

/** Ensure a Member row exists for a named person (seed / quick-create). */
export async function ensureMemberByName(
  firstName: string,
  lastName: string,
  actorUserId?: string | null,
) {
  const displayName = `${firstName} ${lastName}`.trim();
  const existing = await prisma.member.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { displayName: { equals: displayName, mode: "insensitive" } },
        {
          AND: [
            { firstName: { equals: firstName, mode: "insensitive" } },
            { lastName: { equals: lastName, mode: "insensitive" } },
          ],
        },
      ],
    },
  });
  if (existing) return existing;

  const slug = slugifyCommitteeName(displayName);
  const email = `committee.${slug}@members.rjgc.local`;
  const emailTaken = await prisma.member.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });
  if (emailTaken) {
    return prisma.member.findFirstOrThrow({ where: { id: emailTaken.id } });
  }

  const membershipNumber = await allocateMembershipNumber();
  return prisma.member.create({
    data: {
      membershipNumber,
      firstName,
      lastName,
      displayName,
      email,
      status: "ACTIVE",
      joinedOn: new Date(),
      createdById: actorUserId ?? null,
      updatedById: actorUserId ?? null,
    },
  });
}
