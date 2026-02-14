CREATE TABLE `sell_submission_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`senderRole` enum('admin','customer') NOT NULL,
	`senderName` varchar(255),
	`message` text NOT NULL,
	`tokenOffer` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sell_submission_replies_id` PRIMARY KEY(`id`)
);
