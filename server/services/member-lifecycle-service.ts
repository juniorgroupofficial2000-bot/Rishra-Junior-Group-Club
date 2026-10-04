import "server-only";

import { canTransitionMemberStatus } from "@/server/domain/member-lifecycle";
import {
  MemberAdminServiceError,
  updateMemberStatus,
} from "@/server/services/member-admin-service";
import { getAdminMemberRepository } from "@/server/repositories";
import {
  memberLifecycleActionSchema,
  type MemberStatusInput,
} from "@/server/validation/member";

const ACTION_TARGET: Record<
  string,
  { status: MemberStatusInput; requireReason?: boolean }
> = {
  start_review: { status: "PENDING" },
  approve: { status: "APPROVED" },
  activate: { status: "ACTIVE" },
  reject: { status: "INACTIVE", requireReason: true },
  request_changes: { status: "APPLICATION", requireReason: true },
  suspend: { status: "SUSPENDED", requireReason: true },
  reactivate: { status: "ACTIVE" },
  archive: { status: "ARCHIVED", requireReason: true },
};

/**
 * Named lifecycle operations with transition guards + audit via setStatus.
 */
export async function applyMemberLifecycleAction(
  memberId: string,
  raw: unknown,
  actorUserId?: string | null,
) {
  const parsed = memberLifecycleActionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new MemberAdminServiceError(
      parsed.error.issues[0]?.message ?? "Invalid lifecycle action.",
      "VALIDATION",
    );
  }

  const target = ACTION_TARGET[parsed.data.action];
  if (!target) {
    throw new MemberAdminServiceError("Unknown lifecycle action.", "VALIDATION");
  }

  if (target.requireReason && !parsed.data.reason?.trim()) {
    throw new MemberAdminServiceError(
      "A reason is required for this action.",
      "VALIDATION",
    );
  }

  const existing = await getAdminMemberRepository().findById(memberId);
  if (!existing) {
    throw new MemberAdminServiceError("Member not found.", "NOT_FOUND");
  }

  if (!canTransitionMemberStatus(existing.status, target.status)) {
    throw new MemberAdminServiceError(
      `Cannot move from ${existing.status} to ${target.status}.`,
      "VALIDATION",
    );
  }

  return updateMemberStatus(
    memberId,
    {
      status: target.status,
      reason: parsed.data.reason,
      reviewNotes:
        parsed.data.action === "request_changes"
          ? parsed.data.reviewNotes ?? parsed.data.reason
          : parsed.data.reviewNotes,
    },
    actorUserId,
  );
}
