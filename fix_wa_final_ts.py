
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("campaigns?:any[]};", "campaigns?:any[],sandbox?:boolean};")
content = content.replace("message: res.message});", "message: res.message || \"\"});")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS errors")

