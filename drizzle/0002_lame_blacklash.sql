DROP INDEX `chats_updated_at_idx`;--> statement-breakpoint
CREATE INDEX `chats_updated_at_id_idx` ON `chats` (`updated_at`,`id`);--> statement-breakpoint
DROP INDEX `messages_chat_idx`;--> statement-breakpoint
CREATE INDEX `messages_chat_idx` ON `messages` (`chat_id`,`created_at`,`id`);