import { isProductionRuntime } from "@/server/security/env";
import type { AdminMemberRepository } from "@/server/repositories/contracts/admin-member-repository";
import type { MemberRepository } from "@/server/repositories/contracts/member-repository";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";
import { mockMemberRepository } from "@/server/repositories/mock/mock-member-repository";
import { mockUserRepository } from "@/server/repositories/mock/mock-user-repository";
import { prismaAdminMemberRepository } from "@/server/repositories/prisma/prisma-admin-member-repository";
import { prismaMemberRepository } from "@/server/repositories/prisma/prisma-member-repository";
import { prismaUserRepository } from "@/server/repositories/prisma/prisma-user-repository";

/**
 * Repository factory.
 * `REPOSITORY_DRIVER=mock` uses in-memory demo stores (local/dev only).
 * `REPOSITORY_DRIVER=prisma` uses PostgreSQL via Prisma (required in production).
 */
export type RepositoryDriver = "mock" | "prisma";

function getDriver(): RepositoryDriver {
  const value = process.env.REPOSITORY_DRIVER?.toLowerCase();
  if (value === "prisma") return "prisma";
  if (value === "mock") {
    if (isProductionRuntime()) {
      throw new Error(
        "REPOSITORY_DRIVER=mock is not allowed in production. Set REPOSITORY_DRIVER=prisma.",
      );
    }
    return "mock";
  }

  if (isProductionRuntime()) {
    throw new Error(
      "REPOSITORY_DRIVER must be set to prisma in production. Mock auth/data is fail-closed.",
    );
  }

  // Local/dev convenience when unset.
  return "mock";
}

export function getRepositoryDriver(): RepositoryDriver {
  return getDriver();
}

export function getUserRepository(): UserRepository {
  return getDriver() === "prisma" ? prismaUserRepository : mockUserRepository;
}

export function getMemberRepository(): MemberRepository {
  return getDriver() === "prisma"
    ? prismaMemberRepository
    : mockMemberRepository;
}

export function getAdminMemberRepository(): AdminMemberRepository {
  if (getDriver() !== "prisma") {
    throw new Error(
      "Admin member repository requires REPOSITORY_DRIVER=prisma.",
    );
  }
  return prismaAdminMemberRepository;
}

export function isMockRepositoryDriver(): boolean {
  return getDriver() === "mock";
}

export function isPrismaRepositoryDriver(): boolean {
  return getDriver() === "prisma";
}
