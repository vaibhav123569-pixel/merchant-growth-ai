import {integer,sqliteTable,text,index,uniqueIndex} from "drizzle-orm/sqlite-core";
export const users=sqliteTable("users",{id:text("id").primaryKey(),email:text("email"),name:text("name").notNull(),hash:text("hash"),salt:text("salt"),demo:integer("demo").notNull().default(0),created:integer("created").notNull()},t=>[uniqueIndex("users_email").on(t.email)]);
export const sessions=sqliteTable("sessions",{token:text("token").primaryKey(),userId:text("user_id").notNull().references(()=>users.id),expires:integer("expires").notNull()},t=>[index("sessions_user").on(t.userId)]);
export const actions=sqliteTable("actions",{id:text("id").primaryKey(),userId:text("user_id").notNull().references(()=>users.id),title:text("title").notNull(),offer:text("offer").notNull(),budget:integer("budget").notNull(),status:text("status").notNull(),counts:text("counts").notNull(),updated:integer("updated").notNull()},t=>[index("actions_user").on(t.userId)]);
export const attempts=sqliteTable("attempts",{key:text("key").primaryKey(),count:integer("count").notNull(),until:integer("until").notNull()});

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
