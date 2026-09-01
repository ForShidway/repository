-- DropForeignKey
ALTER TABLE `tugasakhir` DROP FOREIGN KEY `TugasAkhir_ruanganId_fkey`;

-- DropIndex
DROP INDEX `TugasAkhir_ruanganId_fkey` ON `tugasakhir`;

-- AlterTable
ALTER TABLE `tugasakhir` MODIFY `ruanganId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_ruanganId_fkey` FOREIGN KEY (`ruanganId`) REFERENCES `Ruangan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
