import assert from "node:assert/strict";
import {
  generateInvoiceToken,
  verifyInvoiceToken,
  checkRateLimit,
  requireAuth,
} from "../src/lib/security";

async function testSecurity() {
  console.log("▶ Testing Security Hardening & HMAC Token Validation...");

  // 1. Invoice HMAC Token Testing
  const bookingId = "test-booking-id-12345";
  const validToken = generateInvoiceToken(bookingId);

  assert.ok(validToken, "Valid token should be non-empty string");
  assert.equal(
    verifyInvoiceToken(bookingId, validToken),
    true,
    "Valid invoice token must verify successfully"
  );

  // Tampered token test (should fail safely)
  const tamperedToken = validToken.slice(0, -4) + "abcd";
  assert.equal(
    verifyInvoiceToken(bookingId, tamperedToken),
    false,
    "Tampered invoice token must be rejected"
  );

  // Different booking ID test
  assert.equal(
    verifyInvoiceToken("other-booking-id", validToken),
    false,
    "Token for another booking must be rejected"
  );

  // 2. Sliding Window Rate Limiter Testing
  const rateLimitKey = `test-ip-${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(rateLimitKey, 5, 10);
    assert.equal(res.allowed, true, `Request ${i + 1} within limit should be allowed`);
  }

  // 6th request should be blocked
  const blockedRes = checkRateLimit(rateLimitKey, 5, 10);
  assert.equal(blockedRes.allowed, false, "Request exceeding limit should be blocked");
  assert.equal(blockedRes.remaining, 0, "Remaining requests should be 0");

  // 3. RBAC Enforcement Testing
  const nullSession = requireAuth(null, ["SUPER_ADMIN"]);
  assert.ok(nullSession.errorResponse, "Null session must return errorResponse");

  const receptionSession: any = {
    userId: "usr-1",
    name: "Receptionist",
    email: "rep@rajhans.com",
    role: "RECEPTION",
  };

  const allowedReception = requireAuth(receptionSession, ["RECEPTION", "MANAGER"]);
  assert.ok(allowedReception.session, "Authorized role must return session");

  const forbiddenReception = requireAuth(receptionSession, ["SUPER_ADMIN"]);
  assert.ok(forbiddenReception.errorResponse, "Unauthorized role must return errorResponse");

  const superAdminSession: any = {
    userId: "usr-admin",
    name: "Super Admin",
    email: "admin@rajhans.com",
    role: "SUPER_ADMIN",
  };
  const adminBypass = requireAuth(superAdminSession, ["MAINTENANCE"]);
  assert.ok(adminBypass.session, "SUPER_ADMIN must have access to all modules");

  console.log("✔ Security & RBAC: ALL VERIFICATION GATES PASSED");
}

testSecurity()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Security Test Failed:", err);
    process.exit(1);
  });
