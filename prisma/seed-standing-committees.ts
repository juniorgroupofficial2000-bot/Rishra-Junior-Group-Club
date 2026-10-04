import { standingCommitteeSeeds } from "@/content/standing-committees";
import type { PrismaClient } from "@prisma/client";

/**
 * Idempotent seed for Executive + standing sub-committees.
 * Member is the person entity; memberships link people without duplicates.
 */
export async function seedStandingCommittees(
  prisma: PrismaClient,
  actorUserId?: string | null,
) {
  const now = new Date();
  const actor = actorUserId ?? null;
  const termYear = now.getFullYear();

  // ── Executive Committee (from public roster when present) ─────────────────
  let executive = await prisma.committee.findFirst({
    where: { kind: "EXECUTIVE", deletedAt: null },
  });

  if (!executive) {
    executive = await prisma.committee.create({
      data: {
        slug: "executive",
        name: "Executive Committee",
        summary: "Primary leadership of the club",
        description:
          "The Executive Committee guides Rishra Junior Group Club — setting direction for programmes, membership, and community life.",
        responsibilities:
          "Oversee club governance, membership, finances, and major programmes; appoint and support standing committees.",
        iconKey: "landmark",
        kind: "EXECUTIVE",
        termYear,
        status: "PUBLISHED",
        displayOrder: 10,
        historicallyImportant: true,
        createdById: actor,
        updatedById: actor,
      },
    });
  } else {
    executive = await prisma.committee.update({
      where: { id: executive.id },
      data: {
        name: "Executive Committee",
        status: "PUBLISHED",
        historicallyImportant: true,
        updatedById: actor,
        updatedAt: now,
      },
    });
  }

  const roster = await prisma.publicCommitteeMember.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  });

  for (const row of roster) {
    const member = await ensureSeedMember(prisma, {
      displayName: row.displayName,
      name: row.name,
      actor,
      portraitAssetId: row.portraitAssetId,
    });

    const existing = await prisma.committeeMembership.findFirst({
      where: {
        committeeId: executive.id,
        memberId: member.id,
        deletedAt: null,
      },
    });

    const payload = {
      designation: row.roleKey,
      designationLabel: row.roleTitle,
      shortBio: row.biography,
      displayOrder: row.sortOrder,
      status: "PUBLISHED" as const,
      updatedById: actor,
      updatedAt: now,
    };

    if (existing) {
      await prisma.committeeMembership.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.committeeMembership.create({
        data: {
          ...payload,
          committeeId: executive.id,
          memberId: member.id,
          createdById: actor,
        },
      });
    }
  }

  // ── Standing sub-committees ───────────────────────────────────────────────
  for (const seed of standingCommitteeSeeds) {
    let committee = await prisma.committee.findFirst({
      where: { slug: seed.slug, deletedAt: null },
    });

    const committeePayload = {
      name: seed.name,
      summary: seed.summary,
      description: seed.description,
      responsibilities: seed.responsibilities,
      iconKey: seed.iconKey,
      kind: "SUB" as const,
      termYear,
      status: "PUBLISHED" as const,
      displayOrder: seed.displayOrder,
      updatedById: actor,
      updatedAt: now,
    };

    if (committee) {
      committee = await prisma.committee.update({
        where: { id: committee.id },
        data: committeePayload,
      });
    } else {
      committee = await prisma.committee.create({
        data: {
          ...committeePayload,
          slug: seed.slug,
          createdById: actor,
        },
      });
    }

    for (const person of seed.members) {
      const displayName = `${person.firstName} ${person.lastName}`;
      const member = await ensureSeedMember(prisma, {
        displayName,
        name: displayName,
        firstName: person.firstName,
        lastName: person.lastName,
        actor,
      });

      const existing = await prisma.committeeMembership.findFirst({
        where: {
          committeeId: committee.id,
          memberId: member.id,
          deletedAt: null,
        },
      });

      if (existing) {
        await prisma.committeeMembership.update({
          where: { id: existing.id },
          data: {
            designation: person.designation,
            displayOrder: person.displayOrder,
            status: "PUBLISHED",
            updatedById: actor,
            updatedAt: now,
          },
        });
      } else {
        await prisma.committeeMembership.create({
          data: {
            committeeId: committee.id,
            memberId: member.id,
            designation: person.designation,
            displayOrder: person.displayOrder,
            status: "PUBLISHED",
            createdById: actor,
            updatedById: actor,
          },
        });
      }
    }
  }
}

async function ensureSeedMember(
  prisma: PrismaClient,
  input: {
    displayName: string;
    name: string;
    firstName?: string;
    lastName?: string;
    actor: string | null;
    portraitAssetId?: string | null;
  },
) {
  const parts = input.name.trim().split(/\s+/);
  const firstName = input.firstName ?? parts[0] ?? "Member";
  const lastName =
    input.lastName ?? (parts.length > 1 ? parts.slice(1).join(" ") : "Club");

  const existing = await prisma.member.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { displayName: { equals: input.displayName, mode: "insensitive" } },
        {
          AND: [
            { firstName: { equals: firstName, mode: "insensitive" } },
            { lastName: { equals: lastName, mode: "insensitive" } },
          ],
        },
      ],
    },
  });

  if (existing) {
    if (input.portraitAssetId && !existing.portraitAssetId) {
      return prisma.member.update({
        where: { id: existing.id },
        data: {
          portraitAssetId: input.portraitAssetId,
          updatedById: input.actor,
        },
      });
    }
    return existing;
  }

  const slug = input.displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  const email = `committee.${slug || "member"}@members.rjgc.local`;

  const emailTaken = await prisma.member.findFirst({
    where: { email, deletedAt: null },
  });
  if (emailTaken) return emailTaken;

  const year = new Date().getFullYear();
  const prefix = `RJGC-${year}-`;
  const latest = await prisma.member.findFirst({
    where: { membershipNumber: { startsWith: prefix } },
    orderBy: { membershipNumber: "desc" },
    select: { membershipNumber: true },
  });
  let next = 1;
  if (latest?.membershipNumber) {
    const parsed = Number.parseInt(
      latest.membershipNumber.slice(prefix.length),
      10,
    );
    if (Number.isFinite(parsed)) next = parsed + 1;
  }
  const membershipNumber = `${prefix}${String(next).padStart(4, "0")}`;

  return prisma.member.create({
    data: {
      membershipNumber,
      firstName,
      lastName,
      displayName: input.displayName,
      email,
      status: "ACTIVE",
      joinedOn: new Date(),
      portraitAssetId: input.portraitAssetId ?? null,
      createdById: input.actor,
      updatedById: input.actor,
    },
  });
}
