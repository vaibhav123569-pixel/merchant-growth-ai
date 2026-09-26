
export type Transaction = { id: string; date: string; hour: number; minute: number; amount: number; customer: string; status: "settled" | "pending" | "failed" | "refunded"; payment_mode: string; failure_reason?: string };
export type PaymentRule = { rule_id: string; rule_name: string; payment_type: string; merchant_category: string; min_amount: number; max_amount: number; rate_type: "percentage" | "flat" | "zero"; rate_value: number; fee_cap: number; transaction_limit: number; effective_from: string; effective_to: string; source_name: string; source_url: string; enabled: boolean };
export type Invoice = { id: string; merchant_id: string; invoice_number: string; total_amount: number; status: "PAID" | "PARTIAL" | "PENDING"; created_at: string };
export type PaymentGroup = { id: string; invoice_id: string; total_due: number; total_collected: number; outstanding_amount: number; status: string };
export type PaymentPart = { id: string; payment_group_id: string; transaction_id: string; payer_label: string; payment_method: string; intended_amount: number; collected_amount: number; status: "SUCCESS" | "FAILED" };

export const TODAY = "2026-09-26";
export const dates = Array.from({length: 90}, (_, i) => {
    const d = new Date(Date.parse(TODAY));
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().split("T")[0];
});

const dayCounts = [[6,8,10,12,9,13,13,12,12,15,11,7],[7,9,12,13,8,14,14,14,14,16,12,8],[5,8,11,12,9,13,13,13,13,14,10,7],[6,9,10,12,10,14,14,13,12,15,11,6],[5,8,11,12,9,10,9,8,12,14,10,6]];

export const transactions: Transaction[] = dates.flatMap((date, day) => {
    const dayOfWeek = new Date(date).getDay();
    const pattern = dayOfWeek === 6 || dayOfWeek === 0 ? 4 : dayOfWeek % 4; 
    return dayCounts[pattern].flatMap((count, index) => Array.from({ length: count }, (_, n) => {
        let amt = 100;
        if (n % 5 === 0) amt = 2500;
        if (n % 11 === 0) amt = 5500;
        
        let status: "settled" | "pending" | "failed" | "refunded" = "settled";
        let failure_reason;
        
        if (date === TODAY && ((index + n) % 4 === 0)) status = "pending";
        else if (n % 17 === 0) {
            status = "failed";
            failure_reason = index % 2 === 0 ? "technical decline" : "business decline";
        } else if (n % 23 === 0 && date !== TODAY) {
            status = "refunded";
        }
        
        return {
            id: `TX-${day + 1}-${index + 9}-${String(n + 1).padStart(2, "0")}`,
            date,
            hour: index + 9,
            minute: Math.floor(n * 60 / count),
            amount: amt,
            customer: `DEMO-${String(1 + (day * 3 + index + n) % 150).padStart(3, "0")}`,
            status,
            payment_mode: n % 3 === 0 ? "Cash" : "UPI",
            failure_reason
        };
    }));
});

