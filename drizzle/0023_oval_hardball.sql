CREATE TABLE `sustainability_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalGarmentsCount` int NOT NULL DEFAULT 0,
	`totalLandfillKgDiverted` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalWaterLitersSaved` int NOT NULL DEFAULT 0,
	`totalCarbonKgAvoided` decimal(10,2) NOT NULL DEFAULT '0.00',
	`bronzeBadgesCount` int NOT NULL DEFAULT 0,
	`silverBadgesCount` int NOT NULL DEFAULT 0,
	`goldBadgesCount` int NOT NULL DEFAULT 0,
	`platinumBadgesCount` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sustainability_milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `sustainability_milestones_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` varchar(100) NOT NULL,
	`badgeName` varchar(255) NOT NULL,
	`badgeDescription` text,
	`badgeIcon` varchar(50),
	`badgeColor` varchar(50),
	`tier` enum('bronze','silver','gold','platinum') NOT NULL,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	`notificationSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
