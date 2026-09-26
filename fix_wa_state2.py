
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
    # Just inject it after `const hi=language==="hi";`
    content = content.replace("const hi=language===\"hi\";", state_add + "\n const hi=language===\"hi\";")

# Wait, `campaigns` state is missing from MerchantApp.tsx too?
# Let us check if `const [campaigns, setCampaigns] = useState<any[]>([]);` is in there.
if "const [campaigns," not in content:
    content = content.replace("const hi=language===\"hi\";", """  const [campaigns, setCampaigns] = useState<any[]>([]);
  useEffect(() => {
      if (page === "actions" && user) {
          api("/api/whatsapp/campaigns").then(res => {
              if (!res.error) setCampaigns(res.campaigns || []);
          }).catch(console.error);
      }
  }, [page, user]);
""" + "\n const hi=language===\"hi\";")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed WA State")

