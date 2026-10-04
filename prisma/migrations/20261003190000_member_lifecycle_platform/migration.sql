-- Member lifecycle expansion + operational profile fields

ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'APPLICATION';
ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

ALTER TYPE "MediaPurpose" ADD VALUE IF NOT EXISTS 'MEMBER_PORTRAIT';

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "cardPublicId" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "statusReason" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "portraitAssetId" TEXT;

UPDATE "Member"
SET "cardPublicId" = 'mcard_' || substr(md5(random()::text || "id"), 1, 24)
WHERE "cardPublicId" IS NULL;

ALTER TABLE "Member" ALTER COLUMN "cardPublicId" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Member_cardPublicId_key" ON "Member"("cardPublicId");
CREATE INDEX IF NOT EXISTS "Member_cardPublicId_idx" ON "Member"("cardPublicId");
CREATE INDEX IF NOT EXISTS "Member_portraitAssetId_idx" ON "Member"("portraitAssetId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Member_portraitAssetId_fkey'
  ) THEN
    ALTER TABLE "Member"
      ADD CONSTRAINT "Member_portraitAssetId_fkey"
      FOREIGN KEY ("portraitAssetId") REFERENCES "MediaAsset"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
