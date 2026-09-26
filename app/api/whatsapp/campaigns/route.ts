
import { json, user } from "@/lib/server";
import { getDb } from "@/db/index";
import { whatsapp_messages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        const db = getDb();
        const stats = await db.select({
            campaignName: whatsapp_messages.campaignName,
            sent: sql<number>`count(*)`,
            delivered: sql<number>`sum(case when ${whatsapp_messages.deliveryStatus} = 'delivered' then 1 else 0 end)`,
            read: sql<number>`sum(case when ${whatsapp_messages.readStatus} = 'read' then 1 else 0 end)`,
            redeemed: sql<number>`sum(case when ${whatsapp_messages.redemptionStatus} = 'redeemed' then 1 else 0 end)`,
            revenue: sql<number>`sum(${whatsapp_messages.attributedRevenue})`
        }).from(whatsapp_messages)
          .where(eq(whatsapp_messages.merchantId, u.id))
          .groupBy(whatsapp_messages.campaignName)
          .run();

        return json({ campaigns: stats.results || [] });
    } catch (e) {
        console.error("Campaign fetch error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}

