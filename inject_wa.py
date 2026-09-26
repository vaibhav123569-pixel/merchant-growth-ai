
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add a sendWhatsApp helper function
wa_func = """
    async function sendWhatsApp(message: string) {
        setBusy(true);
        try {
            const res = await api("/api/whatsapp", { message });
            if (res.error) throw new Error(res.error);
            toast.success(res.message || "Sent via WhatsApp!");
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setBusy(false);
        }
    }
"""

# Insert inside MerchantApp
content = content.replace("async function loadActions()", wa_func + "\n    async function loadActions()")

# Update Copilot button
old_button = """<button className="primary" onClick={()=>alert("Offer accepted and drafted!")}>Accept Offer <Check size={16}/></button>"""
new_button = """<button className="primary" onClick={()=>sendWhatsApp(a.copilot.smartOffer.recommendation)} disabled={busy}>Broadcast via WhatsApp <Send size={16}/></button>"""
content = content.replace(old_button, new_button)

# Also update the Action Lab (draft state)
# Action lab has: <button className="primary" onClick={()=>alert("Launch approved")}>Approve</button>
old_action_btn = """<button className="primary" disabled={busy} onClick={()=>saveAction(action.id,"approved")}>Approve to Launch</button>"""
new_action_btn = """<button className="primary" disabled={busy} onClick={()=>{ saveAction(action.id,"approved"); sendWhatsApp(action.offer); }}>Approve & WhatsApp Broadcast <Send size={16} className="inline ml-1"/></button>"""
content = content.replace(old_action_btn, new_action_btn)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected WA UI")

