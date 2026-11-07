import "../main.js";
import { renderProtectedPlaceholder } from "../utils/auth-guard.js";

void renderProtectedPlaceholder({
  title: "My bookings",
  description: "Your booking history will be available here.",
});
