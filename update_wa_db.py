
import sys

with open("db/schema.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_schema = """export const whatsapp_messages = sqliteTable("whatsapp_messages", {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id").notNull().references(() => users.id),
    recipient: text("recipient").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("SENT"),
    sentAt: integer("sent_at").notNull()
});"""

new_schema = """export const whatsapp_messages = sqliteTable("whatsapp_messages", {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id").notNull().references(() => users.id),
    campaignName: text("campaign_name"),
    recipient: text("recipient").notNull(),
    message: text("message").notNull(),
    templateUsed: text("template_used"),
    status: text("status").notNull().default("SENT"),
    whatsappMessageId: text("whatsapp_message_id"),
    deliveryStatus: text("delivery_status").default("pending"),
    readStatus: text("read_status").default("unread"),
    redemptionStatus: text("redemption_status").default("none"),
    attributedRevenue: integer("attributed_revenue").default(0),
    sentAt: integer("sent_at").notNull()
});"""

content = content.replace(old_schema, new_schema)

with open("db/schema.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated schema.ts")

