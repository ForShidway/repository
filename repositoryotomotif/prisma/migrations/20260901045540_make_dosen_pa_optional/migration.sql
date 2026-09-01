-- DropForeignKey
ALTER TABLE `tugasakhir` DROP FOREIGN KEY `TugasAkhir_dosenPaId_fkey`;

-- DropIndex
DROP INDEX `TugasAkhir_dosenPaId_fkey` ON `tugasakhir`;

-- AlterTable
ALTER TABLE `tugasakhir` MODIFY `dosenPaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_dosenPaId_fkey` FOREIGN KEY (`dosenPaId`) REFERENCES `Dosen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
