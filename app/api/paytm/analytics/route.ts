import { json, user } from "@/lib/server";
import { getMerchantAnalytics } from "@/lib/analytics-service";

export async function GET(request: Request) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        const data = await getMerchantAnalytics(u.id);
        return json(data);
    } catch (e) {
        console.error("Fetch analytics error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}
