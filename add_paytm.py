
import sys

schema_addition = """
export const paytm_transactions = sqliteTable("paytm_transactions", {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id").notNull().references(() => users.id),
    orderId: text("order_id").notNull(),
    txnId: text("txn_id"),
    amount: integer("amount").notNull(), // stored in cents/paise or as real
    currency: text("currency").notNull().default("INR"),
    status: text("status").notNull().default("PENDING"), // TXN_SUCCESS / TXN_FAILURE / PENDING
    paymentMode: text("payment_mode"),
    bankName: text("bank_name"),
    bankTxnId: text("bank_txn_id"),
    gatewayName: text("gateway_name"),
    responseCode: text("response_code"),
    responseMessage: text("response_message"),
    refundAmount: integer("refund_amount"),
    transactionTime: integer("transaction_time"),
    verifiedAt: integer("verified_at"),
    rawProviderReference: text("raw_provider_reference"), // Sanitized JSON string
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
}, (t) => [
    uniqueIndex("pt_order_idx").on(t.orderId),
    index("pt_merchant_idx").on(t.merchantId),
    index("pt_status_idx").on(t.status)
]);
"""

with open("db/schema.ts", "a", encoding="utf-8") as f:
    f.write(schema_addition)

print("schema updated")

