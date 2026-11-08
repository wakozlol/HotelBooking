import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage bookings",
  description: "Reservation administration will be implemented in a later milestone.",
  layout: "admin",
  links: [{ label: "Admin home", href: "/admin/" }],
});
