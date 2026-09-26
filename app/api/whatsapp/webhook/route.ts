
import { json } from "@/lib/server";
import { getDb } from "@/db/index";
import { whatsapp_messages } from "@/db/schema";
import { eq } from "drizzle-orm";


// WhatsApp Cloud API Webhook Verification
export async function GET(request: Request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Ideally store a WHATSAPP_VERIFY_TOKEN in env
    const verifyToken = "merchant_growth_wa_verify"; 

    if (mode === "subscribe" && token === verifyToken) {
        return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
}

// WhatsApp Cloud API Status Updates
export async function POST(request: Request) {
    try {
        const body = await request.json() as any;
        const db = getDb();
        
        // Parse WhatsApp webhook payload
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    if (change.value && change.value.statuses) {
                        for (const status of change.value.statuses) {
                            const messageId = status.id;
                            const statusType = status.status; // sent, delivered, read, failed

                            // Update DB
                            const updateData: any = {};
                            if (statusType === "delivered" || statusType === "failed") {
                                updateData.deliveryStatus = statusType;
                            }
                            if (statusType === "read") {
                                updateData.readStatus = "read";
                            }
                            
                            if (Object.keys(updateData).length > 0) {
                                await db.update(whatsapp_messages)
                                    .set(updateData)
                                    .where(eq(whatsapp_messages.whatsappMessageId, messageId))
                                    .run();
                            }
                        }
                    }
                }
            }
        }
        return new Response("EVENT_RECEIVED", { status: 200 });
    } catch (e) {
        console.error("WA Webhook Error", e);
        return new Response("Server Error", { status: 500 });
    }
}

