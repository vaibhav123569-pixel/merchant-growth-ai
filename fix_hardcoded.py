import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'note="13 fewer than matched baseline"',
    'note={`${Math.abs(Math.round(e.count - e.baseline))} ${e.count < e.baseline ? "fewer" : e.count > e.baseline ? "more" : "change"} than matched baseline`}'
)

content = content.replace(
    '<div className="comparison"><strong>{e.count}</strong><span>vs</span><strong>{e.baseline}</strong><span className="change-pill">−32.5%</span></div>',
    '<div className="comparison"><strong>{e.count}</strong><span>vs</span><strong>{Math.round(e.baseline)}</strong><span className="change-pill">{e.change > 0 ? "+" : ""}{e.change.toFixed(1)}%</span></div>'
)

content = content.replace(
    '<p>{t("Payments from 2–5 PM fell by 32.5%. Average payment stayed at ₹100.","दोपहर 2–5 बजे भुगतान 32.5% घटे। प्रति भुगतान औसत ₹100 रहा।")}</p>',
    '<p>{t(`Payments from 2–5 PM changed by ${e.change.toFixed(1)}%. Average payment is ${money(e.average)}.`,`दोपहर 2–5 बजे भुगतान ${e.change.toFixed(1)}% बदला। प्रति भुगतान औसत ${money(e.average)} रहा।`)}</p>'
)

content = content.replace(
    'note="Unchanged · 2–5 PM"',
    'note="2–5 PM"'
)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed hardcoded data")
