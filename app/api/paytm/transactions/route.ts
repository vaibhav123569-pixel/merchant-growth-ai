import { json, user, readJson } from "@/lib/server";
import { getDb } from "@/db/index";
import { paytm_transactions } from "@/db/schema";
import { env } from "cloudflare:workers";

export async function POST(request: Request) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        const b = await readJson(request) as { amount: number };
        if (!b.amount || b.amount <= 0) return json({error: "Invalid amount"}, 400);

        const db = getDb();
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        await db.insert(paytm_transactions).values({
            id: crypto.randomUUID(),
            merchantId: u.id,
            orderId: orderId,
            amount: b.amount,
            currency: "INR",
            status: "PENDING",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }).run();

        return json({
            orderId: orderId,
            amount: b.amount,
            mid: env.PAYTM_MID || process.env.PAYTM_MID
        });
    } catch (e) {
        console.error("Create transaction error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}
