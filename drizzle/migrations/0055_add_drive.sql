CREATE TABLE `drive_items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`parent_id` text,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`r2_key` text,
	`size` integer DEFAULT 0 NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`link_token` text,
	`trashed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `drive_items_owner_parent_idx` ON `drive_items` (`owner_id`,`parent_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `drive_items_link_token_idx` ON `drive_items` (`link_token`);
--> statement-breakpoint
CREATE TABLE `drive_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'view' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `drive_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drive_shares_item_user_idx` ON `drive_shares` (`item_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `drive_shares_user_idx` ON `drive_shares` (`user_id`);
