-- AlterTable
ALTER TABLE `tugasakhir` ADD COLUMN `pembimbing2Id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_pembimbing2Id_fkey` FOREIGN KEY (`pembimbing2Id`) REFERENCES `Dosen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
