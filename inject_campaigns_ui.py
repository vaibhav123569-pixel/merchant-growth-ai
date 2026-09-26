import sys
import re

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

state_add = """  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
      if (page === "actions" && user) {
          api("/api/whatsapp/campaigns").then(res => {
              if (!res.error) setCampaigns(res.campaigns || []);
          }).catch(console.error);
      }
  }, [page, user]);
"""

content = content.replace("const [waResult, setWaResult] = useState<{success: boolean, sandbox: boolean, message: string} | null>(null);", "const [waResult, setWaResult] = useState<{success: boolean, sandbox: boolean, message: string} | null>(null);\n" + state_add)

campaigns_ui = """
        <section className="panel mt-8">
            <h2>WhatsApp Campaign Analytics</h2>
            <p className="muted mb-4">Track delivery and revenue performance of your AI-generated broadcasts.</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Redeemed</TableHead>
                        <TableHead>Revenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-4 muted">No campaigns run yet.</TableCell></TableRow>
                    ) : campaigns.map((c, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium">{c.campaignName || "AI_Smart_Offer_Default"}</TableCell>
                            <TableCell>{c.sent}</TableCell>
                            <TableCell>{c.delivered}</TableCell>
                            <TableCell>{c.read}</TableCell>
                            <TableCell>{c.redeemed}</TableCell>
                            <TableCell>{money(c.revenue)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
"""

# We need to find the end of the Action Lab content. Action Lab renders when page === "actions".
# The end of the "actions" page fragment is typically before `{page==="pulse"&&<>` or `{page==="intel"&&<>`.
# We'll search for the last `</section>` inside the `page==="actions"` block.
# Actually, the string `{page==="pulse"&&<>` or `{page==="pulse" && <>` is a good marker.
idx = content.find('{page==="pulse"&&<>')
if idx != -1:
    # insert right before the next page block
    content = content[:idx] + campaigns_ui + "\n" + content[idx:]
else:
    print("Could not find pulse page block")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected Campaigns UI")
