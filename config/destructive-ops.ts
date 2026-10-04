import { resolveAppEnv } from "@/config/app-env";
import {
  looksLikeLocalDatabaseUrl,
  mergeProductionMarkers,
} from "@/config/isolation";

export type DestructiveOp =
  | "database_reset"
  | "database_seed_wipe"
  | "financial_hard_delete"
  | "bulk_member_purge"
  | "storage_bucket_purge";

function containsMarker(value: string | undefined, markers: string[]): boolean {
  if (!value || markers.length === 0) return false;
  const hay = value.toLowerCase();
  return markers.some((marker) => hay.includes(marker));
}

/**
 * Fail-closed gate for destructive database / storage operations.
 * Production never allows these. Staging requires explicit dual confirmation.
 * Non-production refuses DATABASE_URL matching production markers.
 *
 * Safe to import from Prisma seed (no `server-only`).
 */
export function assertDestructiveOpAllowed(
  op: DestructiveOp,
  options?: { source?: NodeJS.ProcessEnv },
): void {
  const source = options?.source ?? process.env;
  const appEnv = resolveAppEnv(source);
  const databaseUrl = source.DATABASE_URL?.trim();
  const markers = mergeProductionMarkers(source.PRODUCTION_RESOURCE_MARKERS);

  if (appEnv === "production") {
    throw new Error(
      `Refusing destructive operation "${op}" when APP_ENV=production.`,
    );
  }

  if (containsMarker(databaseUrl, markers)) {
    throw new Error(
      `Refusing destructive operation "${op}": DATABASE_URL matches production resource markers.`,
    );
  }

  if (appEnv === "staging") {
    const allow =
      source.ALLOW_DESTRUCTIVE_OPS === "true" &&
      source.DESTRUCTIVE_OPS_CONFIRM === "I_UNDERSTAND_DATA_LOSS";
    if (!allow) {
      throw new Error(
        `Refusing destructive operation "${op}" in staging. Set ALLOW_DESTRUCTIVE_OPS=true and DESTRUCTIVE_OPS_CONFIRM=I_UNDERSTAND_DATA_LOSS.`,
      );
    }
  }

  if (
    appEnv === "local" &&
    databaseUrl &&
    !looksLikeLocalDatabaseUrl(databaseUrl) &&
    source.ALLOW_REMOTE_LOCAL_DATABASE !== "true"
  ) {
    throw new Error(
      `Refusing destructive operation "${op}" against a non-local DATABASE_URL in APP_ENV=local. Use a local database or set ALLOW_REMOTE_LOCAL_DATABASE=true deliberately.`,
    );
  }
}
