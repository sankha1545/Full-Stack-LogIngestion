-- AlterEnum
ALTER TYPE "LogLevel" ADD VALUE 'FATAL';

-- DropIndex
DROP INDEX "Log_timestamp_idx";

-- DropIndex
DROP INDEX "TrustedDevice_deviceHash_idx";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "retentionDays" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "environment" "Environment" NOT NULL DEFAULT 'DEVELOPMENT',
ADD COLUMN     "host" TEXT,
ADD COLUMN     "service" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "version" TEXT;

-- CreateTable
CREATE TABLE "LogMetric" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "warnCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "debugCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogMetric_applicationId_idx" ON "LogMetric"("applicationId");

-- CreateIndex
CREATE INDEX "LogMetric_timestamp_idx" ON "LogMetric"("timestamp");

-- CreateIndex
CREATE INDEX "LogMetric_applicationId_timestamp_idx" ON "LogMetric"("applicationId", "timestamp");

-- CreateIndex
CREATE INDEX "Log_service_idx" ON "Log"("service");

-- CreateIndex
CREATE INDEX "Log_environment_idx" ON "Log"("environment");

-- CreateIndex
CREATE INDEX "Log_host_idx" ON "Log"("host");

-- CreateIndex
CREATE INDEX "Log_traceId_idx" ON "Log"("traceId");

-- CreateIndex
CREATE INDEX "Log_spanId_idx" ON "Log"("spanId");

-- AddForeignKey
ALTER TABLE "LogMetric" ADD CONSTRAINT "LogMetric_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
