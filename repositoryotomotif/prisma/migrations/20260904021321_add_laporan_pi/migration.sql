-- AlterTable
ALTER TABLE `artikeljurnal` ADD COLUMN `ProgramStudyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `LaporanPi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NOT NULL,
    `namaInstansi` VARCHAR(191) NOT NULL,
    `dosenPembimbingId` INTEGER NOT NULL,
    `tanggalMulai` DATETIME(3) NOT NULL,
    `tanggalSelesai` DATETIME(3) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArtikelJurnal` ADD CONSTRAINT `ArtikelJurnal_ProgramStudyId_fkey` FOREIGN KEY (`ProgramStudyId`) REFERENCES `ProgramStudy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LaporanPi` ADD CONSTRAINT `LaporanPi_dosenPembimbingId_fkey` FOREIGN KEY (`dosenPembimbingId`) REFERENCES `Dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
