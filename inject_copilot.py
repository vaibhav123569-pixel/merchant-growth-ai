import sys
import re

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Copilot icon import if not there, let's just use existing ones like Rocket, Zap or Sparkles. Sparkles is already imported!
# `import { ..., Sparkles } from "lucide-react"` is present.
# Let's add Rocket and Zap to lucide-react imports if possible, or just use Sparkles and Target.

# 2. Add Copilot to navigation
if 'id:"copilot"' not in content:
    nav_insertion = """const nav=[{id:"pulse",label:t("Today's pulse","आज की स्थिति"),icon:Activity},{id:"copilot",label:t("AI Copilot","एआई को-पायलट"),icon:Sparkles},{id:"intel","""
    content = re.sub(r'const nav=\[\{id:"pulse",label:t\("Today\'s pulse","आज की स्थिति"\),icon:Activity\},\{id:"intel",', nav_insertion, content)

# 3. Add the Copilot UI block right before `{page==="pulse"&&...}`
copilot_ui = """
{page==="copilot"&&<><div className="page-heading"><div><p className="eyebrow">AI MERCHANT GROWTH COPILOT</p><h1>{t("Your daily action plan.","आपकी दैनिक कार्य योजना।")}</h1><p>{t("Your business data tells a story. The Copilot turns it into today's next best action.","आपका डेटा आपकी कहानी है। को-पायलट आपको अगला कदम बताता है।")}</p></div></div><div className="metrics"><Metric label={t("Growth Score","ग्रोथ स्कोर")} value={String(a.copilot.growthScore)} note={`${a.copilot.growthTrend} · ${a.copilot.scoreLabel}`} icon={Sparkles}/><Metric label={t("Today's Revenue","आज की कमाई")} value={money(a.total)} note="Current 24h" icon={Wallet}/><Metric label={t("Transactions","लेन-देन")} value={String(a.count)} note="Successful" icon={Activity}/><Metric label={t("Average Value","औसत राशि")} value={money(a.total/Math.max(1,a.count))} note="Overall AOV" icon={ArrowUpRight}/></div><div className="main-grid"><section className="panel"><h2>{t("Today's AI Insights","आज की एआई जानकारी")}</h2><div className="insights-list">{a.copilot.insights.map(i=><div key={i.id} className="action-list-item"><div><span className={`status ${i.severity.toLowerCase()}`}>{i.severity}</span><strong>{i.title}</strong><p className="text-sm muted">{i.evidence}</p><div className="mt-2 text-sm"><strong>Action:</strong> {i.action}</div></div></div>)}</div></section><section className="panel"><h2>{t("7-Day Forecast","7-दिन का अनुमान")}</h2><p className="muted mb-4">{t("Expected revenue range based on recent patterns.","हाल के रुझान पर आधारित अनुमानित कमाई।")}</p><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Expected Min</TableHead><TableHead>Expected Max</TableHead></TableRow></TableHeader><TableBody>{a.copilot.forecast.slice(0, 5).map(f=><TableRow key={f.date}><TableCell>{new Date(f.date).toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"})}</TableCell><TableCell>{money(f.expected_min)}</TableCell><TableCell>{money(f.expected_max)}</TableCell></TableRow>)}</TableBody></Table></section></div><div className="main-grid mt-4"><section className="panel"><h2>{t("Peak Hours & Retention","व्यस्त समय और ग्राहक")}</h2><div className="metrics mt-4"><Metric label="Peak Hour" value={a.copilot.peakHour} note={`${a.copilot.peakHourShare} of daily value`} icon={Activity}/><Metric label="Repeat Rate" value={`${Math.round((a.returning/Math.max(1,a.customers.length))*100)}%`} note="Returning vs Total" icon={Users}/></div></section><section className="panel next-step"><span className="action-icon"><Sparkles/></span><div><p className="eyebrow">SMART OFFER RECOMMENDATION</p><h2>{a.copilot.smartOffer.title}</h2><p><strong>Trigger:</strong> {a.copilot.smartOffer.condition}</p><p className="mt-2 text-lg"><strong>{a.copilot.smartOffer.recommendation}</strong></p><p className="muted mt-2"><ShieldCheck size={14} className="inline mr-1"/> Guardrail: {a.copilot.smartOffer.guardrail}</p></div><div className="button-row mt-4"><button className="primary" onClick={()=>alert("Offer accepted and drafted!")}>Accept Offer <Check size={16}/></button><button className="secondary" onClick={()=>alert("Offer dismissed.")}>Dismiss</button></div></section></div></>}
"""

content = content.replace('{page==="pulse"&&<>', copilot_ui + '\n{page==="pulse"&&<>')

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Injected Copilot UI into MerchantApp.tsx")
