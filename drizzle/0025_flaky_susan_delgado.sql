CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`totalReferrals` int NOT NULL DEFAULT 0,
	`completedReferrals` int NOT NULL DEFAULT 0,
	`totalTokensEarned` decimal(10,2) NOT NULL DEFAULT '0.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referralCodeId` int NOT NULL,
	`refereeId` int NOT NULL,
	`codeUsed` varchar(50) NOT NULL,
	`status` enum('pending','completed','expired') NOT NULL DEFAULT 'pending',
	`tokensAwarded` decimal(10,2) NOT NULL DEFAULT '0.00',
	`refereeBonus` decimal(10,2) NOT NULL DEFAULT '0.00',
	`signupAt` timestamp NOT NULL DEFAULT (now()),
	`firstPurchaseAt` timestamp,
	`rewardedAt` timestamp,
	`referrerNotified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
