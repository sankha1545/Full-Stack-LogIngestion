/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceHash]` on the table `TrustedDevice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuthEventType" ADD VALUE 'MFA_SETUP_STARTED';
ALTER TYPE "AuthEventType" ADD VALUE 'MFA_SETUP_COMPLETED';
ALTER TYPE "AuthEventType" ADD VALUE 'MFA_DISABLED';
ALTER TYPE "AuthEventType" ADD VALUE 'RECOVERY_CODE_USED';
ALTER TYPE "AuthEventType" ADD VALUE 'RECOVERY_CODES_REGENERATED';
ALTER TYPE "AuthEventType" ADD VALUE 'PASSWORD_CHANGED';
ALTER TYPE "AuthEventType" ADD VALUE 'PASSWORD_VERIFY_SUCCESS';
ALTER TYPE "AuthEventType" ADD VALUE 'PASSWORD_VERIFY_FAILED';

-- DropIndex
DROP INDEX "ContactRequest_company_idx";

-- DropIndex
DROP INDEX "ContactRequest_createdAt_idx";

-- DropIndex
DROP INDEX "EmailOtp_email_code_idx";

-- DropIndex
DROP INDEX "Log_commit_idx";

-- DropIndex
DROP INDEX "Log_spanId_idx";

-- DropIndex
DROP INDEX "Log_traceId_idx";

-- DropIndex
DROP INDEX "MfaRecoveryCode_codeHash_idx";

-- DropIndex
DROP INDEX "TrustedDevice_deviceHash_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountLockedUntil" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "MfaRecoveryCode_used_idx" ON "MfaRecoveryCode"("used");

-- CreateIndex
CREATE INDEX "TrustedDevice_deviceHash_idx" ON "TrustedDevice"("deviceHash");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_userId_deviceHash_key" ON "TrustedDevice"("userId", "deviceHash");

-- CreateIndex
CREATE INDEX "User_accountLockedUntil_idx" ON "User"("accountLockedUntil");
