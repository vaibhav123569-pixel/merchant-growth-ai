
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("[user,setUser]=useState<User|null>(null)", "[user,setUser]=useState<User|null>(null),[paytmData,setPaytmData]=useState<any>(null)")

content = content.replace("setUser(d.user)", "setUser(d.user); if (d.user) { api(\"/api/paytm/analytics\").then(res => { if (!res.error) setPaytmData(res); }).catch(console.error); }")

ui_add = """
{paytmData && (
    <section className="panel mt-4">
        <h2>{t("Real-Time Gateway Analytics","रीयल-टाइम गेटवे डेटा")}</h2>
        <p className="muted mb-4">{t("Verified transactions from Paytm Integration","Paytm इंटीग्रेशन से सत्यापित लेनदेन")}</p>
        <div className="metrics">
            <Metric label={t("Today's Revenue","आज की कमाई")} value={money(paytmData.todaysRevenue)} note={`${paytmData.totalSuccessfulTransactions} successful txns`} icon={Wallet}/>
            <Metric label={t("Success Rate","सफलता दर")} value={`${Math.round(paytmData.successRate)}%`} note={`Out of ${paytmData.totalTransactions} total`} icon={ShieldCheck}/>
            <Metric label={t("Avg Order Value","औसत राशि")} value={money(paytmData.averageTxnValue)} note="Overall" icon={ArrowUpRight}/>
        </div>
        <h3 className="mt-6 mb-2">{t("Recent Gateway Transactions","हाल के गेटवे लेनदेन")}</h3>
        <Table>
            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Mode</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>
                {paytmData.recentTransactions.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-4 muted">No real transactions yet.</TableCell></TableRow> : 
                 paytmData.recentTransactions.map((tx: any) => (
                    <TableRow key={tx.orderId}>
                        <TableCell className="font-mono text-xs">{tx.orderId}</TableCell>
                        <TableCell>{money(tx.amount)}</TableCell>
                        <TableCell><span className={`status ${tx.status === "TXN_SUCCESS" ? "high" : tx.status === "TXN_FAILURE" ? "low" : "medium"}`}>{tx.status}</span></TableCell>
                        <TableCell>{tx.paymentMode || "-"}</TableCell>
                        <TableCell>{new Date(tx.transactionTime).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </section>
)}
"""

content = content.replace("{page===\"pulse\"&&<>\n", "{page===\"pulse\"&&<>\n" + ui_add)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected Paytm UI")

