import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "My bookings",
  description: "Your booking history will appear here after guest accounts and reservations are implemented.",
  links: [
    { label: "Log in", href: "/login/" },
    { label: "Browse hotels", href: "/hotels/" },
  ],
});
