import "../main.js";
import { renderPage } from "../app/App.js";
import { requireAuthenticatedUser } from "../utils/auth-guard.js";
import { cancelReservation, getMyReservations } from "../features/bookings/booking-service.js";
import { reservationDetails } from "../features/bookings/reservation-ui.js";

async function initialize() {
  renderPage({ title: "My bookings", description: "Loading your reservations..." });
  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;
    const reservations = await getMyReservations();
    const selected = new URLSearchParams(window.location.search).get("id");
    const filtered = selected ? reservations.filter((item) => item.id === selected) : reservations;
    renderPage({
      title: selected ? "Reservation details" : "My bookings",
      description: selected
        ? "Your reservation details are shown below."
        : "Review your reservations and cancellation eligibility.",
      links: selected ? [{ label: "All bookings", href: "/my-bookings/" }] : [],
    });
    const main = document.querySelector("#main-content");
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "mt-4";
      empty.textContent = selected ? "Reservation not found." : "You have no reservations yet.";
      main.append(empty);
      return;
    }
    for (const reservation of filtered) {
      const card = document.createElement("section");
      card.className = "card p-4 mt-4";
      card.setAttribute("aria-label", `Reservation ${reservation.id}`);
      const heading = document.createElement("h2");
      heading.className = "h4";
      heading.textContent = selected && reservation.status === "confirmed"
        ? "Booking confirmed"
        : reservation.hotel_name;
      card.append(heading, reservationDetails(reservation));
      const status = document.createElement("p");
      status.className = "mt-3";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      card.append(status);
      if (reservation.can_cancel) {
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "btn btn-outline-danger align-self-start";
        cancel.textContent = "Cancel reservation";
        cancel.addEventListener("click", async () => {
          if (!window.confirm("Cancel this reservation?")) return;
          cancel.disabled = true;
          status.textContent = "Cancelling...";
          try {
            await cancelReservation(reservation.id);
            await initialize();
          } catch (error) {
            status.textContent = error.message;
            cancel.disabled = false;
          }
        });
        card.append(cancel);
      } else if (reservation.status === "confirmed") {
        status.textContent = "Cancellation closes 24 hours before the check-in date begins (UTC).";
      }
      if (!selected) {
        const link = document.createElement("a");
        link.className = "mt-3";
        link.href = `/my-bookings/?id=${encodeURIComponent(reservation.id)}`;
        link.textContent = "View reservation details";
        card.append(link);
      }
      main.append(card);
    }
  } catch (error) {
    renderPage({ title: "My bookings", description: error.message, links: [{ label: "Go to log in", href: "/login/" }] });
  }
}

void initialize();
