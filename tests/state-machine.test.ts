import assert from "node:assert/strict";
import { isValidTransition } from "../src/lib/booking-state";
import { BookingStatus } from "@prisma/client";

async function testBookingStateMachine() {
  console.log("▶ Testing Reservation Finite State Machine (FSM)...");

  // 1. Valid Transitions
  assert.equal(
    isValidTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED),
    true,
    "PENDING -> CONFIRMED must be valid"
  );
  assert.equal(
    isValidTransition(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN),
    true,
    "CONFIRMED -> CHECKED_IN must be valid"
  );
  assert.equal(
    isValidTransition(BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT),
    true,
    "CHECKED_IN -> CHECKED_OUT must be valid"
  );
  assert.equal(
    isValidTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED),
    true,
    "CONFIRMED -> CANCELLED must be valid"
  );
  assert.equal(
    isValidTransition(BookingStatus.CONFIRMED, BookingStatus.NO_SHOW),
    true,
    "CONFIRMED -> NO_SHOW must be valid"
  );
  assert.equal(
    isValidTransition(BookingStatus.CANCELLED, BookingStatus.REFUNDED),
    true,
    "CANCELLED -> REFUNDED must be valid"
  );

  // 2. Invalid / Illegal Transitions
  assert.equal(
    isValidTransition(BookingStatus.CHECKED_OUT, BookingStatus.CHECKED_IN),
    false,
    "CHECKED_OUT -> CHECKED_IN must be rejected (terminal)"
  );
  assert.equal(
    isValidTransition(BookingStatus.CANCELLED, BookingStatus.CHECKED_IN),
    false,
    "CANCELLED -> CHECKED_IN must be rejected"
  );
  assert.equal(
    isValidTransition(BookingStatus.PENDING, BookingStatus.CHECKED_IN),
    false,
    "PENDING -> CHECKED_IN must be rejected (must be confirmed first)"
  );
  assert.equal(
    isValidTransition(BookingStatus.REFUNDED, BookingStatus.CONFIRMED),
    false,
    "REFUNDED -> CONFIRMED must be rejected (terminal)"
  );

  console.log("✔ Booking State Machine: ALL TRANSITION RULES VALIDATED");
}

testBookingStateMachine()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ State Machine Test Failed:", err);
    process.exit(1);
  });
