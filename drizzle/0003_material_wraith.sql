CREATE INDEX `models_status_idx` ON `models` (`status`);--> statement-breakpoint
CREATE INDEX `models_updated_at_idx` ON `models` (`updated_at`);--> statement-breakpoint
CREATE INDEX `preferences_updated_at_idx` ON `preferences_table` (`updated_at`);