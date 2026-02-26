-- DropIndex
DROP INDEX "Application_deleted_idx";

-- DropIndex
DROP INDEX "Application_userId_deleted_idx";

-- DropIndex
DROP INDEX "Application_userId_idx";

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "searchVector" tsvector;

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "LogLevel",
    "query" TEXT,
    "threshold" INTEGER NOT NULL,
    "windowMinutes" INTEGER NOT NULL DEFAULT 5,
    "email" TEXT,
    "webhookUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertRule_applicationId_idx" ON "AlertRule"("applicationId");

-- CreateIndex
CREATE INDEX "AlertRule_userId_idx" ON "AlertRule"("userId");

-- CreateIndex
CREATE INDEX "AlertRule_enabled_idx" ON "AlertRule"("enabled");

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
