CREATE TABLE `model_downloads` (
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text NOT NULL,
	`status` text NOT NULL,
	`file_path` text,
	`downloaded_bytes` integer DEFAULT 0 NOT NULL,
	`task_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_downloads_model_id_idx` ON `model_downloads` (`model_id`);--> statement-breakpoint
CREATE INDEX `model_downloads_status_idx` ON `model_downloads` (`status`);--> statement-breakpoint
CREATE TABLE `preferences_table` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `preferences_updated_at_idx` ON `preferences_table` (`updated_at`);