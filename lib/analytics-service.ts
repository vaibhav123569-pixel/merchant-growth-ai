import { getDb } from "@/db/index";
import { paytm_transactions } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function getMerchantAnalytics(merchantId: string) {
    const db = getDb();
    
    // Get all transactions for this merchant
    const txns = await db.select().from(paytm_transactions)
        .where(eq(paytm_transactions.merchantId, merchantId))
        .orderBy(desc(paytm_transactions.transactionTime))
        .all();

    const now = Date.now();
    const startOfDay = new Date().setHours(0,0,0,0);
    
    const successful = txns.filter(t => t.status === "TXN_SUCCESS");
    
    const todaysSuccessful = successful.filter(t => t.transactionTime && t.transactionTime >= startOfDay);
    const todaysRevenue = todaysSuccessful.reduce((sum, t) => sum + t.amount, 0);
    
    const averageTxnValue = successful.length > 0 
        ? successful.reduce((sum, t) => sum + t.amount, 0) / successful.length 
        : 0;

    // Payment mode share
    const paymentModeShare = successful.reduce((acc, t) => {
        const mode = t.paymentMode || "UNKNOWN";
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        todaysRevenue,
        totalSuccessfulTransactions: successful.length,
        totalTransactions: txns.length,
        successRate: txns.length > 0 ? (successful.length / txns.length) * 100 : 0,
        averageTxnValue,
        paymentModeShare,
        recentTransactions: txns.slice(0, 10)
    };
}
