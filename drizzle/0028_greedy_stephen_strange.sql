CREATE TABLE `site_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','promo','warning','urgent') NOT NULL DEFAULT 'info',
	`linkUrl` varchar(500),
	`linkText` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_banners_id` PRIMARY KEY(`id`)
);
