const samplePrefix = "SAMPLE TEST ONLY - NO HOTEL STAY - ";

export function isSampleRoomType(name) {
  return typeof name === "string" && name.startsWith(samplePrefix);
}

export const sampleBookingNotice =
  "Development test only: this is not a real hotel stay. Do not travel or pay for this reservation.";
