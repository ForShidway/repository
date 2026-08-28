-- AlterTable
ALTER TABLE `tugasakhir` ADD COLUMN `ProgramStudyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TugasAkhir` ADD CONSTRAINT `TugasAkhir_ProgramStudyId_fkey` FOREIGN KEY (`ProgramStudyId`) REFERENCES `ProgramStudy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
