declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET: R2Bucket;
    PAYTM_MERCHANT_KEY?: string;
    PAYTM_MID?: string;
        PAYTM_ENVIRONMENT?: string;
    WHATSAPP_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_API_VERSION?: string;
  }
}
