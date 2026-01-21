CREATE TABLE `product_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`content` text,
	`fitFeedback` enum('runs_small','true_to_size','runs_large'),
	`isVerifiedPurchase` boolean NOT NULL DEFAULT false,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`helpfulCount` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);
