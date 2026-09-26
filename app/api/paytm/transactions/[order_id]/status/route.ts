import { json, user } from "@/lib/server";
import { checkTransactionStatus } from "@/lib/paytm";
import { getDb } from "@/db/index";
import { paytm_transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, context: any) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        // the dynamic route parameter is context.params.order_id
        const orderId = context?.params?.order_id;
        if (!orderId) return json({error: "Missing order_id"}, 400);

        const db = getDb();
        const existingTxn = await db.select().from(paytm_transactions).where(eq(paytm_transactions.orderId, orderId)).get();
        
        if (!existingTxn) return json({error: "Order not found"}, 404);
        if (existingTxn.merchantId !== u.id) return json({error: "Forbidden"}, 403);

        // Fetch from Paytm API
        const statusResponse = await checkTransactionStatus(orderId);
        
        if (!statusResponse || !statusResponse.body) {
             return json({error: "Could not verify transaction with Paytm"}, 502);
        }

        const verifiedData = statusResponse.body;
        
        // Update local DB
        await db.update(paytm_transactions).set({
            txnId: verifiedData.txnId,
            status: verifiedData.resultInfo?.resultStatus === "TXN_SUCCESS" ? "TXN_SUCCESS" : (verifiedData.resultInfo?.resultStatus === "TXN_FAILURE" ? "TXN_FAILURE" : "PENDING"),
            paymentMode: verifiedData.paymentMode,
            bankName: verifiedData.bankName,
            bankTxnId: verifiedData.bankTxnId,
            gatewayName: verifiedData.gatewayName,
            responseCode: verifiedData.resultInfo?.resultCode,
            responseMessage: verifiedData.resultInfo?.resultMsg,
            refundAmount: verifiedData.refundAmt ? parseFloat(verifiedData.refundAmt) : 0,
            transactionTime: verifiedData.txnDate ? new Date(verifiedData.txnDate).getTime() : Date.now(),
            verifiedAt: Date.now(),
            updatedAt: Date.now()
        }).where(eq(paytm_transactions.orderId, orderId)).run();

        // Refetch updated row
        const updatedTxn = await db.select().from(paytm_transactions).where(eq(paytm_transactions.orderId, orderId)).get();
        
        // Exclude raw Provider reference or internal fields if not needed, but spec allows it.
        return json(updatedTxn);
    } catch (e) {
        console.error("Status fetch error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}
