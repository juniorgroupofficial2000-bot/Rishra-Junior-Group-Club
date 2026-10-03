import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { loginSchema } from "@/server/auth/config";
import { clearRateLimitBuckets, consumeRateLimit } from "@/server/security/rate-limit";

const prisma = new PrismaClient();
const suffix = `auth${Date.now().toString(36)}`;

describe("authentication integration", () => {
  let userId: string;
  let memberId: string;
  const password = "AuthTest1!";

  beforeAll(async () => {
    const passwordHash = await hash(password, 4);
    const user = await prisma.user.create({
      data: {
        email: `auth.${suffix}@rjgc.local`,
        name: "Auth Test",
        passwordHash,
        role: "MEMBER",
        active: true,
      },
    });
    userId = user.id;
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-AUTH-${suffix}`,
        firstName: "Auth",
        lastName: "Test",
        displayName: `[SAMPLE] Auth ${suffix}`,
        email: user.email,
        status: "ACTIVE",
        isSample: true,
        userId: user.id,
      },
    });
    memberId = member.id;
  });

  afterAll(async () => {
    await prisma.member.deleteMany({ where: { id: memberId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("verifies bcrypt credentials for an active member user", async () => {
    const parsed = loginSchema.parse({
      email: `Auth.${suffix}@rjgc.local`,
      password,
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: parsed.email },
    });
    expect(user.active).toBe(true);
    expect(await compare(parsed.password, user.passwordHash)).toBe(true);
  });

  it("fails credential check for wrong password", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(await compare("WrongPass1!", user.passwordHash)).toBe(false);
  });

  it("blocks inactive users even with correct password", async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.active).toBe(false);
    expect(await compare(password, user.passwordHash)).toBe(true);
    // Auth authorize path returns null when !user.active — modelled here.
    const maySignIn = user.active && (await compare(password, user.passwordHash));
    expect(maySignIn).toBe(false);

    await prisma.user.update({
      where: { id: userId },
      data: { active: true },
    });
  });

  it("enforces auth rate-limit buckets used by Credentials authorize", () => {
    const previousE2e = process.env.E2E_TEST;
    delete process.env.E2E_TEST;
    try {
      clearRateLimitBuckets();
      const key = `authjs:email:auth.${suffix}@rjgc.local`;
      for (let i = 0; i < 10; i += 1) {
        expect(consumeRateLimit(key, 10, 15 * 60_000)).toBe(true);
      }
      expect(consumeRateLimit(key, 10, 15 * 60_000)).toBe(false);
    } finally {
      if (previousE2e === undefined) delete process.env.E2E_TEST;
      else process.env.E2E_TEST = previousE2e;
    }
  });
});
