import { z } from "zod";
import { emailSchema } from "@/server/validation/email";
import { memberStatusSchema } from "@/server/validation/member";

/**
 * CSV row schema for controlled member import.
 * Unsafe unrestricted file uploads are not supported — callers must pass
 * already-parsed text rows within size limits.
 */
export const memberCsvRowSchema = z.object({
  membershipNumber: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  displayName: z.string().trim().min(1).max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  status: memberStatusSchema.optional().default("PENDING"),
  joinedOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
});

export type MemberCsvRow = z.infer<typeof memberCsvRowSchema>;

export const MEMBER_CSV_HEADERS = [
  "membershipNumber",
  "firstName",
  "lastName",
  "displayName",
  "email",
  "phone",
  "status",
  "joinedOn",
  "city",
  "state",
] as const;

export const CSV_IMPORT_LIMITS = {
  /** Maximum UTF-8 bytes accepted for a single import payload. */
  maxBytes: 256 * 1024,
  /** Maximum data rows (excluding header). */
  maxRows: 500,
} as const;
