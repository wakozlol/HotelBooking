import { Modal } from "bootstrap";
import { getAuthenticatedUser } from "../../services/auth-service.js";
import { isSupabaseConfigured } from "../../services/supabase.js";
import { createStayBooking } from "../bookings/stay-booking.js";
import { createHotelAdminActions, createHotelEditModal } from "./hotel-admin.js";
import {
  getHotelAdminRole,
  getHotelListings,
} from "./hotel-service.js";
import { sampleHotelGalleryByStyle, sampleHotels } from "./sample-hotels.js";

const euroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function createHotelArtwork(hotel, extraClass = "") {
  const artwork = document.createElement("div");
  artwork.className =
    `hotel-art hotel-art--${hotel.style} hotel-art--photo ${extraClass}`.trim();

  const image = document.createElement("img");
  image.className = "hotel-art__image";
  image.src = hotel.imageUrl;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.setAttribute("aria-hidden", "true");

  artwork.append(image);
  if (
    hotel.photoCredit &&
    hotel.photoSource &&
    hotel.photoLicense &&
    hotel.photoLicenseUrl
  ) {
    const attribution = document.createElement("span");
    attribution.className = "hotel-art__attribution";

    const photographer = document.createElement("a");
    photographer.href = hotel.photoSource;
    photographer.target = "_blank";
    photographer.rel = "noopener noreferrer";
    photographer.textContent = `Photo: ${hotel.photoCredit}`;

    const license = document.createElement("a");
    license.href = hotel.photoLicenseUrl;
    license.target = "_blank";
    license.rel = "noopener noreferrer";
    license.textContent = hotel.photoLicense;

    attribution.append(photographer, document.createTextNode(" · "), license);
    artwork.append(attribution);
  }
  return artwork;
}

function formatHotelLocation(location) {
  return location.replace(/^Sample stay\s*[·-]\s*/, "");
}

function createHotelCard(hotel, showDetails, adminActions) {
  const card = document.createElement("article");
  card.className = "hotel-card h-100";

  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) {
      return;
    }
    showDetails(hotel);
  });

  const artwork = createHotelArtwork(hotel, "hotel-card__art");

  const body = document.createElement("div");
  body.className = "hotel-card__body";

  const location = document.createElement("p");
  location.className = "hotel-card__location";
  location.textContent = formatHotelLocation(hotel.location);

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

  const footer = document.createElement("div");
  footer.className = "hotel-card__footer";

  const rate = document.createElement("p");
  rate.className = "hotel-card__rate";
  const rateLabel = document.createElement("span");
  rateLabel.className = "hotel-card__rate-label";
  rateLabel.textContent = "Illustrative rate";
  const rateAmount = document.createElement("strong");
  rateAmount.textContent = euroFormatter.format(hotel.nightlyRate);
  const rateUnit = document.createElement("span");
  rateUnit.className = "hotel-card__rate-unit";
  rateUnit.textContent = " / night";
  rate.append(rateLabel, rateAmount, rateUnit);

  const viewDetails = document.createElement("button");
  viewDetails.className = "btn btn-outline-success hotel-card__action";
  viewDetails.type = "button";
  viewDetails.textContent = "View Details";
  viewDetails.setAttribute("aria-label", `View details for ${hotel.name}`);
  viewDetails.addEventListener("click", () => showDetails(hotel));

  footer.append(rate, viewDetails);
  body.append(location, title, description, highlights, footer);
  if (adminActions) {
    body.append(adminActions);
  }
  card.append(artwork, body);
  return card;
}

