/*
  Warnings:

  - Added the required column `judul` to the `LaporanPi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `judul` to the `LaporanPLK` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `laporanpi` ADD COLUMN `judul` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `laporanplk` ADD COLUMN `judul` TEXT NOT NULL;
