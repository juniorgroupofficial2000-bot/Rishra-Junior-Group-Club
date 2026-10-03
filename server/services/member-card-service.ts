import "server-only";

import { memberStatusLabel } from "@/server/domain/member-lifecycle";
import { getSiteUrl } from "@/lib/seo/config";
import { prisma } from "@/server/db/prisma";

export type PublicMemberCardView = {
  membershipNumber: string;
  displayName: string;
  statusLabel: string;
  isActive: boolean;
  membershipType: string | null;
  joinedOn: string | null;
  validThrough: string | null;
  portraitUrl: string | null;
  verifyUrl: string;
};

/**
 * Public verification payload — no phone, email, address, DOB, or internal notes.
 */
export async function loadPublicMemberCardByToken(
  cardPublicId: string,
): Promise<PublicMemberCardView | null> {
  if (!cardPublicId || cardPublicId.length < 8 || cardPublicId.length > 64) {
    return null;
  }

  const member = await prisma.member.findFirst({
    where: {
      cardPublicId,
      deletedAt: null,
      status: { not: "ARCHIVED" },
    },
    include: {
      memberships: {
        where: { deletedAt: null, isCurrent: true },
        include: { plan: true },
        take: 1,
      },
      portraitAsset: {
        select: { id: true, status: true, deletedAt: true },
      },
    },
  });

  if (!member) return null;

  const plan = member.memberships[0]?.plan ?? null;
  const portraitReady =
    member.portraitAsset &&
    member.portraitAsset.deletedAt == null &&
    member.portraitAsset.status === "READY";

  return {
    membershipNumber: member.membershipNumber,
    displayName: member.displayName,
    statusLabel: memberStatusLabel(member.status),
    isActive: member.status === "ACTIVE",
    membershipType: plan?.name ?? null,
    joinedOn: member.joinedOn
      ? member.joinedOn.toISOString().slice(0, 10)
      : null,
    validThrough: member.memberships[0]?.endsOn
      ? member.memberships[0].endsOn.toISOString().slice(0, 10)
      : null,
    portraitUrl: portraitReady
      ? `/api/media/${member.portraitAsset!.id}?v=md`
      : null,
    verifyUrl: `${getSiteUrl()}/verify/member/${member.cardPublicId}`,
  };
}

export async function loadMemberCardForOwner(memberId: string) {
  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
    select: { cardPublicId: true },
  });
  if (!member) return null;
  return loadPublicMemberCardByToken(member.cardPublicId);
}
