-- Announcement priority for operational surfacing.

CREATE TYPE "AnnouncementPriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

ALTER TABLE "Announcement"
  ADD COLUMN "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL';

CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");
