import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Administration",
  description: "Hotel administration tools will be implemented in a later milestone.",
  layout: "admin",
  links: [
    { label: "Manage hotels", href: "/admin/hotels/" },
    { label: "Manage rooms", href: "/admin/rooms/" },
    { label: "Manage bookings", href: "/admin/bookings/" },
  ],
});
