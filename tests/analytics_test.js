"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var analytics_1 = require("../lib/analytics");
function assert(condition, msg) {
    if (!condition)
        throw new Error("Test Failed: " + msg);
}
function runTests() {
    // 1. MDR Calculation
    assert(analytics_1.analytics.estimatedMdr > 0, "MDR should be greater than 0");
    // 2. Baseline comparison
    assert(analytics_1.evidence.baseline === 40, "Baseline should be exactly 40 as per dayCounts for Saturdays");
    // 3. Payment-part reconciliation
    var paidInv = analytics_1.invoices.find(function (i) { return i.status === "PAID"; });
    assert(paidInv !== undefined, "Should have a PAID invoice");
    var group = analytics_1.analytics.payment_groups.find(function (g) { return g.invoice_id === paidInv.id; });
    var parts = analytics_1.payment_parts.filter(function (p) { return p.payment_group_id === group.id; });
    var partsTotal = parts.reduce(function (sum, p) { return sum + p.collected_amount; }, 0);
    assert(partsTotal === group.total_collected, "Parts total should equal group total collected");
    assert(group.total_collected === paidInv.total_amount, "Group total should equal invoice total");
    console.log("All analytics tests passed successfully.");
}
runTests();
