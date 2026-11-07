import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Booking details",
  description: "Details for the selected booking will appear here.",
  links: [{ label: "Back to my bookings", href: "/my-bookings/" }],
});
