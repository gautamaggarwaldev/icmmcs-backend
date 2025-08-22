/*
  Warnings:

  - Made the column `email` on table `reviewerexpression` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `reviewerexpression` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `reviewerexpression` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL;
