import { createPageContent } from "./PageContent.js";
import "./AuthLayout.css";

export function createAuthLayout(page) {
  const layout = document.createElement("div");
  layout.className = "auth-layout";

  const brand = document.createElement("a");
  brand.className = "auth-layout__brand";
  brand.href = "/";
  brand.textContent = "Hotel Booking";

  layout.append(brand, createPageContent(page));
  return layout;
}
