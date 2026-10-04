import type { AppRole } from "@/server/domain/roles";

export type AuthMemberStatus =
  | "APPLICATION"
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "ARCHIVED"
  | null;

/** Auth identity — never expose password hashes to the client. */
export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  memberId: string | null;
  /** Linked member status when a member row exists; null if unlinked. */
  memberStatus: AuthMemberStatus;
  /** bcrypt hash — server-only */
  passwordHash: string;
  active: boolean;
  mfaEnabled: boolean;
  /** Encrypted TOTP secret — server-only; never send to clients. */
  mfaTotpSecretEnc: string | null;
};

export type UserRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
};
