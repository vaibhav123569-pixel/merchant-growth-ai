import { json, user, readJson } from "@/lib/server";
import { getDb } from "@/db/index";
import { whatsapp_messages } from "@/db/schema";


export async function POST(request: Request) {
    try {
        const u = await user(request);
        if (!u) return json({error: "Unauthorized"}, 401);

        const b = await readJson(request) as { recipients?: string[], message?: string, campaignName?: string };
        if (!b.message || typeof b.message !== "string") {
            return json({error: "Invalid message"}, 400);
        }
        
        const campaignName = b.campaignName || "AI_Smart_Offer_Default";
        let recipients = b.recipients || [];
        if (recipients.length === 0) {
            recipients = ["+919876543210"]; // Demo fallback
        }

        const db = getDb();
        const now = Date.now();
        const results = [];
        
        // WhatsApp API configuration
        const token = (process.env as any).WHATSAPP_TOKEN || (env as any).WHATSAPP_TOKEN;
        const phoneId = (process.env as any).WHATSAPP_PHONE_NUMBER_ID || (env as any).WHATSAPP_PHONE_NUMBER_ID;
        const version = (process.env as any).WHATSAPP_API_VERSION || (env as any).WHATSAPP_API_VERSION || "v17.0";
        
        const isSandbox = !token || !phoneId;

        for (const recipient of recipients) {
            let messageId = "mock_" + crypto.randomUUID();
            let status = "SENT";
            
            if (isSandbox) {
                console.log(`[WHATSAPP SANDBOX] Sending to ${recipient}: ${b.message}`);
            } else {
                // Real WhatsApp Cloud API Call
                const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
                
                // Constructing a payload for a text message (can be upgraded to a template)
                const payload = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: recipient.replace("+", ""),
                    type: "text",
                    text: {
                        preview_url: false,
                        body: b.message
                    }
                };

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json() as any;
                
                if (!res.ok) {
                    console.error("WhatsApp API Error:", data);
                    status = "FAILED";
                } else {
                    messageId = data.messages?.[0]?.id || messageId;
                }
            }

            // Insert into tracking database
            await db.insert(whatsapp_messages).values({
                id: crypto.randomUUID(),
                merchantId: u.id,
                campaignName: campaignName,
                recipient: recipient,
                message: b.message,
                templateUsed: "custom_text",
                status: status,
                whatsappMessageId: messageId,
                deliveryStatus: status === "FAILED" ? "failed" : "pending",
                readStatus: "unread",
                redemptionStatus: "none",
                attributedRevenue: 0,
                sentAt: now
            }).run();
            
            results.push({ recipient, status, messageId });
        }

        return json({
            success: true,
            sandbox: isSandbox,
            message: `Processed ${recipients.length} messages.`,
            results
        });
    } catch (e) {
        console.error("WhatsApp broadcast error", e);
        return json({error: "Internal Server Error"}, 500);
    }
}
