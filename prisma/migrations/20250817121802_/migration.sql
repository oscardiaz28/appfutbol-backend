/*
  Warnings:

  - You are about to alter the column `fecha` on the `gasto` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `parameters_evaluation` DROP FOREIGN KEY `parameters_evaluation_ibfk_1`;

-- AlterTable
ALTER TABLE `gasto` MODIFY `fecha` DATETIME NOT NULL;

-- AddForeignKey
ALTER TABLE `parameters_evaluation` ADD CONSTRAINT `parameters_evaluation_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `types_evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
