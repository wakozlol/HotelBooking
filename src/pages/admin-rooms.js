import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage rooms",
  description: "Room administration will be implemented in a later milestone.",
  layout: "admin",
  links: [
    { label: "Manage hotels", href: "/admin/hotels/" },
    { label: "Admin home", href: "/admin/" },
  ],
});
