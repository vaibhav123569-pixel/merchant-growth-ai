
import sys

with open("app/MerchantApp.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("configured:boolean,model:string};", "configured:boolean,model:string,message?:string};")

with open("app/MerchantApp.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed Message type in MerchantApp.tsx")

