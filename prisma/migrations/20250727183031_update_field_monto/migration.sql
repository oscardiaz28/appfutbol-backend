/*
  Warnings:

  - You are about to alter the column `monto` on the `gasto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `gasto` MODIFY `monto` DECIMAL(10, 2) NOT NULL;
