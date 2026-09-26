
import sys
import glob

files = ["app/api/paytm/transactions/route.ts", "app/api/paytm/webhook/route.ts", "lib/paytm.ts"]
for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    content = content.replace("process.(env as any)", "(process.env as any)")
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)

print("Syntax fixed")

