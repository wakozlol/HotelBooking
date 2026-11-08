import "../main.js";
import { renderProtectedAdminPage } from "../utils/auth-guard.js";

void renderProtectedAdminPage({
  title: "Manage hotels",
  description: "Hotel administration will be implemented in a later milestone.",
  layout: "admin",
  links: [
    { label: "Edit example hotel", href: "/admin/hotel-edit/?id=example-hotel" },
    { label: "Admin home", href: "/admin/" },
  ],
});
