import { createMainLayout } from "./layouts/MainLayout.js";
import { createAuthLayout } from "./layouts/AuthLayout.js";
import { createAdminLayout } from "./layouts/AdminLayout.js";

const homePage = {
  title: "Find your next stay",
  description:
    "Welcome to Hotel Booking. Browse hotels and plan your next stay.",
  hero: true,
  links: [
    { label: "Browse hotels", href: "/hotels/" },
  ],
};

const layoutFactories = new Map([
  ["main", createMainLayout],
  ["auth", createAuthLayout],
  ["admin", createAdminLayout],
]);

export function renderPage({
  title,
  description,
  links = [],
  layout = "main",
  hero = false,
}) {
  const app = document.querySelector("#app");
  if (!app) {
    throw new Error('Page is missing the required "#app" element.');
  }

  const createLayout = layoutFactories.get(layout);
  if (!createLayout) {
    throw new Error(`Unknown application layout: ${layout}`);
  }

  document.title = `${title} | Hotel Booking`;
  app.replaceChildren(createLayout({ title, description, links, hero }));
}

export function renderHomePage() {
  renderPage(homePage);
}

export function initializeApp() {
  const app = document.querySelector("#app");
  if (!app) {
    throw new Error('Page is missing the required "#app" element.');
  }

  if (app.dataset.page === "home" || app.dataset.entry === "home") {
    renderHomePage();
  }
}
