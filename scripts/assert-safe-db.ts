/**
 * CLI guard for npm database scripts.
 *
 * Modes:
 *   (default)  — migrate dev / seed: refuse production + production-marked URLs
 *   --deploy   — migrate deploy: allowed in production; non-prod still refuses markers
 *   --reset    — migrate reset: local/dev only with dual confirmation
 */
import { resolveAppEnv } from "../config/app-env";
import {
  looksLikeLocalDatabaseUrl,
  mergeProductionMarkers,
} from "../config/isolation";

function containsMarker(value: string | undefined, markers: string[]): boolean {
  if (!value || markers.length === 0) return false;
  const hay = value.toLowerCase();
  return markers.some((marker) => hay.includes(marker));
}

const isReset = process.argv.includes("--reset");
const isDeploy = process.argv.includes("--deploy");
const appEnv = resolveAppEnv(process.env);
const databaseUrl = process.env.DATABASE_URL?.trim();
const markers = mergeProductionMarkers(process.env.PRODUCTION_RESOURCE_MARKERS);

if (!databaseUrl) {
  console.error("[assert-safe-db] DATABASE_URL is not set.");
  process.exit(1);
}

if (isReset) {
  if (appEnv === "production" || appEnv === "staging") {
    console.error(
      `[assert-safe-db] prisma migrate reset is forbidden when APP_ENV=${appEnv}.`,
    );
    process.exit(1);
  }
  if (containsMarker(databaseUrl, markers)) {
    console.error(
      "[assert-safe-db] DATABASE_URL matches PRODUCTION_RESOURCE_MARKERS — aborting reset.",
    );
    process.exit(1);
  }
  if (appEnv === "local" && !looksLikeLocalDatabaseUrl(databaseUrl)) {
    if (process.env.ALLOW_REMOTE_LOCAL_DATABASE !== "true") {
      console.error(
        "[assert-safe-db] Refusing reset against non-local DATABASE_URL.",
      );
      process.exit(1);
    }
  }
  if (
    process.env.ALLOW_DESTRUCTIVE_OPS !== "true" ||
    process.env.DESTRUCTIVE_OPS_CONFIRM !== "I_UNDERSTAND_DATA_LOSS"
  ) {
    console.error(
      "[assert-safe-db] Reset requires ALLOW_DESTRUCTIVE_OPS=true and DESTRUCTIVE_OPS_CONFIRM=I_UNDERSTAND_DATA_LOSS.",
    );
    process.exit(1);
  }
  console.log(`[assert-safe-db] OK reset (APP_ENV=${appEnv})`);
  process.exit(0);
}

if (isDeploy) {
  if (appEnv === "production") {
    if (looksLikeLocalDatabaseUrl(databaseUrl)) {
      console.error(
        "[assert-safe-db] Refusing production migrate deploy against a local DATABASE_URL.",
      );
      process.exit(1);
    }
  } else if (containsMarker(databaseUrl, markers)) {
    console.error(
      `[assert-safe-db] APP_ENV=${appEnv} refuses migrate deploy against production-marked DATABASE_URL.`,
    );
    process.exit(1);
  }
  console.log(`[assert-safe-db] OK deploy (APP_ENV=${appEnv})`);
  process.exit(0);
}

// Default: local migrate / seed paths — never production.
if (appEnv === "production") {
  console.error(
    "[assert-safe-db] Refusing database CLI when APP_ENV=production. Use db:migrate:deploy in CI/CD only.",
  );
  process.exit(1);
}

if (containsMarker(databaseUrl, markers)) {
  console.error(
    "[assert-safe-db] DATABASE_URL matches PRODUCTION_RESOURCE_MARKERS — aborting.",
  );
  process.exit(1);
}

if (
  appEnv === "local" &&
  !looksLikeLocalDatabaseUrl(databaseUrl) &&
  process.env.ALLOW_REMOTE_LOCAL_DATABASE !== "true"
) {
  console.error(
    "[assert-safe-db] APP_ENV=local requires a local DATABASE_URL (or ALLOW_REMOTE_LOCAL_DATABASE=true).",
  );
  process.exit(1);
}

console.log(`[assert-safe-db] OK (APP_ENV=${appEnv})`);
