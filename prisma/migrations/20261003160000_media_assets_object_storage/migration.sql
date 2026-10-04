-- Managed media assets (metadata in Postgres; binaries in object storage).

CREATE TYPE "MediaPurpose" AS ENUM ('COMMITTEE_PORTRAIT', 'GALLERY', 'EVENT', 'PUJA', 'HERO', 'GENERAL');
CREATE TYPE "MediaAssetStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "purpose" "MediaPurpose" NOT NULL DEFAULT 'GENERAL',
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PROCESSING',
    "slotKey" TEXT,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "variants" JSONB,
    "checksumSha256" TEXT,
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");
CREATE UNIQUE INDEX "MediaAsset_slotKey_key" ON "MediaAsset"("slotKey");
CREATE INDEX "MediaAsset_purpose_idx" ON "MediaAsset"("purpose");
CREATE INDEX "MediaAsset_status_idx" ON "MediaAsset"("status");
CREATE INDEX "MediaAsset_deletedAt_idx" ON "MediaAsset"("deletedAt");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Event" ADD COLUMN "coverAssetId" TEXT;
CREATE INDEX "Event_coverAssetId_idx" ON "Event"("coverAssetId");
ALTER TABLE "Event"
  ADD CONSTRAINT "Event_coverAssetId_fkey"
  FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GalleryMedia" ADD COLUMN "mediaAssetId" TEXT;
CREATE INDEX "GalleryMedia_mediaAssetId_idx" ON "GalleryMedia"("mediaAssetId");
ALTER TABLE "GalleryMedia"
  ADD CONSTRAINT "GalleryMedia_mediaAssetId_fkey"
  FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PujaYear" ADD COLUMN "coverAssetId" TEXT;
CREATE INDEX "PujaYear_coverAssetId_idx" ON "PujaYear"("coverAssetId");
ALTER TABLE "PujaYear"
  ADD CONSTRAINT "PujaYear_coverAssetId_fkey"
  FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PublicCommitteeMember" ADD COLUMN "portraitAssetId" TEXT;
CREATE INDEX "PublicCommitteeMember_portraitAssetId_idx" ON "PublicCommitteeMember"("portraitAssetId");
ALTER TABLE "PublicCommitteeMember"
  ADD CONSTRAINT "PublicCommitteeMember_portraitAssetId_fkey"
  FOREIGN KEY ("portraitAssetId") REFERENCES "MediaAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TRIGGER trg_media_asset_historical_no_hard_delete
  BEFORE DELETE ON "MediaAsset"
  FOR EACH ROW EXECUTE FUNCTION rjgc_prevent_historical_content_hard_delete();
