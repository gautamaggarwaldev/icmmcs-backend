/*
  Warnings:

  - A unique constraint covering the columns `[paperId]` on the table `registerUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `registerUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `registerUser_paperId_key` ON `registerUser`(`paperId`);

-- CreateIndex
CREATE UNIQUE INDEX `registerUser_transactionId_key` ON `registerUser`(`transactionId`);
