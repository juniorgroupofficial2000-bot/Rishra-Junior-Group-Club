import { z } from "zod";

export const memberStatusSchema = z.enum([
  "ACTIVE",
  "PENDING",
  "INACTIVE",
  "SUSPENDED",
]);

export type MemberStatusInput = z.infer<typeof memberStatusSchema>;

function emptyToUndefined(value: string | undefined) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const optionalTrimmed = z
  .union([z.string(), z.undefined()])
  .transform(emptyToUndefined)
  .pipe(z.string().max(200).optional());

export const createMemberSchema = z.object({
  membershipNumber: z
    .string()
    .trim()
    .min(3, "Membership number is required.")
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only."),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  displayName: z.string().trim().min(1).max(120),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  phone: optionalTrimmed,
  status: memberStatusSchema.default("PENDING"),
  joinedOn: z.coerce.date().optional().nullable(),
  addressLine1: optionalTrimmed,
  addressLine2: optionalTrimmed,
  city: optionalTrimmed,
  state: optionalTrimmed,
  postalCode: optionalTrimmed,
  country: z.string().trim().length(2).default("IN"),
  internalNotes: z.string().trim().max(2000).optional(),
  planId: z.string().cuid().optional(),
  userId: z.string().cuid().optional().nullable(),
});

export const updateMemberSchema = createMemberSchema
  .omit({ membershipNumber: true })
  .partial()
  .extend({
    membershipNumber: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9-]+$/)
      .optional(),
  });

export const memberStatusUpdateSchema = z.object({
  status: memberStatusSchema,
  reason: z.string().trim().min(3).max(500).optional(),
});

export const adminMemberSearchSchema = z.object({
  query: z.string().trim().max(120).optional(),
  status: memberStatusSchema.optional(),
  includeDeleted: z.boolean().optional().default(false),
  sampleOnly: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type AdminMemberSearchInput = z.infer<typeof adminMemberSearchSchema>;
