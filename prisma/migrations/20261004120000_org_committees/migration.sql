-- Organizational committees (Executive + unlimited sub-committees) with
-- relational memberships keyed to Member (no duplicated people).

CREATE TYPE "CommitteeKind" AS ENUM ('EXECUTIVE', 'SUB');

CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "responsibilities" TEXT,
    "iconKey" TEXT,
    "coverAssetId" TEXT,
    "imageAssetId" TEXT,
    "kind" "CommitteeKind" NOT NULL DEFAULT 'SUB',
    "termStart" TIMESTAMP(3),
    "termEnd" TIMESTAMP(3),
    "termYear" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "historicallyImportant" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommitteeMembership" (
    "id" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "designationLabel" TEXT,
    "shortBio" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "CommitteeMembership_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Event" ADD COLUMN "committeeId" TEXT;
ALTER TABLE "Announcement" ADD COLUMN "committeeId" TEXT;

CREATE UNIQUE INDEX "Committee_slug_key" ON "Committee"("slug");
CREATE INDEX "Committee_kind_idx" ON "Committee"("kind");
CREATE INDEX "Committee_status_idx" ON "Committee"("status");
CREATE INDEX "Committee_displayOrder_idx" ON "Committee"("displayOrder");
CREATE INDEX "Committee_termYear_idx" ON "Committee"("termYear");
CREATE INDEX "Committee_coverAssetId_idx" ON "Committee"("coverAssetId");
CREATE INDEX "Committee_imageAssetId_idx" ON "Committee"("imageAssetId");
CREATE INDEX "Committee_deletedAt_idx" ON "Committee"("deletedAt");

CREATE UNIQUE INDEX "CommitteeMembership_committeeId_memberId_key" ON "CommitteeMembership"("committeeId", "memberId");
CREATE INDEX "CommitteeMembership_committeeId_idx" ON "CommitteeMembership"("committeeId");
CREATE INDEX "CommitteeMembership_memberId_idx" ON "CommitteeMembership"("memberId");
CREATE INDEX "CommitteeMembership_designation_idx" ON "CommitteeMembership"("designation");
CREATE INDEX "CommitteeMembership_status_idx" ON "CommitteeMembership"("status");
CREATE INDEX "CommitteeMembership_displayOrder_idx" ON "CommitteeMembership"("displayOrder");
CREATE INDEX "CommitteeMembership_deletedAt_idx" ON "CommitteeMembership"("deletedAt");

CREATE INDEX "Event_committeeId_idx" ON "Event"("committeeId");
CREATE INDEX "Announcement_committeeId_idx" ON "Announcement"("committeeId");

ALTER TABLE "Committee" ADD CONSTRAINT "Committee_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Committee" ADD CONSTRAINT "Committee_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
