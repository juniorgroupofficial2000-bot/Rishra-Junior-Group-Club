import type { AppRole } from "@/server/domain/roles";

export type AuthMemberStatus =
  | "ACTIVE"
  | "PENDING"
  | "INACTIVE"
  | "SUSPENDED"
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
};

export type UserRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
};
