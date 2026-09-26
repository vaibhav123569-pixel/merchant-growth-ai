import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'page==="cash"' in line:
        intel_code = """
 {page==="intel"&&<><div className="page-heading"><div><p className="eyebrow">PAYMENT INTELLIGENCE</p><h1>{t("Smart Split & MDR Estimator","स्मार्ट स्प्लिट और MDR")}</h1><p>Analyze transaction costs and partial payments without evading fees.</p></div></div><div className="main-grid"><section className="panel"><h2>UPI Cost & MDR Estimate</h2><p>Today's Estimated MDR: <strong>{money(a.estimatedMdr)}</strong></p><Table><TableHeader><TableRow><TableHead>Rule Name</TableHead><TableHead>Type</TableHead><TableHead>Min</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader><TableBody>{a.payment_rules.map(r=><TableRow key={r.rule_id}><TableCell>{r.rule_name}</TableCell><TableCell>{r.payment_type}</TableCell><TableCell>{money(r.min_amount)}</TableCell><TableCell>{r.rate_type==="percentage"?`${(r.rate_value*100).toFixed(2)}%`:"Zero"}</TableCell></TableRow>)}</TableBody></Table><p className="muted mt-3">₹2,000 is a merchant MDR threshold in the configured framework, not the normal UPI transaction limit. Actual acquiring-bank treatment can vary.</p></section><section className="panel"><h2>Smart Split Payment</h2><p>Legitimate partial collections. Reconciles parts to one invoice.</p><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Parts</TableHead></TableRow></TableHeader><TableBody>{a.invoices.map(inv=>{const pg=a.payment_groups.find(p=>p.invoice_id===inv.id);const parts=a.payment_parts.filter(p=>p.payment_group_id===pg?.id);return <TableRow key={inv.id}><TableCell className="font-semibold">{inv.invoice_number}</TableCell><TableCell>{money(inv.total_amount)}</TableCell><TableCell><span className={`status ${inv.status.toLowerCase()}`}>{inv.status}</span></TableCell><TableCell>{parts.length} part(s)</TableCell></TableRow>;})}</TableBody></Table><p className="table-footer">Split or partial payment availability depends on your acquiring bank/payment provider and merchant agreement.</p></section></div></>}
"""
        new_lines.append(intel_code.strip() + "\n")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Injected intel page successfully")
