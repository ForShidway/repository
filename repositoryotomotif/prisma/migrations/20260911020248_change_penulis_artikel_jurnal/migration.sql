/*
  Warnings:

  - You are about to drop the column `name` on the `artikeljurnal` table. All the data in the column will be lost.
  - You are about to drop the column `nim` on the `artikeljurnal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `artikeljurnal` DROP COLUMN `name`,
    DROP COLUMN `nim`;

-- CreateTable
CREATE TABLE `PenulisArtikelJurnal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipe` ENUM('MAHASISWA', 'DOSEN', 'LAINNYA') NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NULL,
    `urutan` INTEGER NOT NULL DEFAULT 1,
    `dosenId` INTEGER NULL,
    `artikelJurnalId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PenulisArtikelJurnal` ADD CONSTRAINT `PenulisArtikelJurnal_dosenId_fkey` FOREIGN KEY (`dosenId`) REFERENCES `Dosen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenulisArtikelJurnal` ADD CONSTRAINT `PenulisArtikelJurnal_artikelJurnalId_fkey` FOREIGN KEY (`artikelJurnalId`) REFERENCES `ArtikelJurnal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
