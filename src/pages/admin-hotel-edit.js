import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Edit hotel",
  description: "Hotel editing will be implemented in a later milestone.",
  layout: "admin",
  links: [{ label: "Back to hotels", href: "/admin/hotels/" }],
});
