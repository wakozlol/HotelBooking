import { createFooter } from "../../components/Footer/Footer.js";
import { createHeader } from "../../components/Header/Header.js";
import { createPageContent } from "./PageContent.js";
import {
  createHomeHotelShowcase,
  createHotelListingsPage,
} from "../../features/hotels/hotel-showcase.js";
import "./MainLayout.css";
import "../../features/hotels/hotels.css";

export function createMainLayout(page) {
  const layout = document.createElement("div");
  layout.className = "application-shell";

  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = "#main-content";
  skipLink.textContent = "Skip to main content";

  layout.append(
    skipLink,
    createHeader(),
    page.hero
      ? createHomeHotelShowcase(page)
      : page.hotelListings
        ? createHotelListingsPage(page)
        : createPageContent(page),
    createFooter(),
  );
  return layout;
}
