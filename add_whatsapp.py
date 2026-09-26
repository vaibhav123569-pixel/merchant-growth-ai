
import sys

schema_addition = """
export const whatsapp_messages = sqliteTable("whatsapp_messages", {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id").notNull().references(() => users.id),
    recipient: text("recipient").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("SENT"),
    sentAt: integer("sent_at").notNull()
});
"""

with open("db/schema.ts", "a", encoding="utf-8") as f:
    f.write(schema_addition)

print("schema updated with whatsapp_messages")

