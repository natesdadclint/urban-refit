CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('order_confirmation','shipping_notification','payout_notification','welcome','other') NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500),
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`relatedOrderId` int,
	`relatedPayoutId` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`thriftStoreId` int NOT NULL,
	`thriftStorePayoutAmount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','paid','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`shippingCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`shippingName` varchar(255),
	`shippingAddress` text,
	`shippingCity` varchar(100),
	`shippingState` varchar(100),
	`shippingZip` varchar(20),
	`shippingCountry` varchar(100),
	`shippingPhone` varchar(20),
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`paidAt` timestamp,
	`customerEmail` varchar(320),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thriftStoreId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentReference` varchar(255),
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`notes` text,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`brand` varchar(100),
	`category` enum('tops','bottoms','dresses','outerwear','accessories','shoes','bags','other') NOT NULL DEFAULT 'other',
	`size` varchar(20),
	`condition` enum('like_new','excellent','good','fair') NOT NULL DEFAULT 'good',
	`color` varchar(50),
	`material` varchar(100),
	`originalCost` decimal(10,2) NOT NULL,
	`markupPercentage` decimal(5,2) NOT NULL,
	`salePrice` decimal(10,2) NOT NULL,
	`thriftStorePayoutAmount` decimal(10,2) NOT NULL,
	`image1Url` text,
	`image2Url` text,
	`thriftStoreId` int NOT NULL,
	`status` enum('available','reserved','sold','archived') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`soldAt` timestamp,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `thrift_stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(100),
	`email` varchar(320),
	`phone` varchar(20),
	`contactPerson` varchar(255),
	`bankName` varchar(255),
	`bankAccount` varchar(100),
	`bankRouting` varchar(50),
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`totalPayout` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `thrift_stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `shippingAddress` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);