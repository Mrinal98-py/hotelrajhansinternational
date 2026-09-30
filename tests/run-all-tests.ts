import { execSync } from "node:child_process";

const testSuites = [
  { name: "Tariff & Pricing Engine Unit Tests", file: "tests/pricing.test.ts" },
  { name: "Concurrency Sequence Generator Tests", file: "tests/sequence.test.ts" },
  { name: "Dynamic Folio & Split Payment Ledger Tests", file: "tests/folio.test.ts" },
  { name: "Reservation Finite State Machine (FSM) Tests", file: "tests/state-machine.test.ts" },
  { name: "Security, RBAC, HMAC & Rate Limit Tests", file: "tests/security.test.ts" },
  { name: "Physical Room Inventory Calendar & Date Blocks Tests", file: "tests/room-inventory.test.ts" },
  { name: "Payment Confirmation & Booking Pipeline Tests", file: "tests/payment-confirm.test.ts" },
  { name: "End-to-End Hotel Guest & Operational Lifecycle Test", file: "tests/end-to-end-lifecycle.test.ts" },
  { name: "Physical Room Double-Booking Concurrency Stress Tests", file: "tests/concurrency.test.ts" },
  { name: "Canonical SEO Tags & Indexability Suite", file: "tests/seo-canonical.test.ts" },
];

console.log("================================================================================");
console.log("🏨 HOTEL RAJHANS INTERNATIONAL — AUTOMATED PRODUCTION TEST SUITE");
console.log("================================================================================\n");

let passedCount = 0;
const results: { name: string; status: "PASSED" | "FAILED"; durationMs: number }[] = [];

for (const suite of testSuites) {
  console.log(`\n================================================================================`);
  console.log(`RUNNING: ${suite.name} (${suite.file})`);
  console.log(`================================================================================`);

  const startTime = Date.now();
  try {
    execSync(`npx tsx ${suite.file}`, { stdio: "inherit" });
    const durationMs = Date.now() - startTime;
    passedCount++;
    results.push({ name: suite.name, status: "PASSED", durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    results.push({ name: suite.name, status: "FAILED", durationMs });
    console.error(`FAILED: ${suite.name}`);
  }
}

console.log("\n================================================================================");
console.log("TEST EXECUTION SUMMARY");
console.log("================================================================================");
for (const r of results) {
  const icon = r.status === "PASSED" ? "✔" : "❌";
  console.log(`${icon} [${r.status}] ${r.name} (${r.durationMs}ms)`);
}

console.log("================================================================================");
console.log(`Total: ${testSuites.length} | Passed: ${passedCount} | Failed: ${testSuites.length - passedCount}`);
console.log("================================================================================\n");

if (passedCount !== testSuites.length) {
  process.exit(1);
} else {
  process.exit(0);
}
