"use server";

import {
  AuthorizationError,
  assertPermission,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { createMember } from "@/server/services/member-admin-service";
import {
  OrgCommitteeError,
  archiveCommittee,
  ensureMemberByName,
  removeCommitteeMembership,
  reorderCommitteeMemberships,
  reorderCommittees,
  softDeleteCommittee,
  upsertCommittee,
  upsertCommitteeMembership,
} from "@/server/services/org-committee-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireCommitteeWrite() {
  const session = await requireAdminSession("/admin/committees");
  try {
    assertPermission(session.user.role, Permissions.COMMITTEE_WRITE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw new Error("Forbidden");
    }
    throw error;
  }
  return session;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optStr(formData: FormData, key: string) {
  const v = str(formData, key);
  return v.length ? v : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function revalidateCommitteePaths(slug?: string) {
  revalidatePath("/committee");
  revalidatePath("/admin/committees");
  revalidatePath("/admin/committee");
  revalidatePath("/");
  if (slug) revalidatePath(`/committee/${slug}`);
}

export async function saveCommitteeAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const id = optStr(formData, "id") ?? undefined;

  try {
    const row = await upsertCommittee(
      {
        name: str(formData, "name"),
        slug: str(formData, "slug"),
        summary: optStr(formData, "summary"),
        description: optStr(formData, "description"),
        responsibilities: optStr(formData, "responsibilities"),
        iconKey: optStr(formData, "iconKey"),
        coverAssetId: optStr(formData, "coverAssetId"),
        imageAssetId: optStr(formData, "imageAssetId"),
        kind: str(formData, "kind") || "SUB",
        termStart: optStr(formData, "termStart"),
        termEnd: optStr(formData, "termEnd"),
        termYear: optStr(formData, "termYear"),
        status: str(formData, "status") || "DRAFT",
        displayOrder: str(formData, "displayOrder") || "0",
        historicallyImportant: bool(formData, "historicallyImportant"),
      },
      session.user.id,
      id,
    );
    revalidateCommitteePaths(row.slug);
    redirect(
      `/admin/committees/${row.id}?updated=${encodeURIComponent("Committee saved successfully.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      const base = id
        ? `/admin/committees/${id}`
        : "/admin/committees/new";
      redirect(`${base}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}

export async function createCommitteeAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  try {
    const row = await upsertCommittee(
      {
        name: str(formData, "name"),
        slug: str(formData, "slug"),
        summary: optStr(formData, "summary"),
        description: optStr(formData, "description"),
        responsibilities: optStr(formData, "responsibilities"),
        iconKey: optStr(formData, "iconKey"),
        coverAssetId: optStr(formData, "coverAssetId"),
        imageAssetId: optStr(formData, "imageAssetId"),
        kind: str(formData, "kind") || "SUB",
        termStart: optStr(formData, "termStart"),
        termEnd: optStr(formData, "termEnd"),
        termYear: optStr(formData, "termYear"),
        status: str(formData, "status") || "DRAFT",
        displayOrder: str(formData, "displayOrder") || "0",
        historicallyImportant: bool(formData, "historicallyImportant"),
      },
      session.user.id,
    );
    revalidateCommitteePaths(row.slug);
    redirect(
      `/admin/committees/${row.id}?created=1&updated=${encodeURIComponent("Committee created successfully.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      redirect(
        `/admin/committees/new?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }
}

export async function archiveCommitteeAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const id = str(formData, "id");
  try {
    const row = await archiveCommittee(id, session.user.id);
    revalidateCommitteePaths(row.slug);
    redirect(
      `/admin/committees?updated=${encodeURIComponent("Committee archived.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      redirect(
        `/admin/committees/${id}?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }
}

export async function deleteCommitteeAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const id = str(formData, "id");
  try {
    await softDeleteCommittee(id, session.user.id);
    revalidateCommitteePaths();
    redirect(
      `/admin/committees?updated=${encodeURIComponent("Committee deleted.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      redirect(
        `/admin/committees/${id}?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }
}

export async function saveCommitteeMembershipAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const committeeId = str(formData, "committeeId");
  const membershipId = optStr(formData, "membershipId") ?? undefined;
  try {
    await upsertCommitteeMembership(
      committeeId,
      {
        memberId: str(formData, "memberId"),
        designation: str(formData, "designation") || "member",
        designationLabel: optStr(formData, "designationLabel"),
        shortBio: optStr(formData, "shortBio"),
        displayOrder: str(formData, "displayOrder") || "0",
        status: str(formData, "status") || "PUBLISHED",
        joinedAt: optStr(formData, "joinedAt"),
        leftAt: optStr(formData, "leftAt"),
      },
      session.user.id,
      membershipId,
    );
    revalidateCommitteePaths();
    revalidatePath(`/admin/committees/${committeeId}/members`);
    redirect(
      `/admin/committees/${committeeId}/members?updated=${encodeURIComponent("Member assignment saved.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      redirect(
        `/admin/committees/${committeeId}/members?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }
}

export async function createMemberAndAssignAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const committeeId = str(formData, "committeeId");
  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  try {
    let memberId = optStr(formData, "memberId");
    if (!memberId) {
      if (firstName && lastName) {
        const member = await ensureMemberByName(
          firstName,
          lastName,
          session.user.id,
        );
        memberId = member.id;
      } else {
        const created = await createMember(
          {
            firstName: str(formData, "newFirstName"),
            lastName: str(formData, "newLastName"),
            displayName: str(formData, "newDisplayName"),
            email: str(formData, "newEmail"),
            status: "ACTIVE",
          },
          session.user.id,
        );
        memberId = created.id;
      }
    }

    await upsertCommitteeMembership(
      committeeId,
      {
        memberId,
        designation: str(formData, "designation") || "member",
        designationLabel: optStr(formData, "designationLabel"),
        shortBio: optStr(formData, "shortBio"),
        displayOrder: str(formData, "displayOrder") || "0",
        status: "PUBLISHED",
      },
      session.user.id,
    );
    revalidateCommitteePaths();
    redirect(
      `/admin/committees/${committeeId}/members?updated=${encodeURIComponent("Member added to committee.")}`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not add member.";
    redirect(
      `/admin/committees/${committeeId}/members?error=${encodeURIComponent(message)}`,
    );
  }
}

export async function removeCommitteeMembershipAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const committeeId = str(formData, "committeeId");
  const membershipId = str(formData, "membershipId");
  try {
    await removeCommitteeMembership(membershipId, session.user.id);
    revalidateCommitteePaths();
    redirect(
      `/admin/committees/${committeeId}/members?updated=${encodeURIComponent("Member removed from committee.")}`,
    );
  } catch (error) {
    if (error instanceof OrgCommitteeError) {
      redirect(
        `/admin/committees/${committeeId}/members?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }
}

export async function reorderCommitteesAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const orderedIds = str(formData, "orderedIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  await reorderCommittees(orderedIds, session.user.id);
  revalidateCommitteePaths();
  redirect(
    `/admin/committees?updated=${encodeURIComponent("Committee order saved.")}`,
  );
}

export async function reorderMembershipsAction(formData: FormData) {
  const session = await requireCommitteeWrite();
  const committeeId = str(formData, "committeeId");
  const orderedIds = str(formData, "orderedIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  await reorderCommitteeMemberships(
    committeeId,
    orderedIds,
    session.user.id,
  );
  revalidateCommitteePaths();
  redirect(
    `/admin/committees/${committeeId}/members?updated=${encodeURIComponent("Member order saved.")}`,
  );
}
