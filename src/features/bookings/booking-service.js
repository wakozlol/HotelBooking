import { getSupabaseClient } from "../../services/supabase.js";

export class BookingOutcomeUnknownError extends Error {
  constructor() {
    super("The booking result could not be verified. Retry this same request or check My bookings before making another booking.");
    this.name = "BookingOutcomeUnknownError";
  }
}

function reportAvailabilityFailure(operation, error, status) {
  console.error(`Booking: ${operation} failed`, {
    code: error?.code || "unknown",
    status,
  });
  if (error?.code === "42501" || status === 401 || status === 403) {
    return new Error("Availability access was denied. Please contact the hotel.");
  }
  if (error?.code === "P0001") {
    return new Error("Choose valid dates and a guest count from 1 to 100.");
  }
  return new Error("Availability could not be checked. Check your connection and try again.");
}

export async function listRoomOffers(hotelId, stay) {
  const client = getSupabaseClient();
  const { data, error, status } = await client.rpc("list_room_offers", {
    requested_hotel_id: hotelId,
    requested_check_in: stay.checkIn,
    requested_check_out: stay.checkOut,
    requested_guest_count: stay.guests,
  });
  if (error) {
    throw reportAvailabilityFailure("availability request", error, status);
  }
  if (!Array.isArray(data)) {
    throw reportAvailabilityFailure("availability response", null, status);
  }
  if (!data.length) {
    const hotel = await client.from("hotels").select("id")
      .eq("id", hotelId).eq("is_published", true).maybeSingle();
    if (hotel.error) {
      throw reportAvailabilityFailure("hotel lookup", hotel.error, hotel.status);
    }
    if (!hotel.data) {
      throw new Error("This hotel is no longer available. Please choose another hotel.");
    }
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
  } catch (error) {
    console.error("Booking: confirmation request failed before a result was received", error?.name);
    throw new BookingOutcomeUnknownError();
  }
  if (result.error) {
    console.error("Booking: confirmation failed", {
      code: result.error.code || "unknown",
      status: result.status,
    });
    if (result.error.code === "P0001") throw new Error(result.error.message);
    if (result.error.code === "42501" || result.status === 401 || result.status === 403) {
      throw new Error("Booking access was denied. Please sign in again or contact the hotel.");
    }
    throw new BookingOutcomeUnknownError();
  }
  if (!result.data?.id || !["confirmed", "cancelled"].includes(result.data.status)) {
    console.error("Booking: confirmation returned an unexpected response");
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
