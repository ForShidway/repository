/*
  Warnings:

  - A unique constraint covering the columns `[name,degree]` on the table `ProgramStudy` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ProgramStudy_name_key` ON `programstudy`;

-- CreateIndex
CREATE UNIQUE INDEX `ProgramStudy_name_degree_key` ON `ProgramStudy`(`name`, `degree`);