function createHotelDetailsBody(hotel, stayBooking) {
  const body = document.createElement("div");
  body.className = "row g-4 hotel-details";

  const galleryColumn = document.createElement("div");
  galleryColumn.className = "col-lg-7";
  const gallery = document.createElement("div");
  gallery.className = "hotel-details__gallery";

  const hero = document.createElement("img");
  hero.className = "hotel-details__hero";
  hero.src = hotel.imageUrl;
  hero.alt = `${hotel.name} hotel preview`;
  hero.decoding = "async";
  gallery.append(hero);

  const galleryCredit = document.createElement("p");
  galleryCredit.className = "hotel-details__photo-credit";
  if (
    hotel.photoCredit &&
    hotel.photoSource &&
    hotel.photoLicense &&
    hotel.photoLicenseUrl
  ) {
    const creditLink = document.createElement("a");
    creditLink.href = hotel.photoSource;
    creditLink.target = "_blank";
    creditLink.rel = "noopener noreferrer";
    creditLink.textContent = `Cover photo: ${hotel.photoCredit}`;
    const licenseLink = document.createElement("a");
    licenseLink.href = hotel.photoLicenseUrl;
    licenseLink.target = "_blank";
    licenseLink.rel = "noopener noreferrer";
    licenseLink.textContent = hotel.photoLicense;
    galleryCredit.append(creditLink, document.createTextNode(" · "), licenseLink);
  } else {
    galleryCredit.textContent = "Image provided by the hotel team.";
  }
  const unsplashCredit = document.createElement("a");
  unsplashCredit.href = "https://unsplash.com";
  unsplashCredit.target = "_blank";
  unsplashCredit.rel = "noopener noreferrer";
  unsplashCredit.textContent = "Unsplash";

  const thumbnails = document.createElement("div");
  thumbnails.className = "hotel-details__thumbnails";
  const galleryImages = sampleHotelGalleryByStyle[hotel.style] ?? [];
  galleryImages.forEach((image) => {
    const thumbnail = document.createElement("button");
    thumbnail.className = "hotel-details__thumbnail";
    thumbnail.type = "button";
    thumbnail.setAttribute("aria-label", `Show ${image.alt}`);
    thumbnail.setAttribute("aria-pressed", "false");

    const thumbnailImage = document.createElement("img");
    thumbnailImage.src = image.src;
    thumbnailImage.alt = "";
    thumbnailImage.loading = "lazy";
    thumbnailImage.decoding = "async";
    thumbnail.append(thumbnailImage);
    thumbnail.addEventListener("click", () => {
      hero.src = image.src;
      hero.alt = image.alt;
      galleryCredit.replaceChildren(
        document.createTextNode("Gallery photo via "),
        unsplashCredit,
      );
      thumbnails.querySelectorAll(".hotel-details__thumbnail").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === thumbnail));
      });
    });
    thumbnails.append(thumbnail);
  });
  gallery.append(thumbnails);

  galleryColumn.append(gallery, galleryCredit);

  const detailsColumn = document.createElement("div");
  detailsColumn.className = "col-lg-5";
  const location = document.createElement("p");
  location.className = "hotel-card__location";
  location.textContent = formatHotelLocation(hotel.location);

  const description = document.createElement("p");
  description.className = "hotel-details__description";
  description.textContent = hotel.description;

  const ratePanel = document.createElement("div");
  ratePanel.className = "hotel-details__rate";
  const rateLabel = document.createElement("span");
  rateLabel.textContent = "Illustrative rate";
  const rateAmount = document.createElement("strong");
  rateAmount.textContent = euroFormatter.format(hotel.nightlyRate);
  const rateUnit = document.createElement("span");
  rateUnit.textContent = " per night";
  const rateNote = document.createElement("small");
  rateNote.textContent = "Example only; not a live offer.";
  ratePanel.append(rateLabel, rateAmount, rateUnit, rateNote);

  const amenitiesHeading = document.createElement("h3");
  amenitiesHeading.className = "hotel-details__heading";
  amenitiesHeading.textContent = "Amenities";
  const amenities = document.createElement("ul");
  amenities.className = "hotel-details__amenities";
  for (const amenity of hotel.amenities) {
    const item = document.createElement("li");
    item.textContent = amenity;
    amenities.append(item);
  }

  const bookingHeading = document.createElement("h3");
  bookingHeading.className = "hotel-details__heading";
  bookingHeading.textContent = "Booking details";
  const bookingDetails = document.createElement("dl");
  bookingDetails.className = "hotel-details__booking";
  for (const [label, value] of [
    ["Check-in", "Example time: 15:00"],
    ["Check-out", "Example time: 11:00"],
    ["Payment", "At the hotel"],
  ]) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    row.append(term, description);
    bookingDetails.append(row);
  }

  const availabilityNotice = document.createElement("p");
  availabilityNotice.className = "hotel-details__notice";
  availabilityNotice.textContent =
    "Hotel details and the illustrative rate above are examples. Check availability below for actual room prices.";

  detailsColumn.append(
    location,
    description,
    ratePanel,
    amenitiesHeading,
    amenities,
    bookingHeading,
    bookingDetails,
    availabilityNotice,
    stayBooking.element,
  );
  body.append(galleryColumn, detailsColumn);
  return body;
}

