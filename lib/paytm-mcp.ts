import { getDb } from "@/db/index";
import { paytm_transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export type PaytmMcpTransactionInput = {
  orderId?: string;
  txnId?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  status?: string | null;
  paymentMode?: string | null;
  bankName?: string | null;
  bankTxnId?: string | null;
  gatewayName?: string | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  transactionTime?: number | string | null;
  source?: string | null;
  merchantId?: string | null;
};

const normalizeStatus = (status: string | null | undefined) => {
  const raw = (status || "PENDING").toString().trim().toUpperCase();
  if (raw.includes("SUCCESS")) return "TXN_SUCCESS";
  if (raw.includes("FAIL") || raw.includes("DECLINED") || raw.includes("CANCEL")) return "TXN_FAILURE";
  return "PENDING";
};

export async function upsertPaytmTransactionsFromMcp(merchantId: string, transactions: PaytmMcpTransactionInput[] = []) {
  const db = getDb();

  for (const tx of transactions) {
    const orderId = tx.orderId || tx.txnId || crypto.randomUUID();
    const amountRaw = Number(tx.amount ?? 0);
    const amount = Number.isFinite(amountRaw) ? Math.max(0, Math.round(amountRaw)) : 0;
    const transactionTime = Number(tx.transactionTime ?? Date.now());
    const status = normalizeStatus(tx.status);

    const existing = await db.select().from(paytm_transactions).where(eq(paytm_transactions.orderId, orderId)).get();

    if (existing) {
      await db.update(paytm_transactions).set({
        amount,
        currency: tx.currency || existing.currency || "INR",
        status,
        paymentMode: tx.paymentMode || existing.paymentMode,
        bankName: tx.bankName || existing.bankName,
        bankTxnId: tx.bankTxnId || existing.bankTxnId,
        gatewayName: tx.gatewayName || existing.gatewayName,
        responseCode: tx.responseCode || existing.responseCode,
        responseMessage: tx.responseMessage || existing.responseMessage,
        transactionTime: Number.isFinite(transactionTime) ? transactionTime : existing.transactionTime ?? Date.now(),
        updatedAt: Date.now(),
        rawProviderReference: JSON.stringify({ source: tx.source || "mcp", ...tx }),
      }).where(eq(paytm_transactions.orderId, orderId)).run();
      continue;
    }

    await db.insert(paytm_transactions).values({
      id: crypto.randomUUID(),
      merchantId,
      orderId,
      txnId: tx.txnId || orderId,
      amount,
      currency: tx.currency || "INR",
      status,
      paymentMode: tx.paymentMode || null,
      bankName: tx.bankName || null,
      bankTxnId: tx.bankTxnId || null,
      gatewayName: tx.gatewayName || null,
      responseCode: tx.responseCode || null,
      responseMessage: tx.responseMessage || null,
      refundAmount: 0,
      transactionTime: Number.isFinite(transactionTime) ? transactionTime : Date.now(),
      verifiedAt: Date.now(),
      rawProviderReference: JSON.stringify({ source: tx.source || "mcp", ...tx }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }).run();
  }

  return { inserted: transactions.length };
}
