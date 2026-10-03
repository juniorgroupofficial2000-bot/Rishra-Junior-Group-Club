import "server-only";

import { appLog } from "@/server/observability/logger";
import {
  emailFingerprint,
  errorMessage,
  errorName,
} from "@/server/observability/redact";

export function logAuthFailure(input: {
  reason:
    | "invalid_credentials"
    | "validation"
    | "rate_limited"
    | "inactive_user"
    | "inactive_member"
    | "session_inactive";
  email?: string | null;
  ip?: string | null;
}) {
  appLog.warn("auth", "authentication_failure", {
    reason: input.reason,
    emailFingerprint: emailFingerprint(input.email),
    ip: input.ip ?? undefined,
  });
}

export function logAuthzFailure(input: {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  permission?: string;
  path?: string;
  userId?: string | null;
  role?: string | null;
}) {
  appLog.warn("authz", "authorization_failure", {
    code: input.code,
    permission: input.permission,
    path: input.path,
    userId: input.userId ?? undefined,
    role: input.role ?? undefined,
  });
}

export function logPaymentFailure(input: {
  event: string;
  paymentId?: string | null;
  memberId?: string | null;
  provider?: string | null;
  error?: unknown;
  fields?: Record<string, unknown>;
}) {
  appLog.error("payments", input.event, {
    paymentId: input.paymentId ?? undefined,
    memberId: input.memberId ?? undefined,
    provider: input.provider ?? undefined,
    errorName: errorName(input.error),
    errorMessage: input.error ? errorMessage(input.error) : undefined,
    ...input.fields,
  });
}

export function logWebhookFailure(input: {
  event: string;
  provider?: string | null;
  providerEventId?: string | null;
  retryable?: boolean;
  error?: unknown;
  fields?: Record<string, unknown>;
}) {
  appLog.error("webhooks", input.event, {
    provider: input.provider ?? undefined,
    providerEventId: input.providerEventId ?? undefined,
    retryable: input.retryable,
    errorName: errorName(input.error),
    errorMessage: input.error ? errorMessage(input.error) : undefined,
    ...input.fields,
  });
}

export function logDatabaseFailure(input: {
  operation?: string;
  model?: string;
  error: unknown;
  fields?: Record<string, unknown>;
}) {
  appLog.error("database", "database_failure", {
    operation: input.operation,
    model: input.model,
    errorName: errorName(input.error),
    errorMessage: errorMessage(input.error),
    ...input.fields,
  });
}

export function logApiError(input: {
  route: string;
  method?: string;
  status: number;
  error?: unknown;
  userId?: string | null;
  fields?: Record<string, unknown>;
}) {
  const level = input.status >= 500 ? "error" : "warn";
  const fn = level === "error" ? appLog.error : appLog.warn;
  fn("api", "api_error", {
    route: input.route,
    method: input.method,
    status: input.status,
    userId: input.userId ?? undefined,
    errorName: errorName(input.error),
    errorMessage: input.error ? errorMessage(input.error) : undefined,
    ...input.fields,
  });
}

export function logAdminOperation(input: {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorUserId?: string | null;
  outcome?: "success" | "failure";
  fields?: Record<string, unknown>;
}) {
  const outcome = input.outcome ?? "success";
  const level = outcome === "failure" ? "warn" : "info";
  const fn = level === "warn" ? appLog.warn : appLog.info;
  fn("admin", "admin_operation", {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? undefined,
    actorUserId: input.actorUserId ?? undefined,
    outcome,
    ...input.fields,
  });
}
