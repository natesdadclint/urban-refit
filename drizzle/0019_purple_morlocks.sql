CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderUpdates` boolean NOT NULL DEFAULT true,
	`tokenRewards` boolean NOT NULL DEFAULT true,
	`promotions` boolean NOT NULL DEFAULT true,
	`sellSubmissions` boolean NOT NULL DEFAULT true,
	`systemUpdates` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
