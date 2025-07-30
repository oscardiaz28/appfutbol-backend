/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `username` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `username`;
