import os
import re

files = [
    "app/api/actions/route.ts",
    "app/api/ask/route.ts",
    "app/api/auth/route.ts",
    "app/api/paytm/transactions/route.ts",
    "app/api/paytm/webhook/route.ts",
    "app/api/whatsapp/route.ts",
    "app/api/whatsapp/campaigns/route.ts",
    "app/api/whatsapp/webhook/route.ts",
    "lib/paytm.ts",
    "lib/server.ts",
    "db/index.ts"
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove cloudflare:workers import
    content = re.sub(r"import\s*\{\s*env\s*\}\s*from\s*[\"']cloudflare:workers[\"'];?", "", content)
    
    # Replace env.DB with something that doesn't crash
    content = content.replace("!env.DB", "false")
    content = content.replace("env.DB", "({} as any)")
    
    # Replace env.PAYTM_MID etc with process.env
    content = content.replace("env.", "process.env.")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Stubbed CF imports")
