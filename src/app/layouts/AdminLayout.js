import { createPageContent } from "./PageContent.js";
import "./AdminLayout.css";

const adminLinks = [
  { label: "Overview", href: "/admin/" },
  { label: "Hotels", href: "/admin/hotels/" },
  { label: "Rooms", href: "/admin/rooms/" },
  { label: "Bookings", href: "/admin/bookings/" },
];

export function createAdminLayout(page) {
  const layout = document.createElement("div");
  layout.className = "admin-layout";

  const header = document.createElement("header");
  header.className = "admin-layout__header";

  const brand = document.createElement("a");
  brand.href = "/admin/";
  brand.className = "fw-semibold text-decoration-none";
  brand.textContent = "Hotel Booking Admin";

  const publicLink = document.createElement("a");
  publicLink.href = "/";
  publicLink.className = "btn btn-outline-secondary btn-sm";
  publicLink.textContent = "View website";
  header.append(brand, publicLink);

  const nav = document.createElement("nav");
  nav.className = "admin-layout__navigation";
  nav.setAttribute("aria-label", "Administration");

  const list = document.createElement("ul");
  list.className = "container nav gap-2 py-2";
  for (const item of adminLinks) {
    const listItem = document.createElement("li");
    listItem.className = "nav-item";

    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = item.href;
    link.textContent = item.label;
    listItem.append(link);
    list.append(listItem);
  }
  nav.append(list);

  layout.append(header, nav, createPageContent(page));
  return layout;
}
