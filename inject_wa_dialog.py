
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add states for WhatsApp dialog
state_add = """  const [waDialogOpen, setWaDialogOpen] = useState(false);
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
    content = content.replace("const[llm,setLLM]=useState({configured:false,model:\"\",message?:string});", "const[llm,setLLM]=useState({configured:false,model:\"\",message?:string});\n" + state_add)

# Find the old sendWhatsApp function and replace its usage
# The old one might be directly called, we replace it with openWaDialog
content = content.replace("sendWhatsApp(a.copilot.smartOffer.recommendation)", "openWaDialog(a.copilot.smartOffer.recommendation, a.copilot.smartOffer.title)")
content = content.replace("sendWhatsApp(action.offer)", "openWaDialog(action.offer, action.title)")

wa_dialog_ui = """
<Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>WhatsApp Broadcast</DialogTitle>
            <DialogDescription>Review campaign details before sending to customers.</DialogDescription>
        </DialogHeader>
        
        {!waResult ? (
            <div className="wa-confirm mt-4">
                <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                    <strong>Campaign Name:</strong> {waCampaignName}<br/>
                    <strong>Target Segment:</strong> 24 Opted-in Customers<br/>
                    <strong>Test Window:</strong> 2-5 PM (Next 3 Days)<br/>
                    <strong>Spending Limit:</strong> ₹300
                </div>
                <div className="mb-4">
                    <strong>Message Preview:</strong>
                    <div className="p-3 bg-green-50 text-green-900 rounded-md mt-1 border border-green-200">
                        {waOffer}
                    </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                    <button className="secondary" onClick={() => setWaDialogOpen(false)}>Cancel</button>
                    <button className="primary" disabled={waLoading} onClick={confirmSendWhatsApp}>
                        {waLoading ? <LoaderCircle className="spin inline mr-1" size={16}/> : null}
                        Send to 24 Customers <Send size={16} className="inline ml-1"/>
                    </button>
                </div>
            </div>
        ) : (
            <div className="wa-result mt-4 text-center py-6">
                {waResult.success ? (
                    <>
                        <div className="text-green-600 mb-2 flex justify-center"><Check size={32}/></div>
                        <h3 className="text-lg font-bold mb-1">Messages Sent!</h3>
                        <p className="muted mb-4">{waResult.message}</p>
                        {waResult.sandbox && (
                            <div className="bg-amber-50 text-amber-800 p-2 rounded text-sm mb-4">
                                <strong>Sandbox Mode:</strong> WhatsApp credentials missing in .env. Mock messages simulated successfully.
                            </div>
                        )}
                        <button className="primary" onClick={() => setWaDialogOpen(false)}>Done</button>
                    </>
                ) : (
                    <>
                        <div className="text-red-600 mb-2 flex justify-center"><Info size={32}/></div>
                        <h3 className="text-lg font-bold mb-1">Send Failed</h3>
                        <p className="text-red-700 text-sm mb-4">{waResult.message}</p>
                        <div className="flex justify-center gap-2">
                            <button className="secondary" onClick={() => setWaDialogOpen(false)}>Cancel</button>
                            <button className="primary" onClick={confirmSendWhatsApp}>Retry</button>
                        </div>
                    </>
                )}
            </div>
        )}
    </DialogContent>
</Dialog>
"""

# Inject wa_dialog_ui just before the final </SidebarProvider>
content = content.replace("</SidebarProvider>;", wa_dialog_ui + "\n </SidebarProvider>;")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected WhatsApp Confirmation Dialog UI")

