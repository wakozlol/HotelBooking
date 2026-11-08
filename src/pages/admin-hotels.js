import "../main.js";
import { createAdminHotelManagementPage } from "../features/hotels/hotel-showcase.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage hotels",
  description: "Manage hotel property profiles.",
  layout: "admin",
  content: createAdminHotelManagementPage,
});
