import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Manage hotels",
  description: "Hotel administration will be implemented in a later milestone.",
  layout: "admin",
  links: [
    { label: "Edit example hotel", href: "/admin/hotel-edit/?id=example-hotel" },
    { label: "Admin home", href: "/admin/" },
  ],
});
