CREATE TABLE `whatsapp_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`recipient` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'SENT' NOT NULL,
	`sent_at` integer NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
