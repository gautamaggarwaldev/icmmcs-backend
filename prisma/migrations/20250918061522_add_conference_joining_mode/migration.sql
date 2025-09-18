/*
  Warnings:

  - Added the required column `conferenceJoiningMode` to the `registerUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `registeruser` ADD COLUMN `conferenceJoiningMode` ENUM('Online', 'InPerson') NOT NULL;
