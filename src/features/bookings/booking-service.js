import { getSupabaseClient } from "../../services/supabase.js";

export class BookingOutcomeUnknownError extends Error {
  constructor() {
    super("The booking result could not be verified. Retry this same request or check My bookings before making another booking.");
    this.name = "BookingOutcomeUnknownError";
  }
}

export async function listRoomOffers(hotelId, stay) {
  const { data, error } = await getSupabaseClient().rpc("list_room_offers", {
    requested_hotel_id: hotelId,
    requested_check_in: stay.checkIn,
    requested_check_out: stay.checkOut,
    requested_guest_count: stay.guests,
  });
  if (error || !Array.isArray(data)) {
    throw new Error("Availability could not be checked. Please try again.");
  }
  return data.map((item) => ({
    typeId: item.room_type_id,
    typeName: item.room_type_name,
    roomId: item.room_id,
    capacity: item.capacity,
    nightlyRate: item.nightly_rate === null ? null : Number(item.nightly_rate),
    availableCount: Number(item.available_count),
  }));
}

export async function confirmRoomBooking(draft) {
  let result;
  try {
    result = await getSupabaseClient().rpc("confirm_room_booking", {
      requested_room_id: draft.roomId,
      requested_room_type_id: draft.typeId,
      requested_check_in: draft.checkIn,
      requested_check_out: draft.checkOut,
      requested_guest_count: draft.guests,
      expected_nightly_rate: draft.nightlyRate,
      requested_request_id: draft.requestId,
    }).single();
  } catch {
    throw new BookingOutcomeUnknownError();
  }
  if (result.error) {
    if (result.error.code === "P0001") throw new Error(result.error.message);
    throw new BookingOutcomeUnknownError();
  }
  if (!result.data?.id || !["confirmed", "cancelled"].includes(result.data.status)) {
    throw new BookingOutcomeUnknownError();
  }
  return result.data;
}

export async function getMyReservations() {
  const { data, error } = await getSupabaseClient().rpc("my_reservations");
  if (error || !Array.isArray(data)) {
    throw new Error("Your reservations could not be loaded. Please try again.");
  }
  return data;
}

export async function cancelReservation(id) {
  const { data, error } = await getSupabaseClient()
    .rpc("cancel_my_reservation", { requested_reservation_id: id }).single();
  if (error) {
    if (error.code === "P0001") throw new Error(error.message);
    throw new Error("Cancellation could not be confirmed. Refresh your reservations before trying again.");
  }
  if (!data || data.status !== "cancelled") {
    throw new Error("Cancellation could not be confirmed. Refresh your reservations before trying again.");
  }
}
