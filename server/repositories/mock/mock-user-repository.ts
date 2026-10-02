import type {
  AuthUserRecord,
  UserRepository,
} from "@/server/repositories/contracts/user-repository";

/**
 * DEMO / MOCK user store — not for production.
 * Password for the demo member: MemberDemo1!
 * Replace with Prisma-backed UserRepository in production.
 */

const MOCK_USERS: AuthUserRecord[] = [
  {
    id: "user_demo_member",
    email: "member@rjgc.local",
    name: "Demo Member",
    role: "MEMBER",
    memberId: "mem_demo_001",
    memberStatus: "ACTIVE",
    // bcrypt hash of "MemberDemo1!" (cost 12)
    passwordHash:
      "$2b$12$yxYnTxWqMKkj6iLzsPN4ouSgiZBYfi04aekWTfEm3QbCW2bLngYsi",
    active: true,
  },
];

export const mockUserRepository: UserRepository = {
  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return MOCK_USERS.find((user) => user.email === normalized) ?? null;
  },
  async findById(id) {
    return MOCK_USERS.find((user) => user.id === id) ?? null;
  },
};
