import "../main.js";
import { renderPage } from "../app/App.js";
import { requireAuthenticatedUser } from "../utils/auth-guard.js";
import { getHotelListings } from "../features/hotels/hotel-service.js";
import { readBookingDraft, clearBookingDraft } from "../features/bookings/booking-draft.js";
import { confirmRoomBooking, getMyReservations, listRoomOffers } from "../features/bookings/booking-service.js";
import { detailsList, money, nightsBetween } from "../features/bookings/reservation-ui.js";
import { isSampleRoomType, sampleBookingNotice } from "../features/bookings/sample-inventory.js";

renderPage({ title: "Review your booking", description: "Checking your sign-in and booking details..." });

async function initialize() {
  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;
    const draft = readBookingDraft();
    if (!draft) throw new Error("No booking selection was found. Choose a room from a hotel first.");
    const reservations = await getMyReservations();
    const existing = reservations.find((item) => item.booking_request_id === draft.requestId);
    if (existing) {
      clearBookingDraft();
      window.location.replace(`/my-bookings/?id=${encodeURIComponent(existing.id)}`);
      return;
    }
    const [hotels, offers] = await Promise.all([
      getHotelListings(),
      listRoomOffers(draft.hotelId, draft),
    ]);
    const hotel = hotels.find((item) => item.id === draft.hotelId);
    const offer = offers.find((item) => item.typeId === draft.typeId);
    if (!hotel) {
      throw new Error("This hotel is no longer available. Please choose another hotel.");
    }
    if (!offer) {
      throw new Error("Sorry, this room is no longer available. Please select another room.");
    }

    const sample = isSampleRoomType(offer.typeName);
    renderPage({
      title: "Review your booking",
      description: sample
        ? sampleBookingNotice
        : "Availability and price for your selected room are checked when you confirm. Payment is made at the hotel.",
      links: [{ label: "Choose another room", href: "/hotels/" }],
    });
    const main = document.querySelector("#main-content");
    const card = document.createElement("section");
    card.className = "card p-4 mt-4";
    card.append(detailsList([
      ["Hotel", hotel.name], ["Room type", offer.typeName],
      ["Room", "Assigned on confirmation"], ["Check-in", draft.checkIn],
      ["Check-out", draft.checkOut], ["Guests", draft.guests],
      ["Nights", nightsBetween(draft.checkIn, draft.checkOut)],
      ["Price per night", money.format(draft.nightlyRate)],
      ["Total", money.format(draft.nightlyRate * nightsBetween(draft.checkIn, draft.checkOut))],
      ["Payment", sample ? "Test only - no payment" : "Pay at the hotel"],
    ]));
    const status = document.createElement("p");
    status.className = "mt-3";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const button = document.createElement("button");
    button.className = "btn btn-success align-self-start";
    button.type = "button";
    button.textContent = "Confirm reservation";
    button.addEventListener("click", async () => {
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = "Confirming...";
      try {
        const reservation = await confirmRoomBooking(draft);
        clearBookingDraft();
        window.location.assign(`/my-bookings/?id=${encodeURIComponent(reservation.id)}`);
      } catch (error) {
        status.textContent = error.message;
        button.disabled = false;
        button.textContent = "Confirm reservation";
      }
    });
    card.append(status, button);
    main.append(card);
  } catch (error) {
    renderPage({
      title: "Unable to review booking",
      description: error.message,
      links: [{ label: "Browse hotels", href: "/hotels/" }],
    });
  }
}

void initialize();
