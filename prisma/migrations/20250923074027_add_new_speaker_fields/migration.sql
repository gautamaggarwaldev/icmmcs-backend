-- AlterTable
ALTER TABLE `speaker` ADD COLUMN `affiliation` VARCHAR(191) NULL,
    ADD COLUMN `authorBiography` TEXT NULL,
    ADD COLUMN `institutionAddress` VARCHAR(191) NULL,
    ADD COLUMN `paperDocxUrl` VARCHAR(191) NULL,
    ADD COLUMN `subtitle` VARCHAR(191) NULL,
    ADD COLUMN `zipFolderUrl` VARCHAR(191) NULL;
