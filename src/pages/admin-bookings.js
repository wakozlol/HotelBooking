import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage bookings",
  description:
    "Reservation management is not available yet. This management area will be added with the booking and availability database milestone.",
  layout: "admin",
  links: [{ label: "Admin home", href: "/admin/" }],
});
