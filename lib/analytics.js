"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.money = exports.analytics = exports.customers = exports.evidence = exports.payment_parts = exports.payment_groups = exports.invoices = exports.payment_rules = exports.transactions = exports.dates = exports.TODAY = void 0;
exports.explain = explain;
exports.TODAY = "2026-09-26";
exports.dates = ["2026-08-29", "2026-09-05", "2026-09-12", "2026-09-19", exports.TODAY];
var dayCounts = [[6, 8, 10, 12, 9, 13, 13, 12, 12, 15, 11, 7], [7, 9, 12, 13, 8, 14, 14, 14, 14, 16, 12, 8], [5, 8, 11, 12, 9, 13, 13, 13, 13, 14, 10, 7], [6, 9, 10, 12, 10, 14, 14, 13, 12, 15, 11, 6], [5, 8, 11, 12, 9, 10, 9, 8, 12, 14, 10, 6]];
exports.transactions = exports.dates.flatMap(function (date, day) { return dayCounts[day].flatMap(function (count, index) { return Array.from({ length: count }, function (_, n) {
    var amt = 100;
    // Add some variation for high value txns
    if (n % 5 === 0)
        amt = 2500;
    if (n % 11 === 0)
        amt = 5500;
    return {
        id: "TX-".concat(day + 1, "-").concat(index + 9, "-").concat(String(n + 1).padStart(2, "0")),
        date: date,
        hour: index + 9,
        minute: Math.floor(n * 60 / count),
        amount: amt,
        customer: "DEMO-".concat(String(day === 4 && n % 7 === 0 ? 81 + index : day < 2 && n % 6 === 0 ? 61 + index : 1 + (index * 3 + n) % 48).padStart(3, "0")),
        status: (day === 4 && ((index + n) % 4 === 0) ? "pending" : "settled"),
        payment_mode: n % 3 === 0 ? "Cash" : "UPI"
    };
}); }); });
exports.payment_rules = [
    { rule_id: "R-UPI-01", rule_name: "Merchant P2M up to ₹2,000", payment_type: "UPI", merchant_category: "ALL", min_amount: 0, max_amount: 2000, rate_type: "zero", rate_value: 0, fee_cap: 0, transaction_limit: 100000, effective_from: "2026-09-15", effective_to: "2099-12-31", source_name: "Ministry of Finance / PIB", source_url: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2310586&lang=2&reg=48", enabled: true },
    { rule_id: "R-UPI-02", rule_name: "Specified P2M above ₹2,000", payment_type: "UPI", merchant_category: "ALL", min_amount: 2001, max_amount: 99999999, rate_type: "percentage", rate_value: 0.004, fee_cap: 300, transaction_limit: 100000, effective_from: "2026-09-15", effective_to: "2099-12-31", source_name: "Ministry of Finance / PIB", source_url: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2310586&lang=2&reg=48", enabled: true }
];
exports.invoices = [
    { id: "INV-001", merchant_id: "M-001", invoice_number: "2609-001", total_amount: 10000, status: "PAID", created_at: exports.TODAY },
    { id: "INV-002", merchant_id: "M-001", invoice_number: "2609-002", total_amount: 10000, status: "PARTIAL", created_at: exports.TODAY }
];
exports.payment_groups = [
    { id: "PG-001", invoice_id: "INV-001", total_due: 10000, total_collected: 10000, outstanding_amount: 0, status: "PAID" },
    { id: "PG-002", invoice_id: "INV-002", total_due: 10000, total_collected: 2000, outstanding_amount: 8000, status: "PARTIAL" }
];
exports.payment_parts = [
    { id: "PP-001", payment_group_id: "PG-001", transaction_id: ((_a = exports.transactions.find(function (t) { return t.amount === 5500; })) === null || _a === void 0 ? void 0 : _a.id) || "TX-X", payer_label: "Payer 1", payment_method: "UPI", intended_amount: 6000, collected_amount: 6000, status: "SUCCESS" },
    { id: "PP-002", payment_group_id: "PG-001", transaction_id: ((_b = exports.transactions.find(function (t) { return t.amount === 2500; })) === null || _b === void 0 ? void 0 : _b.id) || "TX-Y", payer_label: "Payer 2", payment_method: "Cash", intended_amount: 4000, collected_amount: 4000, status: "SUCCESS" },
    { id: "PP-003", payment_group_id: "PG-002", transaction_id: exports.transactions[0].id, payer_label: "Advance", payment_method: "UPI", intended_amount: 2000, collected_amount: 2000, status: "SUCCESS" }
];
var current = exports.transactions.filter(function (t) { return t.date === exports.TODAY; });
var afternoon = function (ts) { return ts.filter(function (t) { return t.hour >= 14 && t.hour < 17; }); };
var prior = exports.dates.slice(0, 4).map(function (date) { return ({ date: date, transactions: afternoon(exports.transactions.filter(function (t) { return t.date === date; })) }); });
var sum = function (ts) { return ts.reduce(function (a, t) { return a + t.amount; }, 0); };
var now = afternoon(current), baseline = prior.reduce(function (a, d) { return a + d.transactions.length; }, 0) / 4;
exports.evidence = {
    id: "SAT-1400-1700-v1", source: "Reproducible synthetic transactions, dataset v1", date: exports.TODAY, timezone: "Asia/Kolkata", window: "14:00–17:00 (end exclusive)",
    count: now.length,
    baseline: baseline,
    change: (now.length - baseline) / baseline * 100,
    collections: sum(now), baselineCollections: prior.reduce(function (a, d) { return a + sum(d.transactions); }, 0) / 4, average: sum(now) / now.length,
    prior: prior.map(function (p) { return ({ date: p.date, count: p.transactions.length, collections: sum(p.transactions) }); }),
    caveat: "Four prior Saturdays are a short history. Payment records cannot establish why fewer customers paid or whether an offer caused a change."
};
exports.customers = Array.from(new Set(exports.transactions.map(function (t) { return t.customer; }))).map(function (id) {
    var rows = exports.transactions.filter(function (t) { return t.customer === id; });
    var last = rows[rows.length - 1].date;
    var visits = new Set(rows.map(function (t) { return t.date; })).size;
    var days = Math.round((Date.parse(exports.TODAY) - Date.parse(last)) / 86400000);
    return { id: id, payments: rows.length, visits: visits, spent: sum(rows), last: last, days: days, status: days > 14 ? "Inactive" : visits > 1 ? "Returning" : "New" };
}).sort(function (a, b) { return b.spent - a.spent; });
var estimatedMDR = current.reduce(function (total, t) {
    if (t.payment_mode !== "UPI")
        return total;
    var applicableRule = exports.payment_rules.find(function (r) { return r.payment_type === "UPI" && t.amount >= r.min_amount && t.amount <= r.max_amount; });
    if (!applicableRule)
        return total;
    if (applicableRule.rate_type === "percentage") {
        return total + Math.min(t.amount * applicableRule.rate_value, applicableRule.fee_cap > 0 ? applicableRule.fee_cap : Infinity);
    }
    else if (applicableRule.rate_type === "flat") {
        return total + applicableRule.rate_value;
    }
    return total;
}, 0);
exports.analytics = {
    evidence: exports.evidence,
    total: sum(current), count: current.length,
    settled: sum(current.filter(function (t) { return t.status === "settled"; })), pending: sum(current.filter(function (t) { return t.status === "pending"; })), estimatedMdr: estimatedMDR,
    customers: exports.customers,
    returning: exports.customers.filter(function (c) { return c.status === "Returning"; }).length, inactive: exports.customers.filter(function (c) { return c.status === "Inactive"; }).length, newCustomers: exports.customers.filter(function (c) { return c.status === "New"; }).length,
    hours: dayCounts[4].map(function (count, i) { return ({ hour: i + 9, count: count, baseline: dayCounts.slice(0, 4).reduce(function (a, c) { return a + c[i]; }, 0) / 4 }); }), transactions: current,
    invoices: exports.invoices,
    payment_groups: exports.payment_groups,
    payment_parts: exports.payment_parts,
    payment_rules: exports.payment_rules
};
function explain(question, language) {
    if (language === void 0) { language = "en"; }
    var q = question.toLowerCase();
    var hi = language === "hi" || /[\u0900-\u097f]/.test(q);
    var intent = "unknown";
    if (/settle|pending|cash|जमा|सेटल|नकदी|पेंडिंग/.test(q))
        intent = "cash";
    else if (/customer|return|inactive|ग्राहक|वापस/.test(q))
        intent = "customers";
    else if (/offer|try|action|test|ऑफर|सुझाव|करना|करूँ|प्रयोग/.test(q))
        intent = "action";
    else if (/mdr|fee|cost|charge|limit|₹2000|₹2,000|शुल्क|लागत/.test(q))
        intent = "mdr";
    else if (/sales|slow|afternoon|payment|collection|morning|evening|today|दोपहर|बिक्री|भुगतान|धीम|कम|आज/.test(q))
        intent = "sales";
    var e = exports.evidence, a = exports.analytics;
    var messages = {
        sales: hi ? "\u0926\u094B\u092A\u0939\u0930 2\u20135 \u092C\u091C\u0947 ".concat(e.count, " \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u0941\u090F\u0964 \u092A\u093F\u091B\u0932\u0947 \u091A\u093E\u0930 \u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u0914\u0938\u0924 ").concat(e.baseline, " \u0925\u093E: ").concat(Math.abs(e.change), "% \u0915\u0940 \u0915\u092E\u0940\u0964 \u0930\u093E\u0936\u093F \u20B9").concat(e.collections, " \u0930\u0939\u0940\u0964") : "From 2\u20135 PM, you received ".concat(e.count, " payments versus ").concat(e.baseline, " on matched Saturdays. Collections were \u20B9").concat(e.collections.toLocaleString("en-IN"), "."),
        customers: hi ? "".concat(exports.customers.length, " \u0921\u0947\u092E\u094B \u0917\u094D\u0930\u093E\u0939\u0915 IDs \u092E\u0947\u0902 ").concat(a.returning, " \u0932\u094C\u091F\u0928\u0947 \u0935\u093E\u0932\u0947 \u0914\u0930 ").concat(a.inactive, " \u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F \u0939\u0948\u0902\u0964") : "Of ".concat(exports.customers.length, " synthetic customer IDs, ").concat(a.returning, " are returning and ").concat(a.inactive, " are inactive."),
        cash: hi ? "\u0906\u091C \u20B9".concat(a.total, " \u090F\u0915\u0924\u094D\u0930 \u0939\u0941\u090F: \u20B9").concat(a.settled, " \u0938\u0947\u091F\u0932 \u0914\u0930 \u20B9").concat(a.pending, " \u092A\u0947\u0902\u0921\u093F\u0902\u0917\u0964") : "Today's \u20B9".concat(a.total.toLocaleString("en-IN"), " collected consists of \u20B9").concat(a.settled.toLocaleString("en-IN"), " settled and \u20B9").concat(a.pending.toLocaleString("en-IN"), " pending."),
        mdr: hi ? "\u20B92,000 \u090F\u0915 \u092E\u0930\u094D\u091A\u0947\u0902\u091F MDR \u0938\u0940\u092E\u093E \u0939\u0948\u0964 \u0906\u091C \u0915\u0947 \u0932\u0947\u0928\u0926\u0947\u0928 \u092A\u0930 \u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 MDR \u20B9".concat(Math.round(a.estimatedMdr), " \u0939\u0948\u0964") : "\u20B92,000 is a merchant MDR threshold, not a UPI transaction limit. Estimated MDR exposure for today is \u20B9".concat(Math.round(a.estimatedMdr), "."),
        action: hi ? "प्रयोग ड्राफ्ट करें।" : "Draft a small action.",
        unknown: hi ? "मैं केवल व्यापार डेटा पर सवालों के जवाब दे सकता हूँ।" : "I can explain demo sales, customers, cash flow, and MDR."
    };
    return { intent: intent, text: messages[intent], mode: "Scripted explanation · calculated evidence", evidenceId: e.id };
}
var money = function (n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n); };
exports.money = money;
