import "server-only";

import {
  exportMembersToCsv,
  parseMemberCsvImport,
} from "@/server/csv/member-csv";
import { allocateMembershipNumber } from "@/server/domain/membership-number";
import { getAdminMemberRepository } from "@/server/repositories";
import {
  getNotificationService,
  resolveMemberRecipient,
} from "@/server/notifications/service";
import { NotificationEvents } from "@/server/notifications/types";
import {
  adminMemberSearchSchema,
  createMemberSchema,
  memberStatusUpdateSchema,
  updateMemberSchema,
} from "@/server/validation/member";

export class MemberAdminServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "VALIDATION"
      | "NOT_FOUND"
      | "CONFLICT"
      | "IMPORT_INVALID" = "VALIDATION",
  ) {
    super(message);
    this.name = "MemberAdminServiceError";
  }
}

function getActorId(actorUserId?: string | null) {
  return actorUserId ?? null;
}

export async function createMember(
  raw: unknown,
  actorUserId?: string | null,
) {
  const parsed = createMemberSchema.safeParse(raw);
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid member payload.",
      "VALIDATION",
    );
  }

  const membershipNumber =
    parsed.data.membershipNumber?.trim() ||
    (await allocateMembershipNumber());

  try {
    return await getAdminMemberRepository().create(
      { ...parsed.data, membershipNumber },
      getActorId(actorUserId),
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new MemberAdminServiceError(
        "Membership number or linked user already exists.",
        "CONFLICT",
      );
    }
    throw error;
  }
}

export async function updateMember(
  id: string,
  raw: unknown,
  actorUserId?: string | null,
) {
  const parsed = updateMemberSchema.safeParse(raw);
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid member payload.",
      "VALIDATION",
    );
  }

  const repo = getAdminMemberRepository();
  const existing = await repo.findById(id);
  if (!existing) {
    throw new MemberAdminServiceError("Member not found.", "NOT_FOUND");
  }

  try {
    return await repo.update(id, parsed.data, getActorId(actorUserId));
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new MemberAdminServiceError(
        "Linked user already exists.",
        "CONFLICT",
      );
    }
    throw error;
  }
}

export async function softDeleteMember(
  id: string,
  actorUserId?: string | null,
) {
  const repo = getAdminMemberRepository();
  const existing = await repo.findById(id);
  if (!existing) {
    throw new MemberAdminServiceError("Member not found.", "NOT_FOUND");
  }
  await repo.softDelete(id, getActorId(actorUserId));
}

export async function getMemberForAdmin(id: string) {
  const member = await getAdminMemberRepository().findById(id);
  if (!member) {
    throw new MemberAdminServiceError("Member not found.", "NOT_FOUND");
  }
  return member;
}

export async function searchMembers(raw: unknown) {
  const parsed = adminMemberSearchSchema.safeParse(raw);
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid search filters.",
      "VALIDATION",
    );
  }
  return getAdminMemberRepository().search(parsed.data);
}

export async function updateMemberStatus(
  id: string,
  raw: unknown,
  actorUserId?: string | null,
) {
  const parsed = memberStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid status payload.",
      "VALIDATION",
    );
  }

  const repo = getAdminMemberRepository();
  const existing = await repo.findById(id);
  if (!existing) {
    throw new MemberAdminServiceError("Member not found.", "NOT_FOUND");
  }

  const updated = await repo.setStatus(
    id,
    parsed.data.status,
    getActorId(actorUserId),
    parsed.data.reason,
    parsed.data.reviewNotes,
  );

  if (
    (parsed.data.status === "ACTIVE" || parsed.data.status === "APPROVED") &&
    existing.status !== "ACTIVE" &&
    existing.status !== "APPROVED"
  ) {
    const recipient = await resolveMemberRecipient(id);
    if (recipient) {
      await getNotificationService().notifyEvent({
        event: NotificationEvents.MEMBERSHIP_APPROVED,
        recipient,
        data: { membershipNumber: updated.membershipNumber },
      });
    }
  }

  return updated;
}

/**
 * Validate CSV text and create members for valid rows.
 * Does not accept multipart file uploads — pass controlled text only.
 */
export async function importMembersFromCsvText(
  csvText: string,
  actorUserId?: string | null,
) {
  const { validRows, errors } = parseMemberCsvImport(csvText);
  if (errors.length > 0 && validRows.length === 0) {
    throw new MemberAdminServiceError(
      errors[0]?.message ?? "CSV import failed validation.",
      "IMPORT_INVALID",
    );
  }

  const created = [];
  const rowErrors = [...errors];

  for (const [index, row] of validRows.entries()) {
    try {
      const member = await createMember(
        {
          membershipNumber: row.membershipNumber,
          firstName: row.firstName,
          lastName: row.lastName,
          displayName: row.displayName,
          email: row.email,
          phone: row.phone || undefined,
          status: row.status,
          joinedOn: row.joinedOn ? new Date(row.joinedOn) : null,
          city: row.city || undefined,
          state: row.state || undefined,
          country: "IN",
        },
        actorUserId,
      );
      created.push(member);
    } catch (error) {
      rowErrors.push({
        row: index + 2,
        message:
          error instanceof MemberAdminServiceError
            ? error.message
            : "Failed to create member row.",
      });
    }
  }

  return { created, errors: rowErrors };
}

export async function exportMembersCsv(rawFilters: unknown) {
  const parsed = adminMemberSearchSchema
    .omit({ page: true, pageSize: true })
    .safeParse(rawFilters ?? {});
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid export filters.",
      "VALIDATION",
    );
  }

  const members = await getAdminMemberRepository().listForExport(parsed.data);
  return exportMembersToCsv(members);
}
