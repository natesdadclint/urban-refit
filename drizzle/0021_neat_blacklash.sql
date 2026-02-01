ALTER TABLE `image_validation_logs` MODIFY COLUMN `imageField` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `image_validation_logs` ADD `assetType` enum('product','blog','category') NOT NULL;--> statement-breakpoint
ALTER TABLE `image_validation_logs` ADD `assetId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `image_validation_logs` DROP COLUMN `productId`;