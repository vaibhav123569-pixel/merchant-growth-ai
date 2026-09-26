CREATE TABLE `paytm_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`order_id` text NOT NULL,
	`txn_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`payment_mode` text,
	`bank_name` text,
	`bank_txn_id` text,
	`gateway_name` text,
	`response_code` text,
	`response_message` text,
	`refund_amount` integer,
	`transaction_time` integer,
	`verified_at` integer,
	`raw_provider_reference` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pt_order_idx` ON `paytm_transactions` (`order_id`);--> statement-breakpoint
CREATE INDEX `pt_merchant_idx` ON `paytm_transactions` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `pt_status_idx` ON `paytm_transactions` (`status`);