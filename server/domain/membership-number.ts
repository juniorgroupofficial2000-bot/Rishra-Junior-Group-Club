const PREFIX = "RJGC";

export function isMembershipNumberFormat(value: string): boolean {
  return /^RJGC-\d{4}-\d{4}$/.test(value.trim());
}

/**
 * Human-readable immutable membership IDs: RJGC-YYYY-NNNN
 * Allocated sequentially per calendar year.
 */
export async function allocateMembershipNumber(
  year = new Date().getFullYear(),
): Promise<string> {
  const { prisma } = await import("@/server/db/prisma");
  const prefix = `${PREFIX}-${year}-`;

  const latest = await prisma.member.findFirst({
    where: {
      membershipNumber: { startsWith: prefix },
    },
    orderBy: { membershipNumber: "desc" },
    select: { membershipNumber: true },
  });

  let next = 1;
  if (latest?.membershipNumber) {
    const tail = latest.membershipNumber.slice(prefix.length);
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      next = parsed + 1;
    }
  }

  if (next > 9999) {
    throw new Error("Membership number sequence exhausted for this year.");
  }

  return `${prefix}${String(next).padStart(4, "0")}`;
}
