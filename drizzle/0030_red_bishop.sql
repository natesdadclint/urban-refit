ALTER TABLE `order_items` ADD `charityPayoutAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `products` ADD `charityPayoutAmount` decimal(10,2) DEFAULT '0.00' NOT NULL;