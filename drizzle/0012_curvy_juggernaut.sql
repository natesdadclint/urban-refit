CREATE TABLE `contact_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactMessageId` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`sentByUserId` int,
	`sentByName` varchar(255),
	`emailSent` boolean NOT NULL DEFAULT false,
	`emailMessageId` varchar(255),
	`emailError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_replies_id` PRIMARY KEY(`id`)
);
