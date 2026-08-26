-- AlterTable
ALTER TABLE `tugasakhir` ADD COLUMN `fileName` VARCHAR(191) NULL,
    ADD COLUMN `filePath` VARCHAR(191) NULL,
    ADD COLUMN `fileSize` INTEGER NULL,
    ADD COLUMN `fileType` VARCHAR(191) NULL;
