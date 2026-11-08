import "../../components/AuthModal/AuthModal.css";
import "./AuthLayout.css";

export function createAuthLayout(page) {
  const layout = document.createElement("div");
  layout.className = "auth-layout";

  const brand = document.createElement("a");
  brand.className = "auth-layout__brand";
  brand.href = "/";
  brand.setAttribute("aria-label", "Hotel Booking home");
  brand.textContent = "HOTEL BOOKING";

  const card = document.createElement("div");
  card.className = "auth-page__card";

  const visual = document.createElement("aside");
  visual.className = "auth-modal__visual";
  visual.setAttribute("aria-label", "A warmly lit luxury hotel lounge");

  const visualContent = document.createElement("div");
  visualContent.className = "auth-modal__visual-content";

  const visualEyebrow = document.createElement("p");
  visualEyebrow.className = "auth-modal__visual-eyebrow";
  visualEyebrow.textContent = "THE ART OF A STAY";

  const visualHeading = document.createElement("p");
  visualHeading.className = "auth-modal__visual-heading";
  visualHeading.textContent = "Arrive somewhere wonderful.";

  const visualDetail = document.createElement("p");
  visualDetail.className = "auth-modal__visual-detail";
  visualDetail.textContent = "Thoughtful stays, unforgettable moments.";
  visualContent.append(visualEyebrow, visualHeading, visualDetail);
  visual.append(visualContent);

  const panel = document.createElement("main");
  panel.id = "main-content";
  panel.className = "auth-modal__panel auth-page__main";

  const intro = document.createElement("header");
  intro.className = "auth-page__intro";

  const eyebrow = document.createElement("p");
  eyebrow.className = "auth-modal__eyebrow mb-2";
  eyebrow.textContent = "HOTEL BOOKING";

  const heading = document.createElement("h1");
  heading.className = "modal-title h3 fw-bold";
  heading.textContent = page.title;

  const description = document.createElement("p");
  description.className = "auth-modal__description mb-0";
  description.textContent = page.description;
  intro.append(eyebrow, heading, description);

  panel.append(intro);
  card.append(visual, panel);
  layout.append(brand, card);
  return layout;
}
