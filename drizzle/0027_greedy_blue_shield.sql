ALTER TABLE `referrals` ADD `expiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `referrals` ADD `bonusDonationOnly` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` ADD `timerBonusTokens` decimal(10,2) DEFAULT '0.00' NOT NULL;