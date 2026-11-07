import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Booking",
  description: "Booking details and confirmation will be implemented in a later milestone.",
  links: [
    { label: "Log in", href: "/login/" },
    { label: "Browse hotels", href: "/hotels/" },
  ],
});
