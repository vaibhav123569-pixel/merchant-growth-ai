
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

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

if "confirmSendWhatsApp" not in content:
    # We find `const[llm,setLLM]=useState({configured:false,model:""});` which is around line 30
    content = content.replace("const[llm,setLLM]=useState({configured:false,model:\"\"});", "const[llm,setLLM]=useState({configured:false,model:\"\"});\n" + state_add)

# Also fix the data: any issue in whatsapp/route.ts
with open("app/api/whatsapp/route.ts", "r", encoding="utf-8") as f:
    wa_content = f.read()
wa_content = wa_content.replace("const data = await res.json();", "const data = await res.json() as any;")
with open("app/api/whatsapp/route.ts", "w", encoding="utf-8") as f:
    f.write(wa_content)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed WA State and Types")

