import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = { localStorage: storage, sessionStorage: storage };
const requests = [];
let body = null;
let status = 200;
let responses = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  requests.push({ url: String(input), ...options });
  const response = responses.shift() ?? { body, status };
  return new Response(JSON.stringify(response.body), { status: response.status, headers: { "Content-Type": "application/json" } });
};
const vite = await createServer({
  configFile: false, envFile: false, appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.invalid"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("test-key"),
  },
});
const service = await vite.ssrLoadModule("/src/features/bookings/booking-service.js");
const { getSupabaseClient } = await vite.ssrLoadModule("/src/services/supabase.js");
after(async () => {
  await getSupabaseClient().auth.stopAutoRefresh();
  await vite.close();
  globalThis.fetch = originalFetch;
  delete globalThis.window;
});

const draft = {
  hotelId: "hotel-1", typeId: "type-1", roomId: "room-1",
  checkIn: "2030-01-01", checkOut: "2030-01-03", guests: 2,
  nightlyRate: 120.5, requestId: "request-1",
};

test("sends the selected room, dates, rate and idempotency key to confirmation RPC", async () => {
  body = { id: "booking-1", status: "confirmed" };
  const reservation = await service.confirmRoomBooking(draft);
  assert.equal(reservation.id, "booking-1");
  assert.match(requests.at(-1).url, /rpc\/confirm_room_booking/);
  assert.deepEqual(JSON.parse(requests.at(-1).body), {
    requested_room_id: draft.roomId, requested_room_type_id: draft.typeId,
    requested_check_in: draft.checkIn, requested_check_out: draft.checkOut,
    requested_guest_count: draft.guests, expected_nightly_rate: draft.nightlyRate,
    requested_request_id: draft.requestId,
  });
});

test("surfaces an unavailable room without claiming success", async () => {
  status = 400;
  body = { code: "P0001", message: "Sorry, this room is no longer available. Please select another room." };
  await assert.rejects(service.confirmRoomBooking(draft), /Sorry, this room is no longer available/);
});

test("surfaces uncertain outcomes for safe idempotent retry", async () => {
  status = 500;
  body = { code: "unavailable", message: "temporary error" };
  await assert.rejects(service.confirmRoomBooking(draft), service.BookingOutcomeUnknownError);
});

test("requests only the signed-in guest's reservation RPC and cancellation", async () => {
  status = 200;
  body = [{ id: "booking-1", status: "confirmed" }];
  assert.equal((await service.getMyReservations())[0].id, "booking-1");
  assert.match(requests.at(-1).url, /rpc\/my_reservations/);
  body = { id: "booking-1", status: "cancelled" };
  await service.cancelReservation("booking-1");
  assert.deepEqual(JSON.parse(requests.at(-1).body), { requested_reservation_id: "booking-1" });
});

test("checks the published hotel before reporting an empty offer list", async () => {
  responses = [{ body: [], status: 200 }, { body: [{ id: "hotel-1" }], status: 200 }];
  assert.deepEqual(await service.listRoomOffers("hotel-1", draft), []);
  assert.match(requests.at(-1).url, /hotels\?/);
  assert.match(decodeURIComponent(requests.at(-1).url), /id=eq.hotel-1/);
  assert.match(decodeURIComponent(requests.at(-1).url), /is_published=eq.true/);
});

test("distinguishes a missing hotel from an empty room inventory", async () => {
  responses = [{ body: [], status: 200 }, { body: [], status: 200 }];
  await assert.rejects(service.listRoomOffers("missing", draft), /hotel is no longer available/);
});

test("reports availability permission errors without claiming there are no rooms", async () => {
  responses = [{ body: { code: "42501", message: "permission denied" }, status: 403 }];
  await assert.rejects(service.listRoomOffers("hotel-1", draft), /access was denied/);
});

test("reports invalid dates from the availability RPC", async () => {
  responses = [{ body: { code: "P0001", message: "invalid input" }, status: 400 }];
  await assert.rejects(service.listRoomOffers("hotel-1", draft), /valid dates/);
});

test("reports hotel lookup failures instead of claiming there are no rooms", async () => {
  responses = [{ body: [], status: 200 }, { body: { code: "42501", message: "permission denied" }, status: 403 }];
  await assert.rejects(service.listRoomOffers("hotel-1", draft), /access was denied/);
});

test("reports connection failures without claiming there are no rooms", async () => {
  responses = [{ body: { code: "", message: "connection failed" }, status: 503 }];
  await assert.rejects(service.listRoomOffers("hotel-1", draft), /Check your connection/);
});
