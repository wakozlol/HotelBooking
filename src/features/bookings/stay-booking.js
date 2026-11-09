import { getAuthenticatedUser } from "../../services/auth-service.js";
import { getSupabaseConfigurationError } from "../../services/supabase.js";
import {
  BookingOutcomeUnknownError,
  bookRoom,
  listAvailableRooms,
} from "./booking-service.js";

const money = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

function nextDateValue(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function createField(id, label, type) {
  const wrapper = document.createElement("div");
  const labelElement = document.createElement("label");
  labelElement.className = "form-label fw-semibold";
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  const input = document.createElement("input");
  input.className = "form-control";
  input.id = id;
  input.type = type;
  input.required = true;
  wrapper.append(labelElement, input);
  return { wrapper, input };
}

export function createStayBooking(hotel, {
  live = false,
  findRooms = listAvailableRooms,
  reserveRoom = bookRoom,
  getUser = getAuthenticatedUser,
  configurationError = getSupabaseConfigurationError,
} = {}) {
  const section = document.createElement("section");
  section.className = "hotel-stay-preview";
  section.hidden = true;
  section.setAttribute("aria-labelledby", "hotel-stay-booking-title");

  const heading = document.createElement("h3");
  heading.className = "hotel-details__heading";
  heading.id = "hotel-stay-booking-title";
  heading.textContent = "Choose your stay";
  const notice = document.createElement("p");
  notice.className = "hotel-details__notice";
  notice.textContent = live
    ? "Choose your dates and guests to check room availability. Pay at the hotel."
    : `${configurationError() ?? "Live hotel listings are unavailable."} Sample stays cannot be booked.`;

  const form = document.createElement("form");
  const fields = document.createElement("fieldset");
  fields.className = "hotel-stay-preview__fields";
  fields.disabled = !live;
  const checkIn = createField("stay-check-in", "Check-in", "date");
  const checkOut = createField("stay-check-out", "Check-out", "date");
  const guests = createField("stay-guests", "Guests", "number");
  checkIn.input.max = "9999-12-30";
  checkOut.input.max = "9999-12-31";
  guests.input.min = "1";
  guests.input.max = "100";
  guests.input.step = "1";
  guests.input.value = "1";
  const search = document.createElement("button");
  search.className = "btn btn-outline-success";
  search.type = "submit";
  search.textContent = "Check availability";
  fields.append(checkIn.wrapper, checkOut.wrapper, guests.wrapper, search);

  const results = document.createElement("div");
  results.hidden = true;
  results.className = "hotel-booking-results";
  const label = document.createElement("label");
  label.className = "form-label fw-semibold";
  label.htmlFor = "stay-room";
  label.textContent = "Available rooms";
  const select = document.createElement("select");
  select.className = "form-select";
  select.id = "stay-room";
  const confirm = document.createElement("button");
  confirm.className = "btn btn-success mt-3";
  confirm.type = "button";
  confirm.textContent = "Confirm booking";
  const signIn = document.createElement("a");
  signIn.href = "/login/";
  signIn.textContent = "Sign in";
  signIn.hidden = true;
  signIn.className = "mt-2";
  results.append(label, select, confirm, signIn);

  const status = document.createElement("p");
  status.className = "hotel-stay-preview__summary";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.append(fields, results, status);
  section.append(heading, notice, form);

  let rooms = [];
  let searchedStay;
  let confirmed = false;
  let pending = false;

  function updateDates() {
    const today = new Date().toISOString().slice(0, 10);
    checkIn.input.min = today;
    checkOut.input.min = nextDateValue(
      checkIn.input.validity.valid && checkIn.input.value
        ? checkIn.input.value
        : today,
    );
  }

  function clearResults() {
    rooms = [];
    searchedStay = undefined;
    results.hidden = true;
    signIn.hidden = true;
    select.replaceChildren();
  }

  for (const input of [checkIn.input, checkOut.input, guests.input]) {
    input.addEventListener("input", () => {
      updateDates();
      clearResults();
      status.textContent = "";
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!live || pending || confirmed) return;
    updateDates();
    if (!form.reportValidity()) return;
    const stay = {
      checkIn: checkIn.input.value,
      checkOut: checkOut.input.value,
      guests: guests.input.valueAsNumber,
    };
    if (!Number.isSafeInteger(stay.guests)) {
      status.textContent = "Enter a whole number of guests from 1 to 100.";
      return;
    }

    clearResults();
    pending = true;
    fields.disabled = true;
    status.textContent = "Checking availability...";
    try {
      rooms = await findRooms(hotel.id, stay);
      if (rooms.length === 0) {
        status.textContent = "No rooms are available for these dates and guests.";
        return;
      }
      searchedStay = stay;
      const nights =
        (Date.parse(`${stay.checkOut}T00:00:00Z`) -
          Date.parse(`${stay.checkIn}T00:00:00Z`)) / 86400000;
      rooms.forEach((room, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `Room ${index + 1} · up to ${room.capacity} guests · ${money.format(room.nightlyRate)} per night · ${money.format(room.nightlyRate * nights)} total`;
        select.append(option);
      });
      results.hidden = false;
      status.textContent = "Select a room. Availability is confirmed when you book.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      pending = false;
      fields.disabled = false;
    }
  });

  confirm.addEventListener("click", async () => {
    if (pending || confirmed || !searchedStay) return;
    const room = rooms[Number(select.value)];
    if (!room) {
      status.textContent = "Select an available room.";
      return;
    }
    pending = true;
    fields.disabled = true;
    select.disabled = true;
    confirm.disabled = true;
    signIn.hidden = true;
    status.textContent = "Checking your sign-in...";
    try {
      const user = await getUser();
      if (!user) {
        status.textContent = "Sign in to book. After signing in, return to this hotel and check availability again.";
        signIn.hidden = false;
        return;
      }
      status.textContent = "Confirming your booking...";
      const reservation = await reserveRoom(room, searchedStay);
      confirmed = true;
      status.textContent = `Booking confirmed. Reference: ${reservation.id}. Total: ${money.format(Number(reservation.total_eur))}. Pay at the hotel.`;
      results.hidden = true;
    } catch (error) {
      status.textContent = error.message;
      if (error instanceof BookingOutcomeUnknownError) {
        confirmed = true;
        results.hidden = true;
      }
    } finally {
      pending = false;
      fields.disabled = confirmed;
      select.disabled = false;
      confirm.disabled = confirmed;
    }
  });

  updateDates();
  return {
    element: section,
    show() {
      updateDates();
      section.hidden = false;
      if (live) checkIn.input.focus();
    },
  };
}
