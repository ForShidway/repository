-- CreateTable
CREATE TABLE `TugasAkhir` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tahunMasuk` INTEGER NOT NULL,
    `nim` VARCHAR(191) NOT NULL,
    `judul` TEXT NOT NULL,
    `mataKuliahRelevan` VARCHAR(191) NOT NULL,
    `ruanganId` INTEGER NOT NULL,
    `pembimbingId` INTEGER NOT NULL,
    `dosenPaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TugasAkhir_nim_key`(`nim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_ruanganId_fkey` FOREIGN KEY (`ruanganId`) REFERENCES `Ruangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_pembimbingId_fkey` FOREIGN KEY (`pembimbingId`) REFERENCES `Dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_dosenPaId_fkey` FOREIGN KEY (`dosenPaId`) REFERENCES `Dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
