ALTER TABLE `sell_submissions` MODIFY COLUMN `status` enum('pending','reviewing','offer_made','offer_accepted','offer_rejected','counter_offered','accepted','rejected','completed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `customerResponse` enum('pending','accepted','rejected','counter');--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `counterOfferAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `customerNotes` text;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `offerSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `customerRespondedAt` timestamp;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `finalAmount` decimal(10,2);