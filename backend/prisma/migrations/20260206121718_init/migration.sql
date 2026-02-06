/*
  Warnings:

  - You are about to drop the column `phone` on the `ContactRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ref]` on the table `ContactRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContactRequest" DROP COLUMN "phone",
ADD COLUMN     "phoneDialCode" TEXT,
ADD COLUMN     "phoneFull" TEXT,
ADD COLUMN     "phoneLocal" TEXT,
ADD COLUMN     "ref" TEXT,
ALTER COLUMN "employees" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ContactRequest_ref_key" ON "ContactRequest"("ref");
