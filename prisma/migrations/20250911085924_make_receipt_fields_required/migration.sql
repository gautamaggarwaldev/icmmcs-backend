/*
  Warnings:

  - Made the column `paperId` on table `registeruser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transactionId` on table `registeruser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uploadPaymentReceipt` on table `registeruser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `registeruser` MODIFY `paperId` VARCHAR(191) NOT NULL,
    MODIFY `transactionId` VARCHAR(191) NOT NULL,
    MODIFY `uploadPaymentReceipt` VARCHAR(191) NOT NULL;
