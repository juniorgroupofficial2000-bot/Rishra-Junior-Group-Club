import type { AppRole } from "@/server/domain/roles";

/** Auth identity — never expose password hashes to the client. */
export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  memberId: string | null;
  /** bcrypt hash — server-only */
  passwordHash: string;
  active: boolean;
};

export type UserRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
};
