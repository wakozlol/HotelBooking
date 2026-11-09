import { getSupabaseClient } from "../../services/supabase.js";

let bookingPending = false;

export class BookingOutcomeUnknownError extends Error {
  constructor() {
    super("We could not verify whether your booking succeeded. Contact the hotel before trying again.");
    this.name = "BookingOutcomeUnknownError";
  }
}

export async function listAvailableRooms(hotelId, stay) {
  const { data, error } = await getSupabaseClient().rpc("list_available_rooms", {
    requested_hotel_id: hotelId,
    requested_check_in: stay.checkIn,
    requested_check_out: stay.checkOut,
    requested_guest_count: stay.guests,
  });

  if (error) {
    throw new Error("Availability could not be checked. Please try again.");
  }
  if (!Array.isArray(data)) {
    throw new Error("Availability returned an unexpected response. Please try again.");
  }
  return data.map((room) => ({
    id: room.room_id,
    capacity: room.capacity,
    nightlyRate: Number(room.nightly_rate),
  }));
}

export async function bookRoom(room, stay) {
  const client = getSupabaseClient();
  if (bookingPending) {
    throw new Error("A booking is already being confirmed. Please wait.");
  }
  bookingPending = true;
  let result;
  try {
    result = await client.rpc("book_room", {
      requested_room_id: room.id,
      requested_check_in: stay.checkIn,
      requested_check_out: stay.checkOut,
      requested_guest_count: stay.guests,
      expected_nightly_rate: room.nightlyRate,
    }).single();
  } catch {
    throw new BookingOutcomeUnknownError();
  } finally {
    bookingPending = false;
  }
  const { data, error } = result;

  if (error) {
    if (error.code === "P0001") {
      throw new Error(`${error.message} Check availability again.`);
    }
    throw new BookingOutcomeUnknownError();
  }
  if (!data || data.status !== "confirmed" || !data.id) {
    throw new BookingOutcomeUnknownError();
  }
  return data;
}
