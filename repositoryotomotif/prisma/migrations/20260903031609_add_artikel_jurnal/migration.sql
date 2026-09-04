/*
  Warnings:

  - You are about to drop the column `createdAt` on the `keyword` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `keyword` DROP COLUMN `createdAt`;

-- CreateTable
CREATE TABLE `ArtikelJurnal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `judul` TEXT NOT NULL,
    `abstract` TEXT NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,
    `fileSize` INTEGER NULL,
    `fileType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JurnalKeyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kata` VARCHAR(191) NOT NULL,
    `artikelJurnalId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `JurnalKeyword_artikelJurnalId_kata_key`(`artikelJurnalId`, `kata`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JurnalKeyword` ADD CONSTRAINT `JurnalKeyword_artikelJurnalId_fkey` FOREIGN KEY (`artikelJurnalId`) REFERENCES `ArtikelJurnal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
