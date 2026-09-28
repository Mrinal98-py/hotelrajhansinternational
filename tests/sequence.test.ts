import assert from "node:assert/strict";
import { generateSafeBookingReference } from "../src/lib/sequence";

async function testSequenceConcurrency() {
  console.log("▶ Testing Concurrency-Safe Sequence Reference Generator (50 parallel invocations)...");

  const startTime = Date.now();
  const promises: Promise<string>[] = [];

  for (let i = 0; i < 50; i++) {
    promises.push(generateSafeBookingReference());
  }

  const results = await Promise.all(promises);
  const elapsed = Date.now() - startTime;

  console.log(`Generated ${results.length} references in ${elapsed}ms. Sample: ${results[0]}`);

  // 1. Verify pattern HRJ-YYYYMMDD-XXXX
  const pattern = /^HRJ-\d{8}-\d{4}$/;
  for (const ref of results) {
    assert.match(ref, pattern, `Reference ${ref} must match HRJ-YYYYMMDD-XXXX format`);
  }

  // 2. Verify complete uniqueness under concurrency (Set size == 50)
  const uniqueSet = new Set(results);
  assert.equal(
    uniqueSet.size,
    results.length,
    `CRITICAL CONCURRENCY CHECK: Expected ${results.length} unique references, got ${uniqueSet.size}. Duplicate generated!`
  );

  console.log("✔ Concurrency-Safe Sequence: ZERO DUPLICATES (100% COLLISION-FREE)");
}

testSequenceConcurrency()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Sequence Test Failed:", err);
    process.exit(1);
  });
