CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`message` text NOT NULL,
	`subscribedToNewsletter` boolean NOT NULL DEFAULT false,
	`status` enum('unread','read','replied','archived') NOT NULL DEFAULT 'unread',
	`adminNotes` text,
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
