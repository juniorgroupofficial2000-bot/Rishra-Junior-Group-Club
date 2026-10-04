import { z } from "zod";

/**
 * Practical email validation for auth and admin forms.
 * Accepts reserved TLDs such as `.local` used by sandbox seed accounts.
 * Rejects whitespace and obviously malformed addresses.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Enter a valid email address.")
  .max(254, "Enter a valid email address.")
  .regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Enter a valid email address.",
  );
