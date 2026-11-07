const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Hotels", href: "/hotels/" },
  { label: "My bookings", href: "/my-bookings/" },
  { label: "Account", href: "/account/" },
  { label: "Admin", href: "/admin/" },
  { label: "Log in", href: "/login/" },
  { label: "Register", href: "/register/" },
];

function createNavigation() {
  const nav = document.createElement("nav");
  nav.className = "navbar navbar-expand-lg bg-body-tertiary border-bottom";
  nav.setAttribute("aria-label", "Main navigation");

  const container = document.createElement("div");
  container.className = "container";

  const brand = document.createElement("a");
  brand.className = "navbar-brand fw-semibold";
  brand.href = "/";
  brand.textContent = "Hotel Booking";
  container.append(brand);

  const list = document.createElement("ul");
  list.className = "navbar-nav ms-auto";

  for (const item of navigationItems) {
    const listItem = document.createElement("li");
    listItem.className = "nav-item";

    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = item.href;
    link.textContent = item.label;
    listItem.append(link);
    list.append(listItem);
  }

  container.append(list);
  nav.append(container);
  return nav;
}

function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "container py-4 mt-auto text-body-secondary";

  const text = document.createElement("p");
  text.className = "mb-0 small";
  text.textContent = "Hotel Booking - application foundation";
  footer.append(text);
  return footer;
}

export function renderPage({ title, description, links = [] }) {
  document.title = `${title} | Hotel Booking`;

  const app = document.querySelector("#app");
  if (!app) {
    throw new Error('Page is missing the required "#app" element.');
  }

  const header = createNavigation();
  const main = document.createElement("main");
  main.className = "container py-5 flex-grow-1";

  const heading = document.createElement("h1");
  heading.className = "display-5 fw-semibold";
  heading.textContent = title;
  main.append(heading);

  const intro = document.createElement("p");
  intro.className = "lead text-body-secondary mt-3";
  intro.textContent = description;
  main.append(intro);

  if (links.length > 0) {
    const linkList = document.createElement("ul");
    linkList.className = "list-unstyled d-flex flex-wrap gap-3 mt-4";

    for (const item of links) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.className = "btn btn-outline-primary";
      link.href = item.href;
      link.textContent = item.label;
      listItem.append(link);
      linkList.append(listItem);
    }

    main.append(linkList);
  }

  app.replaceChildren(header, main, createFooter());
}
