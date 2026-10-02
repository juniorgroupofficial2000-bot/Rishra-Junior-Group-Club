import type { MemberRepository } from "@/server/repositories/contracts/member-repository";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";
import { mockMemberRepository } from "@/server/repositories/mock/mock-member-repository";
import { mockUserRepository } from "@/server/repositories/mock/mock-user-repository";

/**
 * Repository factory.
 * `REPOSITORY_DRIVER=mock` (default) uses demo stores.
 * Future: `REPOSITORY_DRIVER=prisma` wires production Prisma repositories.
 */
export type RepositoryDriver = "mock" | "prisma";

function getDriver(): RepositoryDriver {
  const value = process.env.REPOSITORY_DRIVER?.toLowerCase();
  if (value === "prisma") return "prisma";
  return "mock";
}

export function getUserRepository(): UserRepository {
  const driver = getDriver();
  if (driver === "prisma") {
    throw new Error(
      "Prisma UserRepository is not implemented yet. Set REPOSITORY_DRIVER=mock.",
    );
  }
  return mockUserRepository;
}

export function getMemberRepository(): MemberRepository {
  const driver = getDriver();
  if (driver === "prisma") {
    throw new Error(
      "Prisma MemberRepository is not implemented yet. Set REPOSITORY_DRIVER=mock.",
    );
  }
  return mockMemberRepository;
}

export function isMockRepositoryDriver(): boolean {
  return getDriver() === "mock";
}
