
import sys

with open("cloudflare-env.d.ts", "r", encoding="utf-8") as f:
    env_content = f.read()

addition = """    PAYTM_ENVIRONMENT?: string;
    WHATSAPP_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_API_VERSION?: string;"""

env_content = env_content.replace("PAYTM_ENVIRONMENT?: string;", addition)

with open("cloudflare-env.d.ts", "w", encoding="utf-8") as f:
    f.write(env_content)

with open(".env.example", "a", encoding="utf-8") as f:
    f.write("\nWHATSAPP_TOKEN=\"YOUR_META_WHATSAPP_TOKEN\"\nWHATSAPP_PHONE_NUMBER_ID=\"YOUR_PHONE_NUMBER_ID\"\nWHATSAPP_API_VERSION=\"v17.0\"\n")

print("Updated env types")

