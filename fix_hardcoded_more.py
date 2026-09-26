import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix tours text
content = content.replace(
    'text:"Start with the afternoon: 27 payments compared with a matched baseline of 40. The chart uses four prior Saturdays."',
    'text:`Start with the afternoon: ${e.count} payments compared with a matched baseline of ${Math.round(e.baseline)}. The chart uses four prior weeks.`'
)

# Fix static dates
content = content.replace(
    'SATURDAY, 26 SEPTEMBER 2026 · IST',
    '{new Date(TODAY).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()} · IST'
)
content = content.replace(
    '26 SEPTEMBER 2026 · DEMO SETTLEMENTS',
    '{new Date(TODAY).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()} · DEMO SETTLEMENTS'
)

# Fix action lab static values
content = content.replace(
    '<p>{((mean-40)/40*100).toFixed(1)}% vs the matched baseline of 40. {((mean-27)/27*100).toFixed(1)}% vs the original 27-payment afternoon.</p>',
    '<p>{((mean-Math.round(e.baseline))/Math.round(e.baseline)*100).toFixed(1)}% vs the matched baseline of {Math.round(e.baseline)}. {((mean-e.count)/e.count*100).toFixed(1)}% vs the original {e.count}-payment afternoon.</p>'
)
content = content.replace(
    'from the Saturday baseline.',
    'from the matched baseline.'
)
content = content.replace(
    'the 40-payment matched baseline',
    'the matched baseline'
)
content = content.replace(
    'four prior Saturdays.',
    'four prior matched days.'
)

# Fix ask AI sidebar
content = content.replace(
    '<li><span>Current window</span><strong>26 Sep · 2–5 PM</strong></li>',
    '<li><span>Current window</span><strong>{new Date(TODAY).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · 2–5 PM</strong></li>'
)
content = content.replace(
    '<li><span>Difference</span><strong>−32.5%</strong></li>',
    '<li><span>Difference</span><strong>{e.change > 0 ? "+" : ""}{e.change.toFixed(1)}%</strong></li>'
)

# Fix Evidence Sheet
content = content.replace(
    '<span>26 September · 2–5 PM</span>',
    '<span>{new Date(TODAY).toLocaleDateString("en-IN", { month: "long", day: "numeric" })} · 2–5 PM</span>'
)
content = content.replace(
    '<p>{money(e.collections)} vs {money(e.baselineCollections)} · −32.5%</p>',
    '<p>{money(e.collections)} vs {money(e.baselineCollections)} · {e.change > 0 ? "+" : ""}{e.change.toFixed(1)}%</p>'
)
content = content.replace(
    '<h3>Four matched Saturdays</h3>',
    '<h3>Four matched baseline days</h3>'
)
content = content.replace(
    '<div className="formula">(27 − 40) ÷ 40 × 100 = −32.5%</div>',
    '<div className="formula">({e.count} − {Math.round(e.baseline)}) ÷ {Math.round(e.baseline)} × 100 = {e.change > 0 ? "+" : ""}{e.change.toFixed(1)}%</div>'
)
content = content.replace(
    '<span>As of 26 September 2026</span>',
    '<span>As of {new Date(TODAY).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>'
)
content = content.replace(
    '<span>26 September · all recorded hours</span>',
    '<span>{new Date(TODAY).toLocaleDateString("en-IN", { month: "long", day: "numeric" })} · all recorded hours</span>'
)
content = content.replace(
    'As of 26 September',
    'As of {new Date(TODAY).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}'
)

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("More hardcoded data fixed!")
