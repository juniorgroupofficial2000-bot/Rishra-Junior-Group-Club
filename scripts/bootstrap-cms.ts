/**
 * Idempotent bootstrap of verified public CMS rows (committee, FAQ, home
 * blocks, verified timeline / puja years). Does not wipe data and does not
 * create SAMPLE demo users.
 *
 * Preferred (copy DATABASE_URL from Vercel → Neon, then):
 *   DATABASE_URL='postgresql://…' APP_ENV=development npm run db:bootstrap-cms
 *
 * Or put the real URL in `.env.vercel.local` (gitignored) — do not use the
 * redacted `[SENSITIVE]` placeholder from `vercel env pull` when secrets are
 * hidden.
 *
 * Production lane requires:
 *   CONFIRM_CMS_BOOTSTRAP=BOOTSTRAP_VERIFIED_CMS
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { resolveAppEnv } from "../config/app-env";
import { PrismaClient } from "@prisma/client";

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
    // Do not override an explicit shell export.
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

function normalizeDatabaseUrl(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) {
    throw new Error(
      "DATABASE_URL is not set.\n\nCopy the Postgres URL from Vercel → Storage/Neon (or Environment Variables), then run:\n  DATABASE_URL='postgresql://…' APP_ENV=development npm run db:bootstrap-cms",
    );
  }
  if (
    value === "[SENSITIVE]" ||
    value.includes("[SENSITIVE]") ||
    (!value.startsWith("postgresql://") && !value.startsWith("postgres://"))
  ) {
    throw new Error(
      `DATABASE_URL is not a valid Postgres URL (got "${value.slice(0, 24)}${value.length > 24 ? "…" : ""}").\n\n` +
        "`vercel env pull` often writes [SENSITIVE] for secrets you cannot read back.\n" +
        "Open Vercel → your Neon database → copy the connection string, then:\n" +
        "  DATABASE_URL='postgresql://…' APP_ENV=development npm run db:bootstrap-cms",
    );
  }
  return value;
}

async function main() {
  // Prefer an explicit local override file, then .env.vercel, then .env.
  loadEnvFile(resolve(process.cwd(), ".env.vercel.local"));
  loadEnvFile(resolve(process.cwd(), ".env.vercel"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  const databaseUrl = normalizeDatabaseUrl("postgresql://neondb_owner:npg_FV3X0yshRzuQ@ep-snowy-dust-b81bd9cv-pooler.c-14.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
  process.env.DATABASE_URL = databaseUrl;

  const appEnv = resolveAppEnv(process.env);

  if (
    appEnv === "production" &&
    process.env.CONFIRM_CMS_BOOTSTRAP !== "BOOTSTRAP_VERIFIED_CMS"
  ) {
    throw new Error(
      "Refusing CMS bootstrap when APP_ENV=production without CONFIRM_CMS_BOOTSTRAP=BOOTSTRAP_VERIFIED_CMS.",
    );
  }

  const prisma = new PrismaClient();
  try {
    // Fail with a clear next step if migrate deploy was never run.
    try {
      await prisma.$queryRaw`SELECT 1 FROM "PublicCommitteeMember" LIMIT 1`;
      await prisma.$queryRaw`SELECT 1 FROM "Committee" LIMIT 1`;
    } catch {
      throw new Error(
        'Required tables are missing. Run migrations first:\n' +
          "  DATABASE_URL='postgresql://…' APP_ENV=development npx prisma migrate deploy\n" +
          "Then re-run: npm run db:bootstrap-cms",
      );
    }

    const beforeRoster = await prisma.publicCommitteeMember.count({
      where: { deletedAt: null },
    });
    const beforeCommittees = await prisma.committee.count({
      where: { deletedAt: null },
    });

    const { seedPublicCmsContent } = await import("../prisma/seed-cms-content");
    await seedPublicCmsContent(prisma, null);

    const afterRoster = await prisma.publicCommitteeMember.count({
      where: { deletedAt: null, status: "PUBLISHED" },
    });
    const afterCommittees = await prisma.committee.count({
      where: { deletedAt: null, status: "PUBLISHED" },
    });

    console.log(
      `CMS bootstrap complete (APP_ENV=${appEnv}). Roster: ${beforeRoster} → ${afterRoster} published. Committees: ${beforeCommittees} → ${afterCommittees} published.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
