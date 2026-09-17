-- Add alamat as nullable first so existing rows remain valid.
ALTER TABLE `laporanpi` ADD COLUMN `alamat` TEXT NULL;
ALTER TABLE `laporanplk` ADD COLUMN `alamat` TEXT NULL;

UPDATE `laporanpi` SET `alamat` = '' WHERE `alamat` IS NULL;
UPDATE `laporanplk` SET `alamat` = '' WHERE `alamat` IS NULL;

ALTER TABLE `laporanpi` MODIFY COLUMN `alamat` TEXT NOT NULL;
ALTER TABLE `laporanplk` MODIFY COLUMN `alamat` TEXT NOT NULL;
