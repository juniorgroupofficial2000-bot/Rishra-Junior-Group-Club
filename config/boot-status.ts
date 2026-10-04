import "server-only";

/**
 * Captures a non-fatal boot configuration problem for non-production lanes so
 * the public site can still render while operators fix Vercel env vars.
 */
let bootConfigError: string | null = null;

export function setBootConfigError(message: string | null): void {
  bootConfigError = message;
}

export function getBootConfigError(): string | null {
  return bootConfigError;
}
