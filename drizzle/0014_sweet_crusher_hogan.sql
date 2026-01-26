ALTER TABLE `sell_submissions` ADD `requestedTokens` int;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `tokenOffer` int;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `counterTokenOffer` int;--> statement-breakpoint
ALTER TABLE `sell_submissions` ADD `finalTokens` int;--> statement-breakpoint
ALTER TABLE `sell_submissions` DROP COLUMN `askingPrice`;--> statement-breakpoint
ALTER TABLE `sell_submissions` DROP COLUMN `offerAmount`;--> statement-breakpoint
ALTER TABLE `sell_submissions` DROP COLUMN `counterOfferAmount`;--> statement-breakpoint
ALTER TABLE `sell_submissions` DROP COLUMN `finalAmount`;