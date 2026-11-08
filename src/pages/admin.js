import "../main.js";
import { createAdminDashboard } from "../features/admin/admin-dashboard.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Administration",
  description: "Hotel operations overview.",
  layout: "admin",
  content: createAdminDashboard,
});
