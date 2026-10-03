import "server-only";

import {
  buildOtpAuthUrl,
  generateTotpSecret,
  verifyTotpCode,
} from "@/server/auth/mfa/totp";
import { decryptMfaSecret, encryptMfaSecret } from "@/server/auth/mfa/secrets";
import { roleRequiresStaffMfa } from "@/server/auth/mfa/policy";
import { prisma } from "@/server/db/prisma";
import type { AppRole } from "@/server/domain/roles";
import { writeAuditEvent } from "@/server/services/audit-service";

export class StaffMfaError extends Error {
  constructor(
    message: string,
    readonly code: "FORBIDDEN" | "INVALID" | "ALREADY_ENABLED",
  ) {
    super(message);
    this.name = "StaffMfaError";
  }
}

export async function beginStaffMfaEnrollment(input: {
  userId: string;
  role: AppRole;
  email: string;
}) {
  if (!roleRequiresStaffMfa(input.role)) {
    throw new StaffMfaError("MFA enrollment is for staff accounts only.", "FORBIDDEN");
  }

  const user = await prisma.user.findFirst({
    where: { id: input.userId, deletedAt: null },
    select: { mfaEnabled: true },
  });
  if (!user) throw new StaffMfaError("User not found.", "INVALID");
  if (user.mfaEnabled) {
    throw new StaffMfaError("MFA is already enabled.", "ALREADY_ENABLED");
  }

  const secret = generateTotpSecret();
  const encrypted = encryptMfaSecret(secret);
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      mfaTotpSecretEnc: encrypted,
      mfaEnabled: false,
      mfaVerifiedAt: null,
    },
  });

  return {
    secret,
    otpauthUrl: buildOtpAuthUrl({
      secret,
      accountName: input.email,
      issuer: "RJGC Admin",
    }),
  };
}

export async function confirmStaffMfaEnrollment(input: {
  userId: string;
  role: AppRole;
  code: string;
}) {
  if (!roleRequiresStaffMfa(input.role)) {
    throw new StaffMfaError("MFA enrollment is for staff accounts only.", "FORBIDDEN");
  }

  const user = await prisma.user.findFirst({
    where: { id: input.userId, deletedAt: null },
    select: { mfaTotpSecretEnc: true, mfaEnabled: true, email: true },
  });
  if (!user?.mfaTotpSecretEnc) {
    throw new StaffMfaError("Start MFA enrollment first.", "INVALID");
  }
  if (user.mfaEnabled) {
    throw new StaffMfaError("MFA is already enabled.", "ALREADY_ENABLED");
  }

  const secret = decryptMfaSecret(user.mfaTotpSecretEnc);
  if (!secret || !verifyTotpCode(secret, input.code)) {
    throw new StaffMfaError("Invalid authenticator code.", "INVALID");
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      mfaEnabled: true,
      mfaVerifiedAt: new Date(),
    },
  });

  await writeAuditEvent({
    actorUserId: input.userId,
    action: "user.mfa_enabled",
    entityType: "User",
    entityId: input.userId,
    metadata: { method: "totp" },
  });
}

export async function getStaffMfaStatus(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { mfaEnabled: true, mfaVerifiedAt: true },
  });
  return {
    enabled: Boolean(user?.mfaEnabled),
    verifiedAt: user?.mfaVerifiedAt?.toISOString() ?? null,
  };
}
