import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Booking confirmation",
  description: "Booking confirmation details will appear here when booking is implemented.",
  links: [
    { label: "View example booking details", href: "/booking-details/?id=example-booking" },
    { label: "My bookings", href: "/my-bookings/" },
  ],
});
