import "server-only";

import {
  errorMessage,
  errorName,
  redactLogMetadata,
} from "@/server/observability/redact";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogScope =
  | "auth"
  | "authz"
  | "payments"
  | "webhooks"
  | "database"
  | "api"
  | "admin"
  | "app"
  | "client";

export type LogFields = Record<string, unknown>;

type LogEntry = {
  ts: string;
  level: LogLevel;
  scope: LogScope;
  event: string;
  service: "rjgc";
  env: string;
  [key: string]: unknown;
};

const LOG_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredMinLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (appEnv === "production") return "warn";
  if (appEnv === "staging") return "info";
  if (process.env.NODE_ENV === "production") return "info";
  return "debug";
}

function emit(level: LogLevel, scope: LogScope, event: string, fields?: LogFields) {
  if (LOG_RANK[level] < LOG_RANK[configuredMinLevel()]) {
    return;
  }

  const safe = redactLogMetadata(fields ?? {}) ?? {};
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    service: "rjgc",
    env: process.env.APP_ENV ?? process.env.NODE_ENV ?? "development",
    ...safe,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}

export const appLog = {
  debug: (scope: LogScope, event: string, fields?: LogFields) =>
    emit("debug", scope, event, fields),
  info: (scope: LogScope, event: string, fields?: LogFields) =>
    emit("info", scope, event, fields),
  warn: (scope: LogScope, event: string, fields?: LogFields) =>
    emit("warn", scope, event, fields),
  error: (scope: LogScope, event: string, fields?: LogFields) =>
    emit("error", scope, event, fields),

  /** Attach a thrown error without leaking stacks with secrets. */
  exception(
    scope: LogScope,
    event: string,
    error: unknown,
    fields?: LogFields,
  ) {
    emit("error", scope, event, {
      ...fields,
      errorName: errorName(error),
      errorMessage: errorMessage(error),
    });
  },
};

/** Scoped helper used by payment code paths. */
export function createScopedLog(scope: LogScope) {
  return {
    info: (event: string, fields?: LogFields) =>
      appLog.info(scope, event, fields),
    warn: (event: string, fields?: LogFields) =>
      appLog.warn(scope, event, fields),
    error: (event: string, fields?: LogFields) =>
      appLog.error(scope, event, fields),
  };
}
