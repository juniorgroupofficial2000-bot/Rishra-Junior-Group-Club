import "server-only";

import { prisma } from "@/server/db/prisma";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";
import { toAuthUser } from "@/server/repositories/prisma/mappers";

const memberSelect = {
  id: true,
  status: true,
  deletedAt: true,
} as const;

export const prismaUserRepository: UserRepository = {
  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: normalized, deletedAt: null },
      include: { member: { select: memberSelect } },
    });
    return user ? toAuthUser(user) : null;
  },

  async findById(id) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { member: { select: memberSelect } },
    });
    return user ? toAuthUser(user) : null;
  },
};
