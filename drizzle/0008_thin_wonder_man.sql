CREATE TABLE `email_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`source` enum('newsletter','join_page','contact','checkout','footer') NOT NULL DEFAULT 'newsletter',
	`newArrivals` boolean NOT NULL DEFAULT true,
	`exclusiveOffers` boolean NOT NULL DEFAULT true,
	`sustainabilityNews` boolean NOT NULL DEFAULT false,
	`partnerUpdates` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`unsubscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscribers_email_unique` UNIQUE(`email`)
);
