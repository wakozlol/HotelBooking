import { createPageContent } from "./PageContent.js";
import { signOutUser } from "../../services/auth-service.js";
import "./AdminLayout.css";

const adminLinks = [
  { label: "Overview", href: "/admin/" },
  { label: "Hotels", href: "/admin/hotels/" },
];

export function createAdminLayout(page) {
  const layout = document.createElement("div");
  layout.className = "admin-layout";

  const header = document.createElement("header");
  header.className = "admin-layout__header";

  const brand = document.createElement("a");
  brand.href = "/admin/";
  brand.className = "admin-layout__brand";
  const brandMark = document.createElement("span");
  brandMark.className = "admin-layout__brand-mark";
  brandMark.setAttribute("aria-hidden", "true");
  brandMark.textContent = "H";
  const brandCopy = document.createElement("span");
  brandCopy.textContent = "Hotel Booking";
  const brandLabel = document.createElement("small");
  brandLabel.textContent = "ADMIN STUDIO";
  brandCopy.append(brandLabel);
  brand.append(brandMark, brandCopy);

  const headerActions = document.createElement("div");
  headerActions.className = "admin-layout__header-actions";
  const publicLink = document.createElement("a");
  publicLink.href = "/";
  publicLink.className = "btn btn-outline-secondary btn-sm";
  publicLink.textContent = "View website";
  const logout = document.createElement("button");
  logout.className = "btn btn-outline-secondary btn-sm";
  logout.type = "button";
  logout.textContent = "Log out";
  const authStatus = document.createElement("span");
  authStatus.className = "visually-hidden";
  authStatus.setAttribute("role", "status");
  authStatus.setAttribute("aria-live", "polite");
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    logout.textContent = "Signing out...";
    try {
      await signOutUser();
      window.location.replace("/login/");
    } catch (error) {
      logout.disabled = false;
      logout.textContent = "Log out";
      authStatus.className = "admin-layout__auth-status";
      authStatus.textContent = error.message;
    }
  });
  headerActions.append(publicLink, logout, authStatus);
  header.append(brand, headerActions);

  const nav = document.createElement("nav");
  nav.className = "admin-layout__navigation";
  nav.setAttribute("aria-label", "Administration");

  const list = document.createElement("ul");
  list.className = "container nav admin-layout__nav";
  for (const item of adminLinks) {
    const listItem = document.createElement("li");
    listItem.className = "nav-item";

    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = item.href;
    link.textContent = item.label;
    const currentPath = window.location.pathname;
    if (
      currentPath === item.href ||
      (item.href !== "/admin/" && currentPath.startsWith(item.href))
    ) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
    listItem.append(link);
    list.append(listItem);
  }
  nav.append(list);

  const content =
    typeof page.content === "function"
      ? page.content()
      : createPageContent(page);
  layout.append(header, nav, content);
  return layout;
}
