
import sys

with open("cloudflare-env.d.ts", "w", encoding="utf-8") as f:
    f.write("""declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PAYTM_MERCHANT_KEY?: string;
    PAYTM_MID?: string;
    PAYTM_ENVIRONMENT?: string;
  }
}
""")
print("Updated cloudflare-env.d.ts")

