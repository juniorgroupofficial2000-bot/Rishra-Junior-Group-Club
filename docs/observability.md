# Production observability

RJGC emits **structured JSON logs** to stdout/stderr, uses **route and component error boundaries** for user-facing failures, and keeps **audit events** for admin accountability. This document describes what is logged, what must never be logged, and how to monitor the service in production.

## Goals

- Detect authentication, authorization, payment, webhook, database, API, and admin failures quickly.
- Correlate user-visible errors (`error.digest`) with server logs.
- Avoid logging passwords, tokens, CVV, UPI PIN, payment secrets, or unnecessary personal information.

## Structured logging

### Format

Every operational log line is a single JSON object:

```json
{
  "ts": "2026-10-03T00:00:00.000Z",
  "level": "error",
  "scope": "webhooks",
  "event": "webhook_processing_failed",
  "service": "rjgc",
  "env": "production",
  "provider": "razorpay",
  "errorMessage": "…"
}
```

| Field | Meaning |
| --- | --- |
| `ts` | ISO-8601 timestamp |
| `level` | `debug` \| `info` \| `warn` \| `error` |
| `scope` | Subsystem: `auth`, `authz`, `payments`, `webhooks`, `database`, `api`, `admin`, `app`, `client` |
| `event` | Stable machine-readable name (snake_case) |
| `service` | Always `rjgc` |
| `env` | `NODE_ENV` |

Implementation: `server/observability/logger.ts` (`appLog`, `createScopedLog`).

Payment code may still import `paymentLog` from `server/payments/logging.ts`; it is a scoped wrapper around the same logger (`scope: "payments"`).

### Event catalogue (primary)

| Scope | Event examples | When |
| --- | --- | --- |
| `auth` | `authentication_failure` | Invalid credentials, inactive user/member, rate limit, validation |
| `authz` | `authorization_failure` | Missing session, portal/permission denial (pages + APIs) |
| `payments` | `payment_initiated`, `mandate_setup_failed`, `reconciliation_payment_failed` | Payment lifecycle / provider failures |
| `webhooks` | `webhook_signature_invalid`, `webhook_processing_failed`, `webhook_route_error` | Provider webhook path |
| `database` | `database_failure` / Prisma `error` listener | Prisma client errors |
| `api` | `api_error` | Unhandled / classified API route failures |
| `admin` | `admin_operation`, `admin_action_failed` | Audit-backed admin mutations + action failures |
| `app` | `server_register`, `request_error` | Boot + Next.js `onRequestError` |
| `client` | `route_error_boundary`, `global_error_boundary` | Browser JSON via `reportClientError` |

Helpers live in `server/observability/events.ts` and `server/observability/errors.ts`.

### Redaction rules

Shared redaction: `server/observability/redact.ts`.

**Never log (always redacted by key name):**

- Passwords / password hashes
- Tokens, API keys, Authorization headers, cookies, session secrets
- CVV / CVC, PAN / card numbers
- UPI PIN, OTP, banking passwords
- Webhook secrets, Razorpay (or other provider) secret keys

**Operational logs additionally redact unnecessary PII keys:** email, phone, address, name fields, DOB, account numbers, etc.

**Allowed identifiers (prefer these):**

- User / member / payment / mandate / media IDs
- Provider event IDs and public order/payment refs
- Roles, permission names, routes, HTTP status codes
- Email **fingerprints** only (`me***@domain`) via `emailFingerprint()` — never full passwords or raw credentials

Audit metadata (`sanitizeAuditMetadata`) still redacts secrets but may retain email for accountability inside the append-only audit table. Operational stdout logs use the stricter `redactLogMetadata`.

## Error handling UX

| Surface | File | Behavior |
| --- | --- | --- |
| Public routes | `app/(public)/error.tsx` | Friendly copy + Try again + home |
| Member portal | `app/(member)/error.tsx` | Portal-scoped recovery |
| Admin portal | `app/(admin)/error.tsx` | Does **not** show raw `error.message` |
| App root | `app/error.tsx` | Catch-all segment boundary |
| Root layout failure | `app/global-error.tsx` | Own `<html>`/`<body>`; minimal inline styles |
| Not found | `app/not-found.tsx` | Existing 404 page |
| Component islands | `components/errors/error-boundary.tsx` | Isolate widgets (e.g. media upload) |

Shared UI: `components/errors/route-error-fallback.tsx`. Client reports use `lib/observability/client-report.ts` (structured `console.error` JSON with digest).

Users see a **reference digest** when available; match it to server `request_error.digest` / Next.js logs.

## Server-side error handling

1. **API routes** — Prefer `apiErrorResponse` / `classifyApiError` (`server/observability/errors.ts`) in `catch` blocks. Maps:
   - `AuthorizationError` → 401/403 + `logAuthzFailure` / `api_error`
   - Prisma errors → 500 `DATABASE_ERROR` + `database_failure`
   - Unknown → 500 `INTERNAL_ERROR` (no stack/secrets to clients)
2. **Server actions** — Use `logServerActionError` for unexpected failures; skip Next.js redirect digests.
3. **Prisma** — Client listens for `error` events and emits `database_failure` (`server/db/prisma.ts`).
4. **Instrumentation** — `instrumentation.ts` exports `register` and `onRequestError` so uncaught App Router / action / route errors are logged centrally.

Expected validation / business errors should continue to return typed action results (not throw) where that pattern already exists.

## Audit vs observability

| Concern | Mechanism |
| --- | --- |
| Who changed what (compliance) | `writeAuditEvent` → `AuditLog` table |
| Ops alerting / dashboards | Structured stdout JSON |
| Admin ops signal | Every successful audit write also emits `admin_operation` |

Do not treat logs as a substitute for the audit table for financial or permission changes.

## Monitoring recommendations

### Log shipping

- Capture **stdout/stderr** from the Node process (container / PM2 / systemd / platform logs).
- Parse as JSON. Index at least: `level`, `scope`, `event`, `env`, `digest`, `provider`, `route` / `path`, `status`.

### Suggested alerts

| Alert | Query idea | Severity |
| --- | --- | --- |
| Auth abuse | Spike of `scope=auth` `event=authentication_failure` `reason=rate_limited` | Medium |
| Authz anomalies | Sudden rise in `authorization_failure` for admin paths | Medium |
| Payment failures | `scope=payments` level=error (e.g. `mandate_setup_failed`) | High |
| Webhook health | `webhook_signature_invalid` or sustained `webhook_processing_failed` | High |
| DB errors | `scope=database` or `isPrisma=true` on `request_error` | Critical |
| API 5xx | `scope=api` `status>=500` | High |
| Uncaught renders | `event=request_error` `routeType=render` | High |

### Dashboards

- **Auth**: failures by `reason`, rate-limit share.
- **Payments**: initiated vs failed; reconciliation error count.
- **Webhooks**: processed / duplicate / failed / signature invalid (by provider).
- **Admin**: `admin_operation` volume by `action` / `entityType`.
- **Errors**: `request_error` and client `route_error_boundary` by path (client logs only if you also collect browser logs).

### Optional APM / error trackers

Wire an OpenTelemetry exporter or Sentry/Datadog inside `instrumentation.ts` `register` / `onRequestError` **without** sending request bodies, cookies, or payment fields. Keep the same redaction rules before any third-party export.

### Health checks

- Platform HTTP health on a cheap public path (e.g. home or a dedicated health route if added later).
- Separate synthetic check that posts a **signed** test webhook in staging only — never in production without a dedicated test mode.

### Retention

- Application logs: 30–90 days depending on hosting cost and incident needs.
- Audit DB rows: retain per club policy (financial/admin accountability); not rotated with app logs.

## Local development

- Logs print as JSON to the terminal (`next dev`).
- `debug` level is suppressed in production.
- Unit coverage for redaction/classification: `tests/ops/observability.test.ts` and `tests/ops/audit-sanitize.test.ts`.

## Checklist before go-live

- [ ] Production log drain parses JSON and alerts on the table above.
- [ ] Confirm a deliberate auth failure emits `authentication_failure` **without** a password field.
- [ ] Confirm a webhook signature failure emits `webhook_signature_invalid` and returns 401.
- [ ] Confirm UI error pages show digest only (no internal stacks) in `NODE_ENV=production`.
- [ ] Confirm `AUTH_SECRET`, Razorpay secrets, and DB URL never appear in log samples.