function createHotelDetailsModal() {
  const element = document.createElement("div");
  element.className = "modal fade hotel-details-modal";
  element.tabIndex = -1;
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("aria-labelledby", "hotel-details-modal-title");

  const dialog = document.createElement("div");
  dialog.className = "modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl";
  const content = document.createElement("div");
  content.className = "modal-content";

  const header = document.createElement("div");
  header.className = "modal-header";
  const title = document.createElement("h2");
  title.className = "modal-title fs-4";
  title.id = "hotel-details-modal-title";
  const close = document.createElement("button");
  close.className = "btn-close";
  close.type = "button";
  close.setAttribute("data-bs-dismiss", "modal");
  close.setAttribute("aria-label", "Close hotel details");
  header.append(title, close);

  const body = document.createElement("div");
  body.className = "modal-body";
  const footer = document.createElement("div");
  footer.className = "modal-footer";
  const book = document.createElement("button");
  book.className = "btn btn-success";
  book.type = "button";
  book.textContent = "Book";
  book.setAttribute("aria-expanded", "false");
  book.setAttribute("aria-controls", "hotel-stay-booking");
  footer.append(book);
  content.append(header, body, footer);
  dialog.append(content);
  element.append(dialog);
  document.body.append(element);

  const modal = new Modal(element, {
    backdrop: true,
    keyboard: true,
    focus: true,
  });

  let stayBooking;
  book.addEventListener("click", () => {
    stayBooking.show();
    book.setAttribute("aria-expanded", "true");
  });

  return {
    element,
    open(hotel, live) {
      title.textContent = hotel.name;
      stayBooking = createStayBooking(hotel, { live });
      stayBooking.element.id = "hotel-stay-booking";
      book.setAttribute("aria-expanded", "false");
      body.replaceChildren(createHotelDetailsBody(hotel, stayBooking));
      modal.show();
    },
  };
}

function createSampleNotice() {
  const notice = document.createElement("p");
  notice.className = "hotel-sample-notice";
  notice.setAttribute("role", "note");
  notice.textContent =
    "Hotel descriptions, displayed rates, and amenities may be illustrative. Check each hotel for live room availability and pricing.";
  return notice;
}

function createHotelGrid() {
  const grid = document.createElement("div");
  grid.className = "row g-4";
  const detailsModal = createHotelDetailsModal();
  let editModal;

  let refreshGrid = () => {};

  function ensureEditModal() {
    if (!editModal) {
      editModal = createHotelEditModal((...args) => refreshGrid(...args));
    }
  }

  return {
    element: grid,
    setRefresh(refresh) {
      refreshGrid = refresh;
    },
    render(hotels, isAdmin, refresh, live = true) {
      grid.replaceChildren();
      refreshGrid = refresh;
      if (isAdmin) {
        ensureEditModal();
      }

      for (const hotel of hotels) {
        const column = document.createElement("div");
        column.className = "col-md-6 col-xl-3";
        const actions = isAdmin
          ? createHotelAdminActions(hotel, { editModal, refresh })
          : null;
        column.append(createHotelCard(hotel, (selected) => detailsModal.open(selected, live), actions));
        grid.append(column);
      }
    },
    openCreate() {
      ensureEditModal();
      editModal.open(null);
    },
  };
}

