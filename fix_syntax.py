
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("d=>setUser(d.user); if (d.user) { api(\"/api/paytm/analytics\").then(res => { if (!res.error) setPaytmData(res); }).catch(console.error); }", "d => { setUser(d.user); if (d.user) { api(\"/api/paytm/analytics\").then(res => { if (!res.error) setPaytmData(res); }).catch(console.error); } }")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Syntax fixed")

