import { sampleHotels } from "./sample-hotels.js";

function createHotelArtwork(hotel, extraClass = "") {
  const artwork = document.createElement("div");
  artwork.className = `hotel-art hotel-art--${hotel.style} ${extraClass}`.trim();
  artwork.setAttribute("aria-hidden", "true");
  return artwork;
}

function createHotelCard(hotel) {
  const card = document.createElement("article");
  card.className = "hotel-card h-100";

  const artwork = createHotelArtwork(hotel, "hotel-card__art");
  const badge = document.createElement("span");
  badge.className = "hotel-card__badge";
  badge.textContent = "Sample hotel";
  artwork.append(badge);

  const body = document.createElement("div");
  body.className = "hotel-card__body";

  const location = document.createElement("p");
  location.className = "hotel-card__location";
  location.textContent = hotel.location.replace("Sample stay · ", "");

  const title = document.createElement("h3");
  title.className = "hotel-card__title";
  title.textContent = hotel.name;

  const description = document.createElement("p");
  description.className = "hotel-card__description";
  description.textContent = hotel.description;

  const highlights = document.createElement("ul");
  highlights.className = "hotel-card__highlights list-unstyled";
  for (const highlight of hotel.highlights) {
    const item = document.createElement("li");
    item.textContent = highlight;
    highlights.append(item);
  }

  body.append(location, title, description, highlights);
  card.append(artwork, body);
  return card;
}

function createSampleNotice() {
  const notice = document.createElement("p");
  notice.className = "hotel-sample-notice";
  notice.setAttribute("role", "note");
  notice.textContent =
    "These are illustrative sample hotels, not live properties or availability.";
  return notice;
}

function createHotelGrid() {
  const grid = document.createElement("div");
  grid.className = "row g-4";
  for (const hotel of sampleHotels) {
    const column = document.createElement("div");
    column.className = "col-md-6 col-xl-3";
    column.append(createHotelCard(hotel));
    grid.append(column);
  }
  return grid;
}

function createCarouselSlide(hotel, index) {
  const item = document.createElement("div");
  item.className = `carousel-item${index === 0 ? " active" : ""}`;

  const slide = document.createElement("div");
  slide.className = `hotel-feature hotel-feature--${hotel.style}`;
  slide.append(createHotelArtwork(hotel, "hotel-feature__art"));

  const content = document.createElement("div");
  content.className = "container hotel-feature__content";

  const eyebrow = document.createElement("p");
  eyebrow.className = "hotel-feature__eyebrow";
  eyebrow.textContent = "A SAMPLE STAY TO INSPIRE YOU";

  const name = document.createElement("h2");
  name.className = "hotel-feature__title";
  name.textContent = hotel.name;

  const location = document.createElement("p");
  location.className = "hotel-feature__location";
  location.textContent = hotel.location;

  const description = document.createElement("p");
  description.className = "hotel-feature__description";
  description.textContent = hotel.description;

  const explore = document.createElement("a");
  explore.className = "btn btn-warning btn-lg fw-semibold";
  explore.href = "/hotels/";
  explore.textContent = "Explore sample stays";

  content.append(eyebrow, name, location, description, explore);
  slide.append(content);
  item.append(slide);
  return item;
}

function createCarousel() {
  const section = document.createElement("section");
  section.className = "hotel-carousel";
  section.setAttribute("aria-label", "Featured sample hotels");

  const carousel = document.createElement("div");
  carousel.id = "featured-hotels";
  carousel.className = "carousel slide";
  carousel.setAttribute("data-bs-ride", "carousel");
  carousel.setAttribute("data-bs-interval", "6500");
  carousel.setAttribute("data-bs-pause", "hover");

  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  indicators.setAttribute("aria-label", "Choose a featured sample hotel");
  sampleHotels.forEach((hotel, index) => {
    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.dataset.bsTarget = "#featured-hotels";
    indicator.dataset.bsSlideTo = String(index);
    indicator.setAttribute("aria-label", `Show ${hotel.name}`);
    if (index === 0) {
      indicator.className = "active";
      indicator.setAttribute("aria-current", "true");
    }
    indicators.append(indicator);
  });

  const slides = document.createElement("div");
  slides.className = "carousel-inner";
  sampleHotels.forEach((hotel, index) => {
    slides.append(createCarouselSlide(hotel, index));
  });

  const previous = document.createElement("button");
  previous.className = "carousel-control-prev";
  previous.type = "button";
  previous.dataset.bsTarget = "#featured-hotels";
  previous.dataset.bsSlide = "prev";
  previous.setAttribute("aria-label", "Previous featured hotel");
  const previousIcon = document.createElement("span");
  previousIcon.className = "carousel-control-prev-icon";
  previousIcon.setAttribute("aria-hidden", "true");
  previous.append(previousIcon);

  const next = document.createElement("button");
  next.className = "carousel-control-next";
  next.type = "button";
  next.dataset.bsTarget = "#featured-hotels";
  next.dataset.bsSlide = "next";
  next.setAttribute("aria-label", "Next featured hotel");
  const nextIcon = document.createElement("span");
  nextIcon.className = "carousel-control-next-icon";
  nextIcon.setAttribute("aria-hidden", "true");
  next.append(nextIcon);

  carousel.append(indicators, slides, previous, next);
  section.append(carousel);
  return section;
}

export function createHomeHotelShowcase({ title, description, links = [] }) {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "hotel-home";
  main.append(createCarousel());

  const introduction = document.createElement("section");
  introduction.className = "container hotel-home__intro";

  const heading = document.createElement("h1");
  heading.className = "display-5 fw-semibold";
  heading.textContent = title;

  const summary = document.createElement("p");
  summary.className = "lead text-body-secondary mt-3";
  summary.textContent = description;
  introduction.append(heading, summary, createSampleNotice());

  if (links.length > 0) {
    const link = document.createElement("a");
    link.className = "btn btn-primary btn-lg mt-3";
    link.href = links[0].href;
    link.textContent = links[0].label;
    introduction.append(link);
  }

  const stays = document.createElement("section");
  stays.className = "container hotel-home__stays";
  const staysHeading = document.createElement("h2");
  staysHeading.className = "h3 mb-4";
  staysHeading.textContent = "Sample stays to inspire your next trip";
  stays.append(staysHeading, createHotelGrid());

  main.append(introduction, stays);
  return main;
}

export function createHotelListingsPage({ title, description }) {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "container hotel-listings";

  const heading = document.createElement("h1");
  heading.className = "display-5 fw-semibold";
  heading.textContent = title;

  const summary = document.createElement("p");
  summary.className = "lead text-body-secondary mt-3";
  summary.textContent = description;

  main.append(heading, summary, createSampleNotice(), createHotelGrid());
  return main;
}
