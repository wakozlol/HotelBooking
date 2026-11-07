import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Manage rooms",
  description: "Room administration will be implemented in a later milestone.",
  links: [
    { label: "Manage hotels", href: "/admin/hotels/" },
    { label: "Admin home", href: "/admin/" },
  ],
});
