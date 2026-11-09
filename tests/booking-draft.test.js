import assert from "node:assert/strict";
import { test } from "node:test";
import { clearBookingDraft, readBookingDraft, saveBookingDraft } from "../src/features/bookings/booking-draft.js";

test("preserves booking details through a navigation and clears them after confirmation", () => {
  const storage = new Map();
  globalThis.window = {
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  };
  const draft = { hotelId: "hotel", typeId: "type", roomId: "room", checkIn: "2030-01-01", checkOut: "2030-01-03", guests: 2, nightlyRate: 120, requestId: "request" };
  saveBookingDraft(draft);
  assert.deepEqual(readBookingDraft(), draft);
  clearBookingDraft();
  assert.equal(readBookingDraft(), null);
  delete globalThis.window;
});
