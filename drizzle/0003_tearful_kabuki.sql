ALTER TABLE `whatsapp_messages` ADD `campaign_name` text;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `template_used` text;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `whatsapp_message_id` text;--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `delivery_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `read_status` text DEFAULT 'unread';--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `redemption_status` text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `whatsapp_messages` ADD `attributed_revenue` integer DEFAULT 0;