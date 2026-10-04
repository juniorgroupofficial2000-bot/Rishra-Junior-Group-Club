import { getServerEnv, isProductionAppEnv } from "@/config";
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
 * `REPOSITORY_DRIVER=mock` uses in-memory demo stores (local only).
 * `REPOSITORY_DRIVER=prisma` uses PostgreSQL via Prisma (required outside local mock).
 */
export type RepositoryDriver = "prisma" | "mock";

function getDriver(): RepositoryDriver {
  const env = getServerEnv();
  if (env.repositoryDriver === "mock") {
    if (isProductionAppEnv(env.appEnv) || env.appEnv === "staging") {
      throw new Error(
        `REPOSITORY_DRIVER=mock is not allowed when APP_ENV=${env.appEnv}. Set REPOSITORY_DRIVER=prisma.`,
      );
    }
    return "mock";
  }
  return "prisma";
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
