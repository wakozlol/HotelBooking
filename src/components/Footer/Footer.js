import "./Footer.css";

const footerLinks = [
  { label: "Browse hotels", href: "/hotels/" },
  { label: "My bookings", href: "/my-bookings/" },
  { label: "Sign in", href: "/login/" },
];

export function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer border-top";

  const container = document.createElement("div");
  container.className =
    "container d-flex flex-column flex-md-row justify-content-between gap-3 py-4";

  const brand = document.createElement("div");
  const title = document.createElement("p");
  title.className = "fw-semibold mb-1";
  title.textContent = "Hotel Booking";
  const description = document.createElement("p");
  description.className = "small text-body-secondary mb-0";
  description.textContent = "Find a comfortable stay for your next trip.";
  brand.append(title, description);

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Footer navigation");
  const list = document.createElement("ul");
  list.className =
    "list-unstyled d-flex flex-wrap gap-3 justify-content-md-end mb-0";

  for (const item of footerLinks) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    listItem.append(link);
    list.append(listItem);
  }

  nav.append(list);

  const copyright = document.createElement("p");
  copyright.className = "small text-body-secondary mb-0";
  copyright.textContent = `Copyright ${new Date().getFullYear()} Hotel Booking`;

  container.append(brand, nav, copyright);
  footer.append(container);
  return footer;
}
