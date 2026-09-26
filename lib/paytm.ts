import PaytmChecksum from "paytmchecksum";
import { env } from "cloudflare:workers";

export async function generateChecksum(body: any, merchantKey: string): Promise<string> {
    const isObj = typeof body === "object";
    const str = isObj ? JSON.stringify(body) : String(body);
    return await PaytmChecksum.generateSignature(str, merchantKey);
}

export async function verifyChecksum(body: any, checksum: string, merchantKey: string): Promise<boolean> {
    const isObj = typeof body === "object";
    const str = isObj ? JSON.stringify(body) : String(body);
    return PaytmChecksum.verifySignature(str, merchantKey, checksum);
}

export async function checkTransactionStatus(orderId: string): Promise<any> {
    const mid = env.PAYTM_MID || process.env.PAYTM_MID;
    const mkey = env.PAYTM_MERCHANT_KEY || process.env.PAYTM_MERCHANT_KEY;
    const isProd = (env.PAYTM_ENVIRONMENT || process.env.PAYTM_ENVIRONMENT) === "PRODUCTION";
    
    if (!mid || !mkey) {
        throw new Error("Paytm credentials not configured in environment variables.");
    }
    
    const body = {
        mid: mid,
        orderId: orderId,
    };
    
    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(body), mkey);
    
    const paytmParams = {
        body: body,
        head: {
            signature: checksum
        }
    };
    
    const host = isProd ? "securegw.paytm.in" : "securegw-stage.paytm.in";
    const post_data = JSON.stringify(paytmParams);
    
    const response = await fetch(`https://${host}/v3/order/status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length.toString()
        },
        body: post_data
    });
    
    const result = await response.json();
    return result;
}
