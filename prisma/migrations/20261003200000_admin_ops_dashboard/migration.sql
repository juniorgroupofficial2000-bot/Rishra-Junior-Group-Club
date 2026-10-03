-- Admin operations: event registration/capacity, announcement scheduling + cover,
-- committee biography/term year.

ALTER TYPE "AnnouncementStatus" ADD VALUE 'SCHEDULED';

ALTER TABLE "Event" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'event';
ALTER TABLE "Event" ADD COLUMN "registrationRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "capacity" INTEGER;

CREATE INDEX "Event_category_idx" ON "Event"("category");

ALTER TABLE "Announcement" ADD COLUMN "coverAssetId" TEXT;
CREATE INDEX "Announcement_coverAssetId_idx" ON "Announcement"("coverAssetId");

ALTER TABLE "Announcement"
  ADD CONSTRAINT "Announcement_coverAssetId_fkey"
  FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PublicCommitteeMember" ADD COLUMN "biography" TEXT;
ALTER TABLE "PublicCommitteeMember" ADD COLUMN "termYear" INTEGER;

CREATE INDEX "PublicCommitteeMember_termYear_idx"
  ON "PublicCommitteeMember"("termYear");
