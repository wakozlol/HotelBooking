import { getHotelListings } from "../hotels/hotel-service.js";

function createMetric({ label, value, detail, icon, tone }) {
  const card = document.createElement("article");
  card.className = `admin-metric admin-metric--${tone}`;

  const iconMark = document.createElement("span");
  iconMark.className = "admin-metric__icon";
  iconMark.setAttribute("aria-hidden", "true");
  iconMark.textContent = icon;

  const labelElement = document.createElement("p");
  labelElement.className = "admin-metric__label";
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.className = "admin-metric__value";
  valueElement.textContent = value;

  const detailElement = document.createElement("span");
  detailElement.className = "admin-metric__detail";
  detailElement.textContent = detail;

  card.append(iconMark, labelElement, valueElement, detailElement);
  return { card, valueElement };
}

function createManagementCard({
  eyebrow,
  title,
  description,
  href,
  action,
  icon,
  available,
}) {
  const card = document.createElement(available ? "a" : "article");
  card.className = `admin-management-card${available ? "" : " is-planned"}`;
  if (available) {
    card.href = href;
    card.setAttribute("aria-label", `${action}: ${title}`);
  }

  const top = document.createElement("div");
  top.className = "admin-management-card__top";
  const iconMark = document.createElement("span");
  iconMark.className = "admin-management-card__icon";
  iconMark.setAttribute("aria-hidden", "true");
  iconMark.textContent = icon;

  const status = document.createElement("span");
  status.className = available
    ? "badge admin-status-pill admin-status-pill--ready"
    : "badge admin-status-pill";
  status.textContent = available ? "Ready" : "Planned";
  top.append(iconMark, status);

  const eyebrowElement = document.createElement("p");
  eyebrowElement.className = "admin-management-card__eyebrow";
  eyebrowElement.textContent = eyebrow;
  const heading = document.createElement("h3");
  heading.className = "admin-management-card__title";
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.className = "admin-management-card__description";
  copy.textContent = description;
  const footer = document.createElement("span");
  footer.className = "admin-management-card__action";
  footer.textContent = available ? `${action} ->` : "Coming in a later milestone";
  card.append(top, eyebrowElement, heading, copy, footer);
  return card;
}

export function createAdminDashboard() {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "container admin-dashboard";

  const welcome = document.createElement("section");
  welcome.className = "admin-welcome";
  const welcomeCopy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "admin-welcome__eyebrow";
  eyebrow.textContent = "HOTEL OPERATIONS";
  const heading = document.createElement("h1");
  heading.textContent = "Welcome to your workspace";
  const description = document.createElement("p");
  description.textContent =
    "Keep your properties polished and your guest experience moving.";
  welcomeCopy.append(eyebrow, heading, description);

  const hotelLink = document.createElement("a");
  hotelLink.className = "btn btn-warning btn-lg admin-welcome__action";
  hotelLink.href = "/admin/hotels/";
  hotelLink.textContent = "Manage hotels";
  welcome.append(welcomeCopy, hotelLink);

  const metrics = document.createElement("section");
  metrics.className = "admin-metrics";
  metrics.setAttribute("aria-label", "Management overview");
  const hotelMetric = createMetric({
    label: "Hotel profiles",
    value: "Loading",
    detail: "Connected to your property catalog",
    icon: "H",
    tone: "gold",
  });
  const roomMetric = createMetric({
    label: "Room inventory",
    value: "Planned",
    detail: "Room management is not enabled yet",
    icon: "R",
    tone: "blue",
  });
  const bookingMetric = createMetric({
    label: "Reservations",
    value: "Planned",
    detail: "Booking management is not enabled yet",
    icon: "B",
    tone: "green",
  });
  metrics.append(hotelMetric.card, roomMetric.card, bookingMetric.card);

  const sectionHeading = document.createElement("div");
  sectionHeading.className = "admin-dashboard__section-heading";
  const sectionTitle = document.createElement("h2");
  sectionTitle.textContent = "Management";
  const sectionDescription = document.createElement("p");
  sectionDescription.textContent =
    "Your available tools and what is coming next.";
  sectionHeading.append(sectionTitle, sectionDescription);

  const management = document.createElement("section");
  management.className = "admin-management-grid";
  management.setAttribute("aria-label", "Management tools");
  management.append(
    createManagementCard({
      eyebrow: "PROPERTY CATALOG",
      title: "Hotels",
      description:
        "Create hotel profiles, update property details, replace imagery, or remove listings.",
      href: "/admin/hotels/",
      action: "Open hotel management",
      icon: "01",
      available: true,
    }),
    createManagementCard({
      eyebrow: "INVENTORY",
      title: "Rooms",
      description:
        "Room types and physical room inventory will be available when their database workflow is implemented.",
      icon: "02",
      available: false,
    }),
    createManagementCard({
      eyebrow: "GUEST STAYS",
      title: "Bookings",
      description:
        "Reservation management will be available after booking inventory and policies are implemented.",
      icon: "03",
      available: false,
    }),
  );

  const status = document.createElement("p");
  status.className = "admin-dashboard__status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  main.append(welcome, metrics, sectionHeading, management, status);
  void getHotelListings()
    .then((hotels) => {
      hotelMetric.valueElement.textContent = String(hotels.length);
    })
    .catch((error) => {
      hotelMetric.valueElement.textContent = "-";
      status.className = "admin-dashboard__status text-danger";
      status.textContent = error.message;
    });

  return main;
}
