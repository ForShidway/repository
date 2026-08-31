-- CreateTable
CREATE TABLE `Keyword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kata` VARCHAR(191) NOT NULL,
    `tugasAkhirId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Keyword_tugasAkhirId_kata_key`(`tugasAkhirId`, `kata`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_tugasAkhirId_fkey` FOREIGN KEY (`tugasAkhirId`) REFERENCES `TugasAkhir`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
