import { json, user } from "@/lib/server";
import { upsertPaytmTransactionsFromMcp } from "@/lib/paytm-mcp";

export async function POST(request: Request) {
  try {
    const u = await user(request);
    if (!u) return json({ error: "Unauthorized" }, 401);

    const body = await request.json().catch(() => ({})) as any;
    const transactions = Array.isArray(body?.transactions) ? body.transactions : [];

    if (!transactions.length) {
      return json({ error: "No transactions provided" }, 400);
    }

    const result = await upsertPaytmTransactionsFromMcp(u.id, transactions);
    return json({ ok: true, ...result });
  } catch (error) {
    console.error("Paytm MCP sync error", error);
    return json({ error: "Internal Server Error" }, 500);
  }
}
