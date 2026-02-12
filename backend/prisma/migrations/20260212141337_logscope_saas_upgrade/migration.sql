/*
  Warnings:

  - Changed the type of `level` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "keyPreview" TEXT;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "connectionUrl" TEXT;

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "level",
ADD COLUMN     "level" "LogLevel" NOT NULL;

-- CreateIndex
CREATE INDEX "Log_applicationId_level_idx" ON "Log"("applicationId", "level");
