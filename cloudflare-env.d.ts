declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PAYTM_MERCHANT_KEY?: string;
    PAYTM_MID?: string;
    PAYTM_ENVIRONMENT?: string;
  }
}
