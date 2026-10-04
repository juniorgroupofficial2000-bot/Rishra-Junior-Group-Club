/**
 * Create or update the first admin login for a deployed database.
 *
 * Usage:
 *   DATABASE_URL='postgresql://…' APP_ENV=development \
 *     BOOTSTRAP_ADMIN_EMAIL='you@example.com' \
 *     BOOTSTRAP_ADMIN_PASSWORD='YourSecurePass1!' \
 *     npm run db:bootstrap-admin
 *
 * Defaults (development only):
 *   email: admin@rjgc.local
 *   password: AdminDemo1!
 */
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { resolveAppEnv } from "../config/app-env";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

function assertDatabaseUrl(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (
    !value ||
    value.includes("[SENSITIVE]") ||
    (!value.startsWith("postgresql://") && !value.startsWith("postgres://"))
  ) {
    throw new Error(
      "Set a real DATABASE_URL (postgresql://…). Do not use [SENSITIVE] placeholders.",
    );
  }
  return value;
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.vercel.local"));
  loadEnvFile(resolve(process.cwd(), ".env.vercel"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  process.env.DATABASE_URL = assertDatabaseUrl(process.env.DATABASE_URL);
  const appEnv = resolveAppEnv(process.env);

  if (
    appEnv === "production" &&
    process.env.CONFIRM_ADMIN_BOOTSTRAP !== "BOOTSTRAP_ADMIN_USER"
  ) {
    throw new Error(
      "Refusing admin bootstrap when APP_ENV=production without CONFIRM_ADMIN_BOOTSTRAP=BOOTSTRAP_ADMIN_USER.",
    );
  }

  const email = (
    process.env.BOOTSTRAP_ADMIN_EMAIL?.trim() || "admin@rjgc.local"
  ).toLowerCase();
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim() ?? "";
  let generated = false;
  if (!password) {
    if (appEnv === "production") {
      throw new Error("BOOTSTRAP_ADMIN_PASSWORD is required in production.");
    }
    password = `Rjgc-${randomBytes(9).toString("base64url")}!aA1`;
    generated = true;
  }
  if (password.length < 10) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 10 characters.");
  }

  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Club Admin";
  const passwordHash = await hash(password, 12);
  const prisma = new PrismaClient();

  try {
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          role: "SUPER_ADMIN",
          active: true,
          emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        },
      });
      console.log(`Updated admin user: ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: "SUPER_ADMIN",
          active: true,
          emailVerifiedAt: new Date(),
        },
      });
      console.log(`Created admin user: ${email}`);
    }

    console.log("Sign in at /login with that email.");
    if (generated) {
      console.log(`Generated password (save now): ${password}`);
    } else {
      console.log("Password: (value you supplied via BOOTSTRAP_ADMIN_PASSWORD)");
    }
    console.log(
      "Also set AUTH_URL and APP_URL on Vercel to https://rishra-junior-group-club.vercel.app",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
