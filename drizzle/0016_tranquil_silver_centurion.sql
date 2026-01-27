ALTER TABLE `sell_submissions` ADD `shippingLabelUrl` text;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `trackingNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `courierService` varchar(100);--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `labelSentAt` timestamp;