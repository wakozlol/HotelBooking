import "./Header.css";
import {
  signOutUser,
  subscribeToAuthChanges,
} from "../../services/auth-service.js";
import { isSupabaseConfigured } from "../../services/supabase.js";

const navigationItems = [
  { label: "Hotels", href: "/hotels/" },
  { label: "Admin", href: "/admin/" },
];

function createNavigationLink({ label, href }) {
  const item = document.createElement("li");
  item.className = "nav-item";

  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = href;
  link.textContent = label;
  item.append(link);
  return item;
}

export function createHeader() {
  const header = document.createElement("header");
  header.className = "site-header sticky-top";

  const nav = document.createElement("nav");
  nav.className = "navbar navbar-expand-lg container py-3";
  nav.setAttribute("aria-label", "Main navigation");

  const brand = document.createElement("a");
  brand.className = "navbar-brand site-brand";
  brand.href = "/";
  brand.setAttribute("aria-label", "Hotel Booking home");

  const brandMark = document.createElement("span");
  brandMark.className = "site-brand__mark";
  brandMark.setAttribute("aria-hidden", "true");
  brandMark.textContent = "H";

  const brandName = document.createElement("span");
  brandName.className = "site-brand__name";
  brandName.textContent = "Hotel";
  const brandAccent = document.createElement("span");
  brandAccent.className = "site-brand__accent";
  brandAccent.textContent = "Booking";
  brandName.append(" ", brandAccent);
  brand.append(brandMark, brandName);

  const toggle = document.createElement("button");
  toggle.className = "navbar-toggler site-nav-toggle";
  toggle.type = "button";
  toggle.setAttribute("data-bs-toggle", "collapse");
  toggle.setAttribute("data-bs-target", "#primary-navigation");
  toggle.setAttribute("aria-controls", "primary-navigation");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Toggle navigation");

  const toggleIcon = document.createElement("span");
  toggleIcon.className = "navbar-toggler-icon";
  toggle.append(toggleIcon);

  const collapse = document.createElement("div");
  collapse.id = "primary-navigation";
  collapse.className = "collapse navbar-collapse";

  const list = document.createElement("ul");
  list.className = "navbar-nav ms-auto align-items-lg-center gap-lg-1";
  navigationItems.forEach((item) => list.append(createNavigationLink(item)));

  const searchItem = document.createElement("li");
  searchItem.className = "nav-item";
  const searchLink = document.createElement("a");
  searchLink.className = "nav-link site-search-link";
  searchLink.href = "/hotels/";
  searchLink.textContent = "Search stays";
  searchItem.append(searchLink);
  list.append(searchItem);

  const authItem = document.createElement("li");
  authItem.className =
    "nav-item site-header__actions d-flex gap-2 px-lg-2 py-3 py-lg-0";

  const login = document.createElement("a");
  login.className = "btn btn-outline-light btn-sm site-login";
  login.href = "/login/";
  login.textContent = "Login";

  const register = document.createElement("a");
  register.className = "btn btn-warning btn-sm site-register";
  register.href = "/register/";
  register.textContent = "Register";

  const authStatus = document.createElement("span");
  authStatus.className = "visually-hidden";
  authStatus.setAttribute("role", "status");
  authStatus.setAttribute("aria-live", "polite");

  function createAccountMenu(user) {
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    const accountButton = document.createElement("button");
    accountButton.className =
      "btn btn-outline-light btn-sm dropdown-toggle site-account-toggle";
    accountButton.type = "button";
    accountButton.setAttribute("data-bs-toggle", "dropdown");
    accountButton.setAttribute("aria-expanded", "false");
    const metadataName = user.user_metadata?.first_name;
    const firstName =
      typeof metadataName === "string" ? metadataName.trim() : "";
    accountButton.textContent = firstName || "My account";

    const menu = document.createElement("ul");
    menu.className = "dropdown-menu dropdown-menu-end";
    for (const [label, href] of [
      ["My Account", "/account/"],
      ["My Bookings", "/my-bookings/"],
    ]) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "dropdown-item";
      link.href = href;
      link.textContent = label;
      item.append(link);
      menu.append(item);
    }

    const logoutItem = document.createElement("li");
    const logoutButton = document.createElement("button");
    logoutButton.className = "dropdown-item";
    logoutButton.type = "button";
    logoutButton.textContent = "Log out";
    logoutButton.addEventListener("click", () => {
      void signOutFromHeader(logoutButton);
    });
    logoutItem.append(logoutButton);
    menu.append(logoutItem);
    dropdown.append(accountButton, menu);
    return dropdown;
  }

  async function signOutFromHeader(button) {
    button.disabled = true;
    button.textContent = "Signing out...";
    try {
      await signOutUser();
      window.location.replace("/login/");
    } catch (error) {
      authStatus.className = "site-header__auth-status";
      authStatus.textContent = error.message;
      button.disabled = false;
      button.textContent = "Log out";
    }
  }

  function renderAuthActions(user) {
    authItem.replaceChildren(
      ...(user
        ? [createAccountMenu(user), authStatus]
        : [login, register, authStatus]),
    );
    authStatus.className = "visually-hidden";
    authStatus.textContent = "";
  }

  renderAuthActions(null);
  if (isSupabaseConfigured()) {
    try {
      const {
        data: { subscription },
      } = subscribeToAuthChanges((_event, session) => {
        renderAuthActions(session?.user ?? null);
      });
      window.addEventListener(
        "pagehide",
        () => subscription.unsubscribe(),
        { once: true },
      );
    } catch (error) {
      authStatus.className = "site-header__auth-status";
      authStatus.textContent =
        "Account status is unavailable. Use the account page to check your sign-in.";
    }
  }

  list.append(authItem);

  collapse.append(list);
  nav.append(brand, toggle, collapse);
  header.append(nav);
  return header;
}
