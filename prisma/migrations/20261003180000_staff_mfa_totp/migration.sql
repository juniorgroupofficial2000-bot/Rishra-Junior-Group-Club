-- Staff TOTP MFA (Authenticator apps). Secrets stored encrypted at rest.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaTotpSecretEnc" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mfaVerifiedAt" TIMESTAMP(3);
