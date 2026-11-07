import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Manage bookings",
  description: "Reservation administration will be implemented in a later milestone.",
  layout: "admin",
  links: [{ label: "Admin home", href: "/admin/" }],
});
