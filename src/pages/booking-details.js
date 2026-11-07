import "../main.js";
import { renderProtectedPlaceholder } from "../utils/auth-guard.js";

void renderProtectedPlaceholder({
  title: "Booking details",
  description: "Details for the selected booking will appear here.",
});
