
import sys
import re

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure api return type has campaigns
content = content.replace("configured:boolean,model:string,message?:string};", "configured:boolean,model:string,message?:string,campaigns?:any[]};")

state_add = """
  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waOffer, setWaOffer] = useState("");
  const [waCampaignName, setWaCampaignName] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waResult, setWaResult] = useState<{success: boolean, sandbox: boolean, message: string} | null>(null);

  async function confirmSendWhatsApp() {
      setWaLoading(true);
      setWaResult(null);
      try {
          const res = await api("/api/whatsapp", { message: waOffer, campaignName: waCampaignName });
          if (res.error) throw new Error(res.error);
          setWaResult({success: true, sandbox: res.sandbox, message: res.message});
      } catch (err) {
          setWaResult({success: false, sandbox: false, message: (err as Error).message});
      } finally {
          setWaLoading(false);
      }
  }

  function openWaDialog(offer: string, title: string) {
      setWaOffer(offer);
      setWaCampaignName(title);
      setWaResult(null);
      setWaDialogOpen(true);
  }
"""

if "const [waDialogOpen" not in content:
    # insert right after `const hi=language==="hi";` or similar. Let us find `const t=(en:string,hindi:string)=>hi?hindi:en;`
    content = content.replace("const t=(en:string,hindi:string)=>hi?hindi:en;", "const t=(en:string,hindi:string)=>hi?hindi:en;\n" + state_add)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed final WA bugs")

