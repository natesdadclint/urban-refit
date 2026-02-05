CREATE TABLE `site_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` varchar(50) NOT NULL,
	`category` varchar(100),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`email` varchar(255),
	`page` varchar(500),
	`userAgent` text,
	`status` varchar(50) NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_feedback_id` PRIMARY KEY(`id`)
);
