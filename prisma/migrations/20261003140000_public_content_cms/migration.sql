-- Public content CMS: draft/published/archived, historical protection, new collections.

CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ─── Extend existing content tables ──────────────────────────────────────────

ALTER TABLE "CommitteePosition"
  ADD COLUMN "historicallyImportant" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Event"
  ADD COLUMN "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "historicallyImportant" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Event"
SET "contentStatus" = 'PUBLISHED'
WHERE "published" = true AND "deletedAt" IS NULL;

CREATE INDEX "Event_contentStatus_idx" ON "Event"("contentStatus");

ALTER TABLE "GalleryAlbum"
  ADD COLUMN "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "year" INTEGER,
  ADD COLUMN "coverUrl" TEXT,
  ADD COLUMN "coverAlt" TEXT,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "GalleryAlbum"
SET "contentStatus" = 'PUBLISHED'
WHERE "published" = true AND "deletedAt" IS NULL;

CREATE INDEX "GalleryAlbum_contentStatus_idx" ON "GalleryAlbum"("contentStatus");
CREATE INDEX "GalleryAlbum_sortOrder_idx" ON "GalleryAlbum"("sortOrder");

ALTER TABLE "GalleryMedia"
  ADD COLUMN "alt" TEXT,
  ADD COLUMN "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "historicallyImportant" BOOLEAN NOT NULL DEFAULT false;

UPDATE "GalleryMedia"
SET "contentStatus" = 'PUBLISHED'
WHERE "deletedAt" IS NULL;

CREATE INDEX "GalleryMedia_contentStatus_idx" ON "GalleryMedia"("contentStatus");

-- Drop CASCADE so album hard-delete cannot wipe media rows.
ALTER TABLE "GalleryMedia" DROP CONSTRAINT IF EXISTS "GalleryMedia_albumId_fkey";
ALTER TABLE "GalleryMedia"
  ADD CONSTRAINT "GalleryMedia_albumId_fkey"
  FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Announcement"
  ADD COLUMN "summary" TEXT,
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "historicallyImportant" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Announcement_sortOrder_idx" ON "Announcement"("sortOrder");

-- ─── New CMS tables ──────────────────────────────────────────────────────────

CREATE TABLE "SiteContentBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "SiteContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteContentBlock_key_key" ON "SiteContentBlock"("key");
CREATE INDEX "SiteContentBlock_status_idx" ON "SiteContentBlock"("status");
CREATE INDEX "SiteContentBlock_sortOrder_idx" ON "SiteContentBlock"("sortOrder");
CREATE INDEX "SiteContentBlock_deletedAt_idx" ON "SiteContentBlock"("deletedAt");

CREATE TABLE "TimelineEntry" (
    "id" TEXT NOT NULL,
    "yearLabel" TEXT NOT NULL,
    "date" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageJson" JSONB,
    "galleryJson" JSONB,
    "milestone" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "provenance" TEXT NOT NULL DEFAULT 'placeholder',
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "TimelineEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimelineEntry_status_idx" ON "TimelineEntry"("status");
CREATE INDEX "TimelineEntry_sortOrder_idx" ON "TimelineEntry"("sortOrder");
CREATE INDEX "TimelineEntry_deletedAt_idx" ON "TimelineEntry"("deletedAt");

CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FaqItem_status_idx" ON "FaqItem"("status");
CREATE INDEX "FaqItem_sortOrder_idx" ON "FaqItem"("sortOrder");
CREATE INDEX "FaqItem_deletedAt_idx" ON "FaqItem"("deletedAt");

CREATE TABLE "PujaYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" JSONB,
    "coverJson" JSONB,
    "galleryJson" JSONB,
    "href" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "provenance" TEXT NOT NULL DEFAULT 'placeholder',
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "PujaYear_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PujaYear_year_key" ON "PujaYear"("year");
CREATE INDEX "PujaYear_status_idx" ON "PujaYear"("status");
CREATE INDEX "PujaYear_sortOrder_idx" ON "PujaYear"("sortOrder");
CREATE INDEX "PujaYear_year_idx" ON "PujaYear"("year");
CREATE INDEX "PujaYear_deletedAt_idx" ON "PujaYear"("deletedAt");

CREATE TABLE "PublicCommitteeMember" (
    "id" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "familiarName" TEXT,
    "displayName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "positionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    CONSTRAINT "PublicCommitteeMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PublicCommitteeMember_status_idx" ON "PublicCommitteeMember"("status");
CREATE INDEX "PublicCommitteeMember_sortOrder_idx" ON "PublicCommitteeMember"("sortOrder");
CREATE INDEX "PublicCommitteeMember_roleKey_idx" ON "PublicCommitteeMember"("roleKey");
CREATE INDEX "PublicCommitteeMember_deletedAt_idx" ON "PublicCommitteeMember"("deletedAt");

ALTER TABLE "PublicCommitteeMember"
  ADD CONSTRAINT "PublicCommitteeMember_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "CommitteePosition"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Hard-delete guards for historically important content ───────────────────
-- Soft-delete remains allowed at the application layer.
-- Bypass (seed/tests): SET LOCAL app.allow_financial_delete = 'on';

CREATE OR REPLACE FUNCTION rjgc_prevent_historical_content_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF rjgc_allow_financial_delete() THEN
    RETURN OLD;
  END IF;
  IF OLD."historicallyImportant" IS TRUE THEN
    RAISE EXCEPTION
      'Hard delete blocked: historically important % (%) must be soft-deleted or archived',
      TG_TABLE_NAME, OLD.id
      USING ERRCODE = 'integrity_constraint_violation';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_site_content_block_no_hard_delete
  BEFORE DELETE ON "SiteContentBlock"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_timeline_entry_no_hard_delete
  BEFORE DELETE ON "TimelineEntry"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_faq_item_no_hard_delete
  BEFORE DELETE ON "FaqItem"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_puja_year_no_hard_delete
  BEFORE DELETE ON "PujaYear"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_public_committee_member_no_hard_delete
  BEFORE DELETE ON "PublicCommitteeMember"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_event_historical_no_hard_delete
  BEFORE DELETE ON "Event"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_gallery_album_historical_no_hard_delete
  BEFORE DELETE ON "GalleryAlbum"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_gallery_media_historical_no_hard_delete
  BEFORE DELETE ON "GalleryMedia"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_announcement_historical_no_hard_delete
  BEFORE DELETE ON "Announcement"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();

CREATE TRIGGER trg_committee_position_historical_no_hard_delete
  BEFORE DELETE ON "CommitteePosition"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();