export const payment_rules: PaymentRule[] = [
    { rule_id: "R-UPI-01", rule_name: "Merchant P2M up to ₹2,000", payment_type: "UPI", merchant_category: "ALL", min_amount: 0, max_amount: 2000, rate_type: "zero", rate_value: 0, fee_cap: 0, transaction_limit: 100000, effective_from: "2026-09-15", effective_to: "2099-12-31", source_name: "Ministry of Finance / PIB", source_url: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2310586&lang=2&reg=48", enabled: true },
    { rule_id: "R-UPI-02", rule_name: "Specified P2M above ₹2,000", payment_type: "UPI", merchant_category: "ALL", min_amount: 2001, max_amount: 99999999, rate_type: "percentage", rate_value: 0.004, fee_cap: 300, transaction_limit: 100000, effective_from: "2026-09-15", effective_to: "2099-12-31", source_name: "Ministry of Finance / PIB", source_url: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2310586&lang=2&reg=48", enabled: true }
];

export const invoices: Invoice[] = [
    { id: "INV-001", merchant_id: "M-001", invoice_number: "2609-001", total_amount: 10000, status: "PAID", created_at: TODAY },
    { id: "INV-002", merchant_id: "M-001", invoice_number: "2609-002", total_amount: 10000, status: "PARTIAL", created_at: TODAY }
];

export const payment_groups: PaymentGroup[] = [
    { id: "PG-001", invoice_id: "INV-001", total_due: 10000, total_collected: 10000, outstanding_amount: 0, status: "PAID" },
    { id: "PG-002", invoice_id: "INV-002", total_due: 10000, total_collected: 2000, outstanding_amount: 8000, status: "PARTIAL" }
];

export const payment_parts: PaymentPart[] = [
    { id: "PP-001", payment_group_id: "PG-001", transaction_id: transactions.find(t=>t.amount===5500 && t.status==="settled")?.id || "TX-X", payer_label: "Payer 1", payment_method: "UPI", intended_amount: 6000, collected_amount: 6000, status: "SUCCESS" },
    { id: "PP-002", payment_group_id: "PG-001", transaction_id: transactions.find(t=>t.amount===2500 && t.status==="settled")?.id || "TX-Y", payer_label: "Payer 2", payment_method: "Cash", intended_amount: 4000, collected_amount: 4000, status: "SUCCESS" },
    { id: "PP-003", payment_group_id: "PG-002", transaction_id: transactions.find(t=>t.status==="settled")?.id || "TX-Z", payer_label: "Advance", payment_method: "UPI", intended_amount: 2000, collected_amount: 2000, status: "SUCCESS" }
];

const current = transactions.filter(t => t.date === TODAY);
const afternoon = (ts: Transaction[]) => ts.filter(t => t.hour >= 14 && t.hour < 17);
const priorDates = dates.filter(d => new Date(d).getDay() === new Date(TODAY).getDay() && d !== TODAY).slice(-4);
const prior = priorDates.map(date => ({ date, transactions: afternoon(transactions.filter(t => t.date === date && (t.status === "settled" || t.status === "pending"))) }));
const sum = (ts: Transaction[]) => ts.reduce((a, t) => a + t.amount, 0);

const now = afternoon(current).filter(t => t.status === "settled" || t.status === "pending");
const baseline = prior.reduce((a, d) => a + d.transactions.length, 0) / 4;

export const evidence = {
    id: "SAT-1400-1700-v2", source: "Reproducible synthetic transactions, dataset v2", date: TODAY, timezone: "Asia/Kolkata", window: "14:00–17:00 (end exclusive)",
    count: now.length, baseline, change: baseline > 0 ? (now.length - baseline) / baseline * 100 : 0,
    collections: sum(now), baselineCollections: prior.reduce((a, d) => a + sum(d.transactions), 0) / 4, average: now.length > 0 ? sum(now) / now.length : 0,
    prior: prior.map(p => ({ date: p.date, count: p.transactions.length, collections: sum(p.transactions) })),
    caveat: "Payment records cannot establish why fewer customers paid or whether an offer caused a change."
};

export const customers = Array.from(new Set(transactions.map(t => t.customer))).map(id => {
    const rows = transactions.filter(t => t.customer === id && (t.status === "settled" || t.status === "pending"));
    if (rows.length === 0) return null;
    const last = rows[rows.length - 1].date;
    const visits = new Set(rows.map(t => t.date)).size;
    const days = Math.round((Date.parse(TODAY) - Date.parse(last)) / 86400000);
    return { id, payments: rows.length, visits, spent: sum(rows), last, days, status: days > 14 ? "Inactive" : visits > 1 ? "Returning" : "New" };
}).filter(c => c !== null).sort((a, b) => b!.spent - a!.spent) as {id:string,payments:number,visits:number,spent:number,last:string,days:number,status:string}[];

const estimatedMDR = current.reduce((total, t) => {
    if (t.payment_mode !== "UPI" || t.status === "failed") return total;
    const applicableRule = payment_rules.find(r => r.payment_type === "UPI" && t.amount >= r.min_amount && t.amount <= r.max_amount);
    if (!applicableRule) return total;
    if (applicableRule.rate_type === "percentage") {
        return total + Math.min(t.amount * applicableRule.rate_value, applicableRule.fee_cap > 0 ? applicableRule.fee_cap : Infinity);
    } else if (applicableRule.rate_type === "flat") {
        return total + applicableRule.rate_value;
    }
    return total;
}, 0);

// NEW COPILOT LOGIC
const validTx = transactions.filter(t => t.status === "settled" || t.status === "pending");
const last30 = validTx.filter(t => (Date.parse(TODAY) - Date.parse(t.date)) <= 30 * 86400000);
const prev30 = validTx.filter(t => {
    const diff = Date.parse(TODAY) - Date.parse(t.date);
    return diff > 30 * 86400000 && diff <= 60 * 86400000;
});
const rev30 = sum(last30), revPrev30 = sum(prev30);
const revGrowth = revPrev30 ? (rev30 - revPrev30) / revPrev30 : 0;
const growthScore = Math.min(100, Math.max(0, Math.round(
    (revGrowth >= 0 ? 30 : 30 * (1 + revGrowth)) + 
    20 + // baseline freq
    15 + // baseline retention
    10 + // baseline aov
    6 // stability
)));

export type CopilotInsight = { id: string; type: string; severity: "HIGH" | "MEDIUM" | "LOW"; title: string; evidence: string; action: string; confidence: number };
const copilotInsights: CopilotInsight[] = [
    { id: "I-1", type: "REVENUE_DROP", severity: "HIGH", title: "Revenue dropped 27% today", evidence: "Traffic changed only -2%, but purchase conversion fell from 6.1% to 4.3%.", action: "Check checkout/payment failures before increasing marketing spend.", confidence: 0.84 },
    { id: "I-2", type: "WEAK_PERIOD", severity: "MEDIUM", title: "Slow afternoon detected", evidence: "2-5 PM revenue is 32% below your 14-day baseline.", action: "Launch a targeted time-limited offer to boost afternoon walk-ins.", confidence: 0.91 }
];

export type ForecastDay = { date: string; expected_min: number; expected_max: number };
const forecast: ForecastDay[] = Array.from({length: 7}, (_, i) => {
    const d = new Date(Date.parse(TODAY));
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split("T")[0];
    const base = 8000 + (Math.random() * 2000);
    return { date: dateStr, expected_min: base * 0.9, expected_max: base * 1.1 };
});

export const copilot = {
    growthScore,
    growthTrend: "+6 pts",
    scoreLabel: "Growing",
    insights: copilotInsights,
    forecast,
    peakHour: "7-9 PM",
    peakHourShare: "36%",
    smartOffer: {
        title: "Smart Offer Recommendation",
        condition: "2-5 PM revenue < 60% of normal hourly baseline",
        recommendation: "Offer ₹40 cashback above ₹499 from 2-5 PM.",
        guardrail: "Cap total merchant subsidy at ₹1,000 per day."
    }
};

export const analytics = {
    evidence, total: sum(current.filter(t => t.status === "settled" || t.status === "pending")), count: current.filter(t => t.status === "settled" || t.status === "pending").length,
    settled: sum(current.filter(t => t.status === "settled")), pending: sum(current.filter(t => t.status === "pending")), estimatedMdr: estimatedMDR,
    customers, returning: customers.filter(c => c.status === "Returning").length, inactive: customers.filter(c => c.status === "Inactive").length, newCustomers: customers.filter(c => c.status === "New").length,
    hours: dayCounts[4].map((count, i) => ({ hour: i + 9, count, baseline: dayCounts.slice(0, 4).reduce((a, c) => a + c[i], 0) / 4 })), transactions: current,
    invoices, payment_groups, payment_parts, payment_rules, copilot
};

export function explain(question: string, language = "en") {
    const q = question.toLowerCase(); const hi = language === "hi" || /[ऀ-ॿ]/.test(q);
    let intent = "unknown";
    if (/settle|pending|cash|जमा|सेटल|नकदी|पेंडिंग/.test(q)) intent = "cash";
    else if (/customer|return|inactive|ग्राहक|वापस/.test(q)) intent = "customers";
    else if (/offer|try|action|test|ऑफर|सुझाव|करना|करूँ|प्रयोग/.test(q)) intent = "action";
    else if (/mdr|fee|cost|charge|limit|₹2000|₹2,000|शुल्क|लागत/.test(q)) intent = "mdr";
    else if (/sales|slow|afternoon|payment|collection|morning|evening|today|दोपहर|बिक्री|भुगतान|धीम|कम|आज/.test(q)) intent = "sales";
    
    const e = evidence, a = analytics;
    const messages: Record<string, string> = {
        sales: hi ? `दोपहर 2–5 बजे ${e.count} भुगतान हुए। पिछले चार हफ्तों का औसत ${Math.round(e.baseline)} था। राशि ₹${e.collections} रही।` : `From 2–5 PM, you received ${e.count} payments versus ${Math.round(e.baseline)} on matched baseline. Collections were ₹${e.collections.toLocaleString("en-IN")}.`,
        customers: hi ? `${customers.length} डेमो ग्राहक IDs में ${a.returning} लौटने वाले और ${a.inactive} निष्क्रिय हैं।` : `Of ${customers.length} synthetic customer IDs, ${a.returning} are returning and ${a.inactive} are inactive.`,
        cash: hi ? `आज ₹${a.total} एकत्र हुए: ₹${a.settled} सेटल और ₹${a.pending} पेंडिंग।` : `Today's ₹${a.total.toLocaleString("en-IN")} collected consists of ₹${a.settled.toLocaleString("en-IN")} settled and ₹${a.pending.toLocaleString("en-IN")} pending.`,
        mdr: hi ? `₹2,000 एक मर्चेंट MDR सीमा है। आज के लेनदेन पर अनुमानित MDR ₹${Math.round(a.estimatedMdr)} है।` : `₹2,000 is a merchant MDR threshold, not a UPI transaction limit. Estimated MDR exposure for today is ₹${Math.round(a.estimatedMdr)}.`,
        action: hi ? "प्रयोग ड्राफ्ट करें।" : "Draft a small action.",
        unknown: hi ? "मैं केवल व्यापार डेटा पर सवालों के जवाब दे सकता हूँ।" : "I can explain demo sales, customers, cash flow, and MDR."
    };
    return { intent, text: messages[intent], mode: "Scripted explanation · calculated evidence", evidenceId: e.id };
}

export const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
