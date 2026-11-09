import assert from "node:assert/strict";
import { test } from "node:test";
import { isSampleRoomType, sampleBookingNotice } from "../src/features/bookings/sample-inventory.js";
import { reservationDetails } from "../src/features/bookings/reservation-ui.js";

test("recognizes explicitly marked sample room types only", () => {
  assert.equal(isSampleRoomType("SAMPLE TEST ONLY - NO HOTEL STAY - Double"), true);
  assert.equal(isSampleRoomType("Double"), false);
  assert.equal(isSampleRoomType(null), false);
  assert.match(sampleBookingNotice, /not a real hotel stay/i);
});

test("sample reservations do not request hotel payment", () => {
  globalThis.document = {
    createElement() {
      return { children: [], append(...items) { this.children.push(...items); } };
    },
  };
  try {
    const reservation = {
      id: "test", hotel_name: "Hotel", room_type_name: "SAMPLE TEST ONLY - NO HOTEL STAY - Double",
      room_number: "SAMPLE-101", check_in: "2030-01-01", check_out: "2030-01-02",
      guest_count: 2, nightly_rate: 120, total_eur: 120, status: "confirmed",
    };
    const details = reservationDetails(reservation);
    assert.ok(details.children.some((item) => item.textContent === "Test only - no payment"));
    reservation.room_type_name = "Double";
    assert.ok(reservationDetails(reservation).children.some((item) => item.textContent === "Pay at the hotel"));
  } finally {
    delete globalThis.document;
  }
});
