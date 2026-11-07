import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Account",
  description: "Account settings will be implemented with guest authentication.",
  links: [
    { label: "Log in", href: "/login/" },
    { label: "My bookings", href: "/my-bookings/" },
  ],
});