function setHotelGridStatus(status, message = "", type = "info") {
  if (!message) {
    status.className = "hotel-grid-status d-none";
    status.textContent = "";
    return;
  }
  status.className = `alert alert-${type} hotel-grid-status`;
  status.textContent = message;
}

async function loadHotelGrid(
  grid,
  status,
  message = "",
  messageType = "success",
  allowSampleFallback = true,
) {
  const refresh = (nextMessage, nextMessageType = "success") =>
    loadHotelGrid(
      grid,
      status,
      nextMessage,
      nextMessageType,
      allowSampleFallback,
    );
  if (!isSupabaseConfigured()) {
    grid.render(allowSampleFallback ? sampleHotels : [], false, refresh, false);
    setHotelGridStatus(
      status,
      allowSampleFallback
        ? ""
        : "Supabase configuration is required to manage hotel listings.",
      allowSampleFallback ? "info" : "danger",
    );
    return false;
  }

  setHotelGridStatus(status, "Loading hotel cards...");
  grid.render([], false, refresh);
  try {
    const user = await getAuthenticatedUser();
    const isAdmin = user ? await getHotelAdminRole(user.id) : false;
    const hotels = await getHotelListings();
    grid.render(hotels, isAdmin, refresh);
    if (message) {
      setHotelGridStatus(status, message, messageType);
    } else if (isAdmin) {
      setHotelGridStatus(
        status,
        "Administrator actions are available on each hotel card.",
      );
    } else if (hotels.length === 0) {
      setHotelGridStatus(status, "No published hotels are available yet.");
    } else {
      setHotelGridStatus(status);
    }
    return true;
  } catch (error) {
    grid.render([], false, refresh);
    setHotelGridStatus(status, error.message, "danger");
    return false;
  }
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
  eyebrow.textContent = "FEATURED STAY";

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
  const status = document.createElement("div");
  status.className = "hotel-grid-status d-none";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const grid = createHotelGrid();
  grid.setRefresh((message, type = "success") =>
    loadHotelGrid(grid, status, message, type, false),
  );
  stays.append(staysHeading, status, grid.element);

  main.append(introduction, stays);
  void loadHotelGrid(grid, status);
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

  const status = document.createElement("div");
  status.className = "hotel-grid-status d-none";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const grid = createHotelGrid();
  main.append(heading, summary, createSampleNotice(), status, grid.element);
  void loadHotelGrid(grid, status);
  return main;
}

export function createAdminHotelManagementPage() {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "container admin-hotel-page";

  const heading = document.createElement("div");
  heading.className = "admin-hotel-page__heading";
  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "admin-eyebrow";
  eyebrow.textContent = "PROPERTY CATALOG";
  const title = document.createElement("h1");
  title.textContent = "Manage hotels";
  const description = document.createElement("p");
  description.className = "text-body-secondary";
  description.textContent =
    "Create hotel profiles, update property details, and refresh listing images.";
  copy.append(eyebrow, title, description);

  const status = document.createElement("div");
  status.className = "hotel-grid-status d-none";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const grid = createHotelGrid();
  const addHotel = document.createElement("button");
  addHotel.className = "btn btn-warning admin-add-hotel";
  addHotel.type = "button";
  addHotel.textContent = "Add hotel";
  addHotel.addEventListener("click", () => grid.openCreate());
  heading.append(copy, addHotel);

  main.append(heading, status, grid.element);
  void loadHotelGrid(grid, status, "", "success", false);
  return main;
}
