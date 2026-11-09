import { getSupabaseConfigurationError } from "../../services/supabase.js";
import { saveBookingDraft } from "./booking-draft.js";
import { listRoomOffers } from "./booking-service.js";
import { isSampleRoomType, sampleBookingNotice } from "./sample-inventory.js";

const money = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

function field(id, label, type) {
  const wrapper = document.createElement("div");
  const title = document.createElement("label");
  title.className = "form-label fw-semibold";
  title.htmlFor = id;
  title.textContent = label;
  const input = document.createElement("input");
  input.id = id;
  input.type = type;
  input.required = true;
  input.className = "form-control";
  wrapper.append(title, input);
  return { wrapper, input };
}

function nextDay(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function createStayBooking(hotel, {
  live = false,
  findOffers = listRoomOffers,
  startBooking = (draft) => {
    saveBookingDraft(draft);
    window.location.assign("/booking/");
  },
  configurationError = getSupabaseConfigurationError,
} = {}) {
  const section = document.createElement("section");
  section.hidden = true;
  section.className = "hotel-stay-preview";
  section.setAttribute("aria-labelledby", "hotel-stay-booking-title");
  const title = document.createElement("h3");
  title.id = "hotel-stay-booking-title";
  title.className = "hotel-details__heading";
  title.textContent = "Choose your stay";
  const notice = document.createElement("p");
  notice.className = "hotel-details__notice";
  notice.textContent = live
    ? "Choose your dates and guests to check availability. Review the payment terms before confirming."
    : `${configurationError() ?? "Live hotel listings are unavailable."} Sample stays cannot be booked.`;
  const form = document.createElement("form");
  const fields = document.createElement("fieldset");
  fields.className = "hotel-stay-preview__fields";
  fields.disabled = !live;
  const checkIn = field("stay-check-in", "Check-in", "date");
  const checkOut = field("stay-check-out", "Check-out", "date");
  const guests = field("stay-guests", "Guests", "number");
  checkIn.input.max = "9999-12-30";
  checkOut.input.max = "9999-12-31";
  guests.input.min = "1";
  guests.input.max = "100";
  guests.input.step = "1";
  guests.input.value = "1";
  fields.append(checkIn.wrapper, checkOut.wrapper, guests.wrapper);
  const results = document.createElement("div");
  results.className = "hotel-booking-results";
  const status = document.createElement("p");
  status.className = "hotel-stay-preview__summary";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.append(fields, status, results);
  section.append(title, notice, form);
  let generation = 0;
  let timer;

  function updateDates() {
    const today = new Date().toISOString().slice(0, 10);
    checkIn.input.min = today;
    checkOut.input.min = nextDay(
      checkIn.input.validity.valid && checkIn.input.value ? checkIn.input.value : today,
    );
  }

  async function searchRooms() {
    const current = ++generation;
    results.replaceChildren();
    updateDates();
    if (!live || !form.checkValidity()) return;
    const stay = {
      checkIn: checkIn.input.value,
      checkOut: checkOut.input.value,
      guests: guests.input.valueAsNumber,
    };
    status.textContent = "Checking availability...";
    try {
      const offers = await findOffers(hotel.id, stay);
      if (current !== generation) return;
      if (!offers.length) {
        status.textContent = "No active room types are offered at this hotel.";
        return;
      }
      const nights = (Date.parse(`${stay.checkOut}T00:00:00Z`) - Date.parse(`${stay.checkIn}T00:00:00Z`)) / 86400000;
      status.textContent = offers.some((offer) => offer.availableCount > 0 && offer.roomId)
        ? "Choose an available room. Availability is rechecked on confirmation."
        : "No rooms are available for these dates and guests. Try different dates or guest numbers.";
      offers.forEach((offer) => {
        const card = document.createElement("div");
        card.className = "border rounded p-3 mb-2 bg-white";
        const name = document.createElement("strong");
        name.textContent = offer.typeName;
        const details = document.createElement("p");
        details.className = "mb-2";
        details.textContent = offer.nightlyRate === null
          ? "Unavailable — no active rooms."
          : `${offer.availableCount} available · up to ${offer.capacity} guests · ${money.format(offer.nightlyRate)} per night · ${money.format(offer.nightlyRate * nights)} total`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-success";
        button.textContent = offer.availableCount ? "Select room" : "Unavailable";
        button.disabled = !offer.availableCount || !offer.roomId;
        button.addEventListener("click", () => {
          try {
            startBooking({
              hotelId: hotel.id, typeId: offer.typeId, roomId: offer.roomId,
              nightlyRate: offer.nightlyRate, ...stay, requestId: crypto.randomUUID(),
            });
          } catch (error) {
            console.error("Booking: unable to save the room selection", error?.name);
            status.textContent = "Your booking selection could not be saved. Check your browser settings and try again.";
          }
        });
        card.append(name);
        if (isSampleRoomType(offer.typeName)) {
          const warning = document.createElement("p");
          warning.className = "text-danger fw-semibold mb-2";
          warning.textContent = sampleBookingNotice;
          card.append(warning);
        }
        card.append(details, button);
        results.append(card);
      });
    } catch (error) {
      if (current === generation) status.textContent = error.message;
    }
  }

  for (const input of [checkIn.input, checkOut.input, guests.input]) {
    input.addEventListener("input", () => {
      generation += 1;
      clearTimeout(timer);
      results.replaceChildren();
      status.textContent = "";
      updateDates();
      if (form.checkValidity()) {
        timer = setTimeout(() => void searchRooms(), 350);
      } else {
        status.textContent = "Choose valid dates and a guest count from 1 to 100.";
      }
    });
  }
  form.addEventListener("submit", (event) => event.preventDefault());
  updateDates();
  checkIn.input.value = checkIn.input.min;
  checkOut.input.value = checkOut.input.min;
  return {
    element: section,
    show() {
      if (!section.hidden) {
        if (live) checkIn.input.focus();
        return;
      }
      section.hidden = false;
      updateDates();
      if (live) {
        checkIn.input.focus();
        void searchRooms();
      }
    },
  };
}
