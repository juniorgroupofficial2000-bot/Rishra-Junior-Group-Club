import "server-only";

import { AuthorizationError } from "@/server/auth/authorize";
import { logApiError, logDatabaseFailure } from "@/server/observability/events";
import { appLog } from "@/server/observability/logger";
import { errorMessage } from "@/server/observability/redact";
import { NextResponse } from "next/server";

const PRISMA_ERROR_NAMES = new Set([
  "PrismaClientKnownRequestError",
  "PrismaClientUnknownRequestError",
  "PrismaClientRustPanicError",
  "PrismaClientInitializationError",
  "PrismaClientValidationError",
]);

export function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return typeof name === "string" && PRISMA_ERROR_NAMES.has(name);
}

export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

/** Safe message suitable for end users / API clients. */
export function toPublicErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof AuthorizationError) {
    return error.message;
  }
  if (isPrismaError(error)) {
    return "A data error occurred. Please try again or contact support.";
  }
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export type ApiErrorResult = {
  status: number;
  body: { error: string; code?: string };
};

/**
 * Classify an error for App Router API handlers.
 * Logs server-side; never returns secrets or stack traces.
 */
export function classifyApiError(
  error: unknown,
  context: { route: string; method?: string; userId?: string | null },
): ApiErrorResult {
  if (error instanceof AuthorizationError) {
    logApiError({
      route: context.route,
      method: context.method,
      status: error.status,
      error,
      userId: context.userId,
      fields: { code: error.code },
    });
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }

  if (isPrismaError(error)) {
    logDatabaseFailure({ error, fields: { route: context.route } });
    logApiError({
      route: context.route,
      method: context.method,
      status: 500,
      error,
      userId: context.userId,
    });
    return {
      status: 500,
      body: { error: "A data error occurred.", code: "DATABASE_ERROR" },
    };
  }

  logApiError({
    route: context.route,
    method: context.method,
    status: 500,
    error,
    userId: context.userId,
  });
  return {
    status: 500,
    body: { error: "Internal server error.", code: "INTERNAL_ERROR" },
  };
}

export function apiErrorResponse(
  error: unknown,
  context: { route: string; method?: string; userId?: string | null },
): NextResponse {
  const classified = classifyApiError(error, context);
  return NextResponse.json(classified.body, { status: classified.status });
}

/** Log unexpected server action failures (skip Next.js redirect digests). */
export function logServerActionError(
  action: string,
  error: unknown,
  fields?: Record<string, unknown>,
) {
  if (isNextRedirectError(error)) return;
  if (error instanceof AuthorizationError) {
    appLog.warn("admin", "admin_action_denied", {
      action,
      code: error.code,
      errorMessage: errorMessage(error),
      ...fields,
    });
    return;
  }
  if (isPrismaError(error)) {
    logDatabaseFailure({ error, fields: { action, ...fields } });
    return;
  }
  appLog.exception("admin", "admin_action_failed", error, {
    action,
    ...fields,
  });
}
