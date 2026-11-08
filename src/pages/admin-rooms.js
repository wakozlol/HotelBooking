import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage rooms",
  description:
    "Room types and physical room inventory are not available yet. This management area will be added with the room inventory database milestone.",
  layout: "admin",
  links: [
    { label: "Manage hotels", href: "/admin/hotels/" },
    { label: "Admin home", href: "/admin/" },
  ],
});
