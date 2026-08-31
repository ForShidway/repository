/*
  Warnings:

  - You are about to drop the column `name` on the `tugasakhir` table. All the data in the column will be lost.
  - You are about to drop the column `nim` on the `tugasakhir` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `TugasAkhir_nim_key` ON `tugasakhir`;

-- AlterTable
ALTER TABLE `tugasakhir` DROP COLUMN `name`,
    DROP COLUMN `nim`;

-- CreateTable
CREATE TABLE `Mahasiswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NOT NULL,
    `urutan` INTEGER NOT NULL DEFAULT 1,
    `tugasAkhirId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Mahasiswa_tugasAkhirId_nim_key`(`tugasAkhirId`, `nim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mahasiswa` ADD CONSTRAINT `Mahasiswa_tugasAkhirId_fkey` FOREIGN KEY (`tugasAkhirId`) REFERENCES `TugasAkhir`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
