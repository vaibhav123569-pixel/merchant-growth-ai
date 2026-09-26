import { analytics, evidence, payment_parts, invoices } from "../lib/analytics";

function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error("Test Failed: " + msg);
}

function runTests() {
    // 1. MDR Calculation
    assert(analytics.estimatedMdr > 0, "MDR should be greater than 0");
    
    // 2. Baseline comparison
    assert(evidence.baseline === 40, "Baseline should be exactly 40 as per dayCounts for Saturdays");
    
    // 3. Payment-part reconciliation
    const paidInv = invoices.find(i => i.status === "PAID");
    assert(paidInv !== undefined, "Should have a PAID invoice");
    const group = analytics.payment_groups.find(g => g.invoice_id === paidInv!.id);
    const parts = payment_parts.filter(p => p.payment_group_id === group!.id);
    const partsTotal = parts.reduce((sum, p) => sum + p.collected_amount, 0);
    assert(partsTotal === group!.total_collected, "Parts total should equal group total collected");
    assert(group!.total_collected === paidInv!.total_amount, "Group total should equal invoice total");
    
    console.log("All analytics tests passed successfully.");
}

runTests();
