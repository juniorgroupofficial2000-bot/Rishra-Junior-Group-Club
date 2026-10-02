const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|api[_-]?key|authorization|cvv|cvc|pan|card[_-]?number|upi[_-]?pin|pin|otp|bank[_-]?password|credential|private[_-]?key)/i;

/**
 * Strip secrets and payment credentials from audit metadata.
 * Never persist raw card/CVV/UPI PIN/banking passwords.
 */
export function sanitizeAuditMetadata(
  metadata: unknown,
  depth = 0,
): Record<string, unknown> | unknown[] | string | number | boolean | null {
  if (metadata == null) return null;
  if (depth > 6) return "[truncated]";

  if (Array.isArray(metadata)) {
    return metadata.map((item) => sanitizeAuditMetadata(item, depth + 1));
  }

  if (typeof metadata !== "object") {
    if (typeof metadata === "string" && metadata.length > 500) {
      return `${metadata.slice(0, 500)}…`;
    }
    return metadata as string | number | boolean;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = sanitizeAuditMetadata(value, depth + 1);
  }
  return out;
}
