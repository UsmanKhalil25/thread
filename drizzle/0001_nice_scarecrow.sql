CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`progress` real DEFAULT 0,
	`local_path` text,
	`resume_data` text,
	`error_message` text
);
