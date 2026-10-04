/**
 * Publish photos from public/images/gallery/puja/{year} into PujaYear + Gallery albums.
 *
 *   APP_ENV=development npm run db:bootstrap-puja-photos
 */
import { existsSync, readFileSync } from "node:fs";
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
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.vercel.local"));
  loadEnvFile(resolve(process.cwd(), ".env.vercel"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set.");
  }

  const appEnv = resolveAppEnv(process.env);
  if (
    appEnv === "production" &&
    process.env.CONFIRM_CMS_BOOTSTRAP !== "BOOTSTRAP_VERIFIED_CMS"
  ) {
    throw new Error(
      "Refusing puja photo bootstrap when APP_ENV=production without CONFIRM_CMS_BOOTSTRAP=BOOTSTRAP_VERIFIED_CMS.",
    );
  }

  const prisma = new PrismaClient();
  try {
    const { seedPujaFolderPhotos } = await import(
      "../prisma/seed-puja-folder-photos"
    );
    const result = await seedPujaFolderPhotos(prisma, null);
    console.log(
      `Puja photo bootstrap complete (APP_ENV=${appEnv}).`,
      result,
    );
    if (result.yearsWithPhotos.length === 0) {
      console.log(
        "No photos found. Add images under public/images/gallery/puja/{year}/ then re-run.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
