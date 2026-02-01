CREATE TABLE `image_validation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`validationRunId` varchar(50) NOT NULL,
	`productId` int NOT NULL,
	`imageField` enum('image1Url','image2Url') NOT NULL,
	`imageUrl` text,
	`isValid` boolean NOT NULL,
	`errorType` enum('null','empty','invalid_format','http_error','timeout'),
	`httpStatus` int,
	`errorMessage` text,
	`responseTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `image_validation_logs_id` PRIMARY KEY(`id`)
);
