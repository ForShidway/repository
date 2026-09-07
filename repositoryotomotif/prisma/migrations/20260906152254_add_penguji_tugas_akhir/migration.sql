-- CreateTable
CREATE TABLE `PengujiTugasAkhir` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tugasAkhirId` INTEGER NOT NULL,
    `dosenId` INTEGER NOT NULL,
    `urutan` INTEGER NOT NULL,
    `peran` ENUM('KETUA', 'SEKRETARIS', 'ANGGOTA') NOT NULL,

    UNIQUE INDEX `PengujiTugasAkhir_tugasAkhirId_dosenId_key`(`tugasAkhirId`, `dosenId`),
    UNIQUE INDEX `PengujiTugasAkhir_tugasAkhirId_urutan_key`(`tugasAkhirId`, `urutan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PengujiTugasAkhir` ADD CONSTRAINT `PengujiTugasAkhir_tugasAkhirId_fkey` FOREIGN KEY (`tugasAkhirId`) REFERENCES `TugasAkhir`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengujiTugasAkhir` ADD CONSTRAINT `PengujiTugasAkhir_dosenId_fkey` FOREIGN KEY (`dosenId`) REFERENCES `Dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
