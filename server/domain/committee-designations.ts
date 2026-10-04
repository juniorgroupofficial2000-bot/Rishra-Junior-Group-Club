/**
 * Stable designation keys for committee seats.
 * Labels are English-only; admins may override via designationLabel.
 */

export const COMMITTEE_DESIGNATIONS = [
  "president",
  "vice_president",
  "secretary",
  "treasurer",
  "executive_member",
  "chairperson",
  "convenor",
  "member",
  "other",
] as const;

export type CommitteeDesignation = (typeof COMMITTEE_DESIGNATIONS)[number];

const LABELS: Record<CommitteeDesignation, string> = {
  president: "President",
  vice_president: "Vice President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  executive_member: "Executive Member",
  chairperson: "Chairperson",
  convenor: "Convenor",
  member: "Member",
  other: "Other Member",
};

export function isCommitteeDesignation(
  value: string,
): value is CommitteeDesignation {
  return (COMMITTEE_DESIGNATIONS as readonly string[]).includes(value);
}

export function designationLabel(
  designation: string,
  override?: string | null,
): string {
  if (override?.trim()) return override.trim();
  if (isCommitteeDesignation(designation)) return LABELS[designation];
  return designation
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Visual hierarchy rank for executive roster (lower = more prominent). */
export function executiveHierarchyRank(designation: string): number {
  switch (designation) {
    case "president":
      return 0;
    case "secretary":
      return 1;
    case "treasurer":
      return 2;
    case "vice_president":
      return 3;
    case "executive_member":
      return 4;
    case "other":
      return 5;
    default:
      return 6;
  }
}

export function leadershipDesignations(): CommitteeDesignation[] {
  return ["chairperson", "convenor"];
}
