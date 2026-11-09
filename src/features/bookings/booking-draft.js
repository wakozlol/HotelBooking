const key = "hotel-booking:pending-reservation";

export function saveBookingDraft(draft) {
  window.sessionStorage.setItem(key, JSON.stringify(draft));
}

export function readBookingDraft() {
  const value = window.sessionStorage.getItem(key);
  if (!value) return null;
  try {
    const draft = JSON.parse(value);
    if (
      typeof draft.hotelId !== "string" ||
      typeof draft.typeId !== "string" ||
      typeof draft.roomId !== "string" ||
      typeof draft.checkIn !== "string" ||
      typeof draft.checkOut !== "string" ||
      !Number.isInteger(draft.guests) ||
      !Number.isFinite(draft.nightlyRate) ||
      typeof draft.requestId !== "string"
    ) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearBookingDraft() {
  window.sessionStorage.removeItem(key);
}
