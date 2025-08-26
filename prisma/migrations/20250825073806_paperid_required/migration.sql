/*
  Warnings:

  - Made the column `paperId` on table `speaker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `speaker` MODIFY `paperId` VARCHAR(191) NOT NULL;
