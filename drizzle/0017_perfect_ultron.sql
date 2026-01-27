ALTER TABLE `customer_profiles` ADD `deviceFingerprint` varchar(255);--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `lastKnownIp` varchar(45);--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `weeklyRewardClaimCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `suspiciousActivityFlag` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `suspiciousActivityReason` text;