import { json, user } from "@/lib/server";
import { getDb } from "@/db/index";
import { paytm_transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        const db = getDb();
        
        // We fetch the transactions for this user.
        // A full implementation would apply pagination, dates, status filters from URLSearchParams.
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get("limit") || "50");
        
        const txns = await db.select({
            order_id: paytm_transactions.orderId,
            txn_id: paytm_transactions.txnId,
            amount: paytm_transactions.amount,
            currency: paytm_transactions.currency,
            status: paytm_transactions.status,
            payment_mode: paytm_transactions.paymentMode,
            bank_txn_id: paytm_transactions.bankTxnId,
            gateway_name: paytm_transactions.gatewayName,
            transaction_time: paytm_transactions.transactionTime
        }).from(paytm_transactions)
          .where(eq(paytm_transactions.merchantId, u.id))
          .orderBy(desc(paytm_transactions.createdAt))
          .limit(limit)
          .all();

        return json({ transactions: txns });
    } catch (e) {
        console.error("Fetch transactions error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}
