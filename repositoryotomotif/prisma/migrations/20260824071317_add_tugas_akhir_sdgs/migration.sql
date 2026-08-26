-- CreateTable
CREATE TABLE `_SDGsToTugasAkhir` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SDGsToTugasAkhir_AB_unique`(`A`, `B`),
    INDEX `_SDGsToTugasAkhir_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_SDGsToTugasAkhir` ADD CONSTRAINT `_SDGsToTugasAkhir_A_fkey` FOREIGN KEY (`A`) REFERENCES `SDGs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SDGsToTugasAkhir` ADD CONSTRAINT `_SDGsToTugasAkhir_B_fkey` FOREIGN KEY (`B`) REFERENCES `TugasAkhir`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
