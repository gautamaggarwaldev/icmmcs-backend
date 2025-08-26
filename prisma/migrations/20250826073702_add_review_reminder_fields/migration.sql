-- AlterTable
ALTER TABLE `speaker` ADD COLUMN `reviewReminderCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `reviewReminderLastSentAt` DATETIME(3) NULL;
