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
  header.className = "site-header sticky-top border-bottom bg-white";

  const nav = document.createElement("nav");
  nav.className = "navbar navbar-expand-lg container";
  nav.setAttribute("aria-label", "Main navigation");

  const brand = document.createElement("a");
  brand.className = "navbar-brand fw-semibold";
  brand.href = "/";
  brand.textContent = "Hotel Booking";

  const toggle = document.createElement("button");
  toggle.className = "navbar-toggler";
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
  list.className = "navbar-nav ms-auto align-items-lg-center";
  navigationItems.forEach((item) => list.append(createNavigationLink(item)));

  const searchItem = document.createElement("li");
  searchItem.className = "nav-item";
  const searchLink = document.createElement("a");
  searchLink.className = "nav-link";
  searchLink.href = "/hotels/";
  searchLink.textContent = "Search stays";
  searchItem.append(searchLink);
  list.append(searchItem);

  const authItem = document.createElement("li");
  authItem.className = "nav-item d-flex gap-2 px-lg-2 py-2 py-lg-0";

  const login = document.createElement("a");
  login.className = "btn btn-outline-primary btn-sm";
  login.href = "/login/";
  login.textContent = "Log in";

  const register = document.createElement("a");
  register.className = "btn btn-primary btn-sm";
  register.href = "/register/";
  register.textContent = "Register";
  authItem.append(login, register);
  list.append(authItem);

  collapse.append(list);
  nav.append(brand, toggle, collapse);
  header.append(nav);
  return header;
}
