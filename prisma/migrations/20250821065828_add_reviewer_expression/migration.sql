-- CreateTable
CREATE TABLE `registerUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `registrationType` VARCHAR(191) NOT NULL,
    `institutionName` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `earlyBird` BOOLEAN NOT NULL,
    `regFee` VARCHAR(191) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `referralCode` VARCHAR(191) NULL,
    `referredById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registerUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sponsor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sponsor_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `speaker` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceTitle` VARCHAR(191) NOT NULL,
    `placeDate` VARCHAR(191) NOT NULL,
    `paperTitle` VARCHAR(191) NOT NULL,
    `paperAbstract` TEXT NOT NULL,
    `keywords` TEXT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `institutionName` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `orcidId` VARCHAR(191) NULL,
    `isCorrespondingAuthor` BOOLEAN NOT NULL DEFAULT true,
    `coAuthors` TEXT NULL,
    `primarySubject` VARCHAR(191) NOT NULL,
    `additionalSubjects` TEXT NULL,
    `paperFileUrl` VARCHAR(191) NULL,
    `supplementaryFileUrl` VARCHAR(191) NULL,
    `sourceCodeFileUrl` VARCHAR(191) NULL,
    `ethicsCompliance` BOOLEAN NOT NULL DEFAULT false,
    `dataAvailability` BOOLEAN NOT NULL DEFAULT false,
    `preprintPolicy` BOOLEAN NOT NULL DEFAULT false,
    `preprintUrl` VARCHAR(191) NULL,
    `conflictOfInterest` BOOLEAN NOT NULL DEFAULT false,
    `previouslySubmitted` BOOLEAN NOT NULL DEFAULT false,
    `previousSubmissionInfo` TEXT NULL,
    `willingToReview` BOOLEAN NOT NULL DEFAULT false,
    `aiGeneratedContent` BOOLEAN NOT NULL DEFAULT false,
    `aiContentDescription` TEXT NULL,
    `studentPaper` BOOLEAN NOT NULL DEFAULT false,
    `agreeTerms` BOOLEAN NOT NULL DEFAULT false,
    `agreePresentation` BOOLEAN NOT NULL DEFAULT false,
    `agreePublication` BOOLEAN NOT NULL DEFAULT false,
    `agreeReview` BOOLEAN NOT NULL DEFAULT false,
    `agreeDataSharing` BOOLEAN NOT NULL DEFAULT false,
    `message` TEXT NULL,
    `referralCode` VARCHAR(191) NULL,
    `referredById` VARCHAR(191) NULL,
    `reviewStatus` ENUM('PENDING', 'SENT_TO_COMMITTEE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION') NOT NULL DEFAULT 'PENDING',
    `sentToCommittee` BOOLEAN NOT NULL DEFAULT false,
    `committeeMembers` TEXT NULL,
    `attendeeType` ENUM('presenter', 'listener') NOT NULL DEFAULT 'presenter',
    `fileUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `speaker_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keynoteSpeaker` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `institutionName` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL,
    `experienceYears` INTEGER NOT NULL,
    `expertiseArea` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `highestDegree` VARCHAR(191) NOT NULL,
    `university` VARCHAR(191) NULL,
    `publicationsCount` INTEGER NULL,
    `notableAchievements` VARCHAR(191) NULL,
    `keynoteExperience` INTEGER NULL,
    `notableConferences` VARCHAR(191) NULL,
    `keynoteTitle` VARCHAR(191) NOT NULL,
    `keynoteAbstract` TEXT NOT NULL,
    `targetAudience` TEXT NULL,
    `linkedinProfile` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `orcidId` VARCHAR(191) NULL,
    `googleScholar` VARCHAR(191) NULL,
    `cvFileUrl` VARCHAR(191) NULL,
    `photoFileUrl` VARCHAR(191) NULL,
    `presentationFileUrl` VARCHAR(191) NULL,
    `preferredSessionTime` VARCHAR(191) NULL,
    `accommodationNeeded` VARCHAR(191) NULL,
    `dietaryRestrictions` VARCHAR(191) NULL,
    `additionalComments` TEXT NULL,
    `agreeToTerms` BOOLEAN NOT NULL DEFAULT false,
    `agreeToMarketing` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONFIRMED') NOT NULL DEFAULT 'PENDING',
    `referralCode` VARCHAR(191) NULL,
    `referredById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `keynoteSpeaker_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL,
    `referralCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    UNIQUE INDEX `Admin_referralCode_key`(`referralCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `referredBy` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewingCommittee` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `expertise` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReviewingCommittee_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewerExpression` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `currentJobTitle` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `education` JSON NOT NULL,
    `subjectArea` JSON NOT NULL,
    `methodologicalExpertise` JSON NOT NULL,
    `researchInterest` JSON NOT NULL,
    `previousPeerReviewExperience` TEXT NULL,
    `conflictOfInterest` TEXT NULL,
    `cvUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `registerUser` ADD CONSTRAINT `registerUser_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `speaker` ADD CONSTRAINT `speaker_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `keynoteSpeaker` ADD CONSTRAINT `keynoteSpeaker_referredById_fkey` FOREIGN KEY (`referredById`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
