-- Saraswati Puja digital archive: year metadata + configured schedule stages.

CREATE TYPE "PujaScheduleStage" AS ENUM (
  'PREPARATION',
  'DECORATION',
  'PUJA',
  'PUSHPANJALI',
  'CULTURAL',
  'PRASAD',
  'IMMERSION',
  'OTHER'
);

ALTER TABLE "PujaYear" ADD COLUMN "theme" TEXT;
ALTER TABLE "PujaYear" ADD COLUMN "startsOn" TIMESTAMP(3);
ALTER TABLE "PujaYear" ADD COLUMN "endsOn" TIMESTAMP(3);
ALTER TABLE "PujaYear" ADD COLUMN "locationLabel" TEXT;
ALTER TABLE "PujaYear" ADD COLUMN "locationDetail" TEXT;
ALTER TABLE "PujaYear" ADD COLUMN "committeeNote" TEXT;
ALTER TABLE "PujaYear" ADD COLUMN "videosJson" JSONB;
ALTER TABLE "PujaYear" ADD COLUMN "documentsJson" JSONB;

CREATE INDEX "PujaYear_startsOn_idx" ON "PujaYear"("startsOn");

CREATE TABLE "PujaScheduleItem" (
  "id" TEXT NOT NULL,
  "pujaYearId" TEXT NOT NULL,
  "stage" "PujaScheduleStage" NOT NULL DEFAULT 'OTHER',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "PujaScheduleItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PujaScheduleItem_pujaYearId_idx" ON "PujaScheduleItem"("pujaYearId");
CREATE INDEX "PujaScheduleItem_stage_idx" ON "PujaScheduleItem"("stage");
CREATE INDEX "PujaScheduleItem_startsAt_idx" ON "PujaScheduleItem"("startsAt");
CREATE INDEX "PujaScheduleItem_status_idx" ON "PujaScheduleItem"("status");
CREATE INDEX "PujaScheduleItem_sortOrder_idx" ON "PujaScheduleItem"("sortOrder");
CREATE INDEX "PujaScheduleItem_deletedAt_idx" ON "PujaScheduleItem"("deletedAt");

ALTER TABLE "PujaScheduleItem"
  ADD CONSTRAINT "PujaScheduleItem_pujaYearId_fkey"
  FOREIGN KEY ("pujaYearId") REFERENCES "PujaYear"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
