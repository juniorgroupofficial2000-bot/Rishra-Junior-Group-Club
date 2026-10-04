import { emailSchema } from "@/server/validation/email";
import { z } from "zod";

export const memberStatusSchema = z.enum([
  "APPLICATION",
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
  "ARCHIVED",
]);

export type MemberStatusInput = z.infer<typeof memberStatusSchema>;

/** Optional string fields: trim, treat blank as omitted. */
const optionalTrimmed = z.preprocess((value) => {
  if (value == null) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(200).optional());

export const createMemberSchema = z.object({
  /** Optional — auto-allocated as RJGC-YYYY-NNNN when omitted. */
  membershipNumber: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only.")
    .optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  displayName: z.string().trim().min(1).max(120),
  email: emailSchema,
  phone: optionalTrimmed,
  dateOfBirth: z.coerce.date().optional().nullable(),
  status: memberStatusSchema.default("PENDING"),
  joinedOn: z.coerce.date().optional().nullable(),
  addressLine1: optionalTrimmed,
  addressLine2: optionalTrimmed,
  city: optionalTrimmed,
  state: optionalTrimmed,
  postalCode: optionalTrimmed,
  country: z.string().trim().length(2).default("IN"),
  emergencyContactName: optionalTrimmed,
  emergencyContactPhone: optionalTrimmed,
  internalNotes: z.string().trim().max(2000).optional(),
  reviewNotes: z.string().trim().max(2000).optional(),
  planId: z.string().cuid().optional(),
  userId: z.string().cuid().optional().nullable(),
  portraitAssetId: z.string().cuid().optional().nullable(),
});

/** Profile updates — membershipNumber is immutable and omitted. */
export const updateMemberSchema = createMemberSchema
  .omit({ membershipNumber: true, status: true })
  .partial();

export const memberStatusUpdateSchema = z.object({
  status: memberStatusSchema,
  reason: z.string().trim().min(3).max(500).optional(),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export const memberLifecycleActionSchema = z.object({
  action: z.enum([
    "start_review",
    "approve",
    "activate",
    "reject",
    "request_changes",
    "suspend",
    "reactivate",
    "archive",
  ]),
  reason: z.string().trim().min(3).max(500).optional(),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export const adminMemberSearchSchema = z.object({
  query: z.string().trim().max(120).optional(),
  status: memberStatusSchema.optional(),
  planId: z.string().cuid().optional(),
  committeeRole: z.string().trim().max(80).optional(),
  joinedFrom: z.coerce.date().optional(),
  joinedTo: z.coerce.date().optional(),
  ids: z.array(z.string().cuid()).max(200).optional(),
  sortBy: z
    .enum([
      "updatedAt",
      "joinedOn",
      "membershipNumber",
      "displayName",
      "status",
    ])
    .optional()
    .default("updatedAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  includeDeleted: z.boolean().optional().default(false),
  sampleOnly: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type AdminMemberSearchInput = z.infer<typeof adminMemberSearchSchema>;
export type MemberLifecycleActionInput = z.infer<
  typeof memberLifecycleActionSchema
>;
