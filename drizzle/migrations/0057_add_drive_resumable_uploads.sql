ALTER TABLE `drive_items` ADD `upload_part_size` integer;
--> statement-breakpoint
ALTER TABLE `drive_items` ADD `upload_fingerprint` text;
--> statement-breakpoint
CREATE TABLE `drive_upload_parts` (
	`item_id` text NOT NULL,
	`part_number` integer NOT NULL,
	`etag` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `drive_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drive_upload_parts_idx` ON `drive_upload_parts` (`item_id`,`part_number`);
