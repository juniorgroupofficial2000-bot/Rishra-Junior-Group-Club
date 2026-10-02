-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppRole" ADD VALUE 'COMMITTEE_MEMBER';
ALTER TYPE "AppRole" ADD VALUE 'CONTENT_MANAGER';
ALTER TYPE "AppRole" ADD VALUE 'EVENT_MANAGER';
ALTER TYPE "AppRole" ADD VALUE 'VICE_PRESIDENT';
ALTER TYPE "AppRole" ADD VALUE 'TREASURER';
ALTER TYPE "AppRole" ADD VALUE 'SECRETARY';
ALTER TYPE "AppRole" ADD VALUE 'PRESIDENT';
