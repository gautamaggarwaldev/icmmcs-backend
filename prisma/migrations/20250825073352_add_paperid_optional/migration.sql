/*
  Warnings:

  - A unique constraint covering the columns `[paperId]` on the table `speaker` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `speaker` ADD COLUMN `paperId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `speaker_paperId_key` ON `speaker`(`paperId`);
