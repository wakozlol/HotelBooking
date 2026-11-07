import "./Header.css";

const navigationItems = [
  { label: "Hotels", href: "/hotels/" },
  { label: "My bookings", href: "/my-bookings/" },
  { label: "Account", href: "/account/" },
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
  login.textContent = "Log in";

  const register = document.createElement("a");
  register.className = "btn btn-warning btn-sm site-register";
  register.href = "/register/";
  register.textContent = "Register";
  authItem.append(login, register);
  list.append(authItem);

  collapse.append(list);
  nav.append(brand, toggle, collapse);
  header.append(nav);
  return header;
}
