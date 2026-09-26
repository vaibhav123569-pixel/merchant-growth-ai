
import sys

# fix app/api/paytm/mcp/sync/route.ts
with open("app/api/paytm/mcp/sync/route.ts", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("const body = await request.json().catch(() => ({}));", "const body = await request.json().catch(() => ({})) as any;")
with open("app/api/paytm/mcp/sync/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

# fix app/api/paytm/transactions/route.ts
with open("app/api/paytm/transactions/route.ts", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("env.PAYTM_MID", "(env as any).PAYTM_MID")
with open("app/api/paytm/transactions/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

# fix app/api/paytm/webhook/route.ts
with open("app/api/paytm/webhook/route.ts", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("env.PAYTM_MERCHANT_KEY", "(env as any).PAYTM_MERCHANT_KEY")
with open("app/api/paytm/webhook/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

# fix lib/paytm.ts
with open("lib/paytm.ts", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("env.PAYTM_MID", "(env as any).PAYTM_MID")
content = content.replace("env.PAYTM_MERCHANT_KEY", "(env as any).PAYTM_MERCHANT_KEY")
content = content.replace("env.PAYTM_ENVIRONMENT", "(env as any).PAYTM_ENVIRONMENT")
with open("lib/paytm.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS errors")

