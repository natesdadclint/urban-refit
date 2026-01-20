CREATE TABLE `charities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`website` varchar(500),
	`logoUrl` text,
	`category` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`totalDonationsReceived` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `charities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `charity_donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`charityId` int NOT NULL,
	`tokenAmount` decimal(10,2) NOT NULL,
	`dollarValue` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','transferred') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `charity_donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courier_returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalOrderId` int,
	`originalProductId` int,
	`itemName` varchar(255) NOT NULL,
	`brand` varchar(100),
	`itemCategory` enum('tops','bottoms','dresses','outerwear','accessories','shoes','bags','other') NOT NULL DEFAULT 'other',
	`itemSize` varchar(20),
	`itemCondition` enum('like_new','excellent','good','fair') NOT NULL DEFAULT 'good',
	`itemDescription` text,
	`image1Url` text,
	`image2Url` text,
	`courierService` varchar(100),
	`trackingNumber` varchar(255),
	`shippingLabelUrl` text,
	`status` enum('pending_review','approved','label_sent','in_transit','received','inspected','listed','rejected','completed') NOT NULL DEFAULT 'pending_review',
	`estimatedResaleValue` decimal(10,2),
	`tokensAwarded` decimal(10,2),
	`tokensAwardedAt` timestamp,
	`inspectionNotes` text,
	`rejectionReason` text,
	`resultingProductId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courier_returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dateOfBirth` timestamp,
	`gender` varchar(50),
	`preferredCategories` text,
	`preferredSizes` text,
	`preferredBrands` text,
	`emailMarketing` boolean NOT NULL DEFAULT true,
	`smsMarketing` boolean NOT NULL DEFAULT false,
	`tokenBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalTokensEarned` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalTokensSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalTokensDonated` decimal(10,2) NOT NULL DEFAULT '0.00',
	`spendLimit` decimal(10,2) NOT NULL DEFAULT '0.00',
	`membershipTier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `discount_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`minItems` int NOT NULL,
	`maxItems` int,
	`discountPercentage` decimal(5,2) NOT NULL,
	`bonusTokensPercentage` decimal(5,2) NOT NULL DEFAULT '0.00',
	`description` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discount_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earned_return','earned_purchase','spent_discount','spent_spend_limit','donated_charity') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`balanceAfter` decimal(10,2) NOT NULL,
	`relatedOrderId` int,
	`relatedCourierReturnId` int,
	`relatedCharityId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_transactions_id` PRIMARY KEY(`id`)
);
