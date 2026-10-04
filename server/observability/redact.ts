/**
 * Shared redaction for structured logs and audit metadata.
 * Never persist passwords, tokens, CVV, UPI PIN, or payment secrets.
 */

const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|api[_-]?key|authorization|auth[_-]?header|bearer|cookie|session|cvv|cvc|pan|card[_-]?number|upi[_-]?pin|pin|otp|bank[_-]?password|credential|private[_-]?key|webhook[_-]?secret|razorpay[_-]?key|access[_-]?key|secret[_-]?access)/i;

/** Extra keys treated as unnecessary PII in operational logs (not audit). */
const PII_KEY_PATTERN =
  /^(email|e[_-]?mail|phone|mobile|address|street|full[_-]?name|first[_-]?name|last[_-]?name|dob|date[_-]?of[_-]?birth|aadhaar|pan[_-]?number|account[_-]?number|ifsc)$/i;

const MAX_STRING = 500;
const MAX_DEPTH = 6;

export type RedactMode = "audit" | "log";

function redactValue(
  value: unknown,
  mode: RedactMode,
  depth: number,
): unknown {
  if (value == null) return null;
  if (depth > MAX_DEPTH) return "[truncated]";

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, mode, depth + 1));
  }

  if (typeof value !== "object") {
    if (typeof value === "string" && value.length > MAX_STRING) {
      return `${value.slice(0, MAX_STRING)}…`;
    }
    return value as string | number | boolean;
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    if (mode === "log" && PII_KEY_PATTERN.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = redactValue(nested, mode, depth + 1);
  }
  return out;
}

/**
 * Strip secrets and payment credentials from audit metadata.
 * Emails may remain for accountability; payment secrets never do.
 */
export function sanitizeAuditMetadata(
  metadata: unknown,
  depth = 0,
): Record<string, unknown> | unknown[] | string | number | boolean | null {
  const result = redactValue(metadata, "audit", depth);
  if (result == null) return null;
  return result as
    | Record<string, unknown>
    | unknown[]
    | string
    | number
    | boolean;
}

/**
 * Stricter redaction for operational logs — also drops unnecessary PII.
 */
export function redactLogMetadata(
  metadata: unknown,
): Record<string, unknown> | undefined {
  if (metadata == null) return undefined;
  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    return { value: redactValue(metadata, "log", 0) };
  }
  return redactValue(metadata, "log", 0) as Record<string, unknown>;
}

/** Hash-like short fingerprint for correlation without storing raw email. */
export function emailFingerprint(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf("@");
  if (at < 1) return "invalid";
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const prefix = local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

/** Scrub credential-like substrings that sometimes appear in thrown messages. */
function scrubMessage(message: string): string {
  return message
    .replace(
      /(password|passwd|secret|token|api[_-]?key|cvv|cvc|upi[_-]?pin|authorization)\s*[:=]\s*\S+/gi,
      "$1=[redacted]",
    )
    .replace(
      /\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s"'`]+/gi,
      "$1://[redacted]",
    )
    .replace(/\bBearer\s+[A-Za-z0-9._\-+=/]+/gi, "Bearer [redacted]")
    .replace(/\brzp_(live|test)_[A-Za-z0-9]+/gi, "rzp_$1_[redacted]")
    .replace(/\bre_[A-Za-z0-9]+/gi, "re_[redacted]")
    .slice(0, MAX_STRING);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return scrubMessage(error.message);
  if (typeof error === "string") return scrubMessage(error);
  return "unknown";
}

export function errorName(error: unknown): string | undefined {
  if (error instanceof Error) return error.name;
  return undefined;
}
