-- DropForeignKey
ALTER TABLE `details_evaluation` DROP FOREIGN KEY `details_evaluation_ibfk_1`;

-- AddForeignKey
ALTER TABLE `details_evaluation` ADD CONSTRAINT `details_evaluation_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
