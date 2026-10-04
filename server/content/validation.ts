import { z } from "zod";

export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const provenanceSchema = z.enum(["verified", "sample", "placeholder"]);

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case slugs.");

/** Accepts Prisma cuid() and our media createId() format. */
const mediaAssetIdSchema = z
  .string()
  .trim()
  .regex(/^c[a-z0-9]{8,40}$/i, "Invalid media asset id.")
  .optional()
  .nullable();

export const siteContentBlockSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, "Invalid content key."),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional().nullable(),
  body: z.record(z.string(), z.unknown()),
  status: contentStatusSchema.default("DRAFT"),
  historicallyImportant: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
});

export const timelineEntrySchema = z.object({
  yearLabel: z.string().trim().min(1).max(40),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
    .optional()
    .nullable(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  imageJson: z.unknown().optional().nullable(),
  galleryJson: z.unknown().optional().nullable(),
  milestone: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  status: contentStatusSchema.default("DRAFT"),
  provenance: provenanceSchema.default("placeholder"),
  historicallyImportant: z.boolean().default(false),
  isSample: z.boolean().default(false),
});

export const faqItemSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(8000),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  status: contentStatusSchema.default("DRAFT"),
  historicallyImportant: z.boolean().default(false),
});

const pujaScheduleStageSchema = z.enum([
  "PREPARATION",
  "DECORATION",
  "PUJA",
  "PUSHPANJALI",
  "CULTURAL",
  "PRASAD",
  "IMMERSION",
  "OTHER",
]);

export const pujaScheduleItemSchema = z.object({
  stage: pujaScheduleStageSchema.default("OTHER"),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  status: contentStatusSchema.default("PUBLISHED"),
});

export const pujaYearSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(4000),
  theme: z.string().trim().max(200).optional().nullable(),
  startsOn: z.coerce.date().optional().nullable(),
  endsOn: z.coerce.date().optional().nullable(),
  locationLabel: z.string().trim().max(200).optional().nullable(),
  locationDetail: z.string().trim().max(500).optional().nullable(),
  committeeNote: z.string().trim().max(4000).optional().nullable(),
  highlights: z.array(z.string().trim().min(1).max(300)).max(20).optional().nullable(),
  coverJson: z.unknown().optional().nullable(),
  coverAssetId: mediaAssetIdSchema,
  galleryJson: z.unknown().optional().nullable(),
  videosJson: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        url: z.string().trim().url().max(1000),
        poster: z.string().trim().max(1000).optional(),
      }),
    )
    .max(20)
    .optional()
    .nullable(),
  documentsJson: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        url: z.string().trim().url().max(1000),
      }),
    )
    .max(20)
    .optional()
    .nullable(),
  schedule: z.array(pujaScheduleItemSchema).max(40).optional().nullable(),
  href: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  status: contentStatusSchema.default("DRAFT"),
  provenance: provenanceSchema.default("placeholder"),
  historicallyImportant: z.boolean().default(false),
  isSample: z.boolean().default(false),
});

export const publicCommitteeMemberSchema = z.object({
  roleKey: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Use snake_case role keys."),
  roleTitle: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  familiarName: z.string().trim().max(80).optional().nullable(),
  displayName: z.string().trim().min(1).max(160),
  biography: z.string().trim().max(4000).optional().nullable(),
  termYear: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  status: contentStatusSchema.default("DRAFT"),
  historicallyImportant: z.boolean().default(false),
  positionId: z.string().cuid().optional().nullable(),
  portraitAssetId: mediaAssetIdSchema,
});

export const committeePositionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9_]+$/, "Use UPPER_SNAKE_CASE codes."),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  active: z.boolean().default(true),
  historicallyImportant: z.boolean().default(false),
});

export const eventContentSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(8000).optional().nullable(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional().nullable(),
  venueLabel: z.string().trim().max(200).optional().nullable(),
  category: z.enum(["event", "meeting"]).default("event"),
  status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
  contentStatus: contentStatusSchema.default("DRAFT"),
  registrationRequired: z.boolean().default(false),
  capacity: z.coerce.number().int().min(1).max(100000).optional().nullable(),
  coverAssetId: mediaAssetIdSchema,
  historicallyImportant: z.boolean().default(false),
  isSample: z.boolean().default(false),
});

export const announcementStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const announcementPrioritySchema = z.enum([
  "NORMAL",
  "HIGH",
  "URGENT",
]);

export const announcementContentSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().min(1).max(20000),
  status: announcementStatusSchema.default("DRAFT"),
  priority: announcementPrioritySchema.default("NORMAL"),
  category: z
    .enum(["general", "events", "membership", "puja", "urgent"])
    .default("general"),
  pinned: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  coverAssetId: mediaAssetIdSchema,
  historicallyImportant: z.boolean().default(false),
  isSample: z.boolean().default(false),
});

export const galleryAlbumSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional().nullable(),
  contentStatus: contentStatusSchema.default("DRAFT"),
  historicallyImportant: z.boolean().default(false),
  year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  coverUrl: z.string().trim().max(1000).optional().nullable(),
  coverAlt: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
  isSample: z.boolean().default(false),
});

export const galleryMediaSchema = z
  .object({
    albumId: z.string().cuid(),
    type: z.enum(["IMAGE", "VIDEO", "OTHER"]).default("IMAGE"),
    url: z.string().trim().max(1000).optional().nullable(),
    mediaAssetId: mediaAssetIdSchema,
    alt: z.string().trim().max(300).optional().nullable(),
    caption: z.string().trim().max(500).optional().nullable(),
    sortOrder: z.coerce.number().int().min(0).max(99999).default(0),
    contentStatus: contentStatusSchema.default("DRAFT"),
    historicallyImportant: z.boolean().default(false),
    isSample: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (!value.mediaAssetId && !value.url?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Provide a media asset ID or a URL.",
        path: ["url"],
      });
    }
  });

export type ContentStatusValue = z.infer<typeof contentStatusSchema>;
