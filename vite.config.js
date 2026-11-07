import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(projectRoot, "pages");

const pages = [
  "index.html",
  "hotels/index.html",
  "hotel/index.html",
  "booking/index.html",
  "login/index.html",
  "register/index.html",
  "booking-confirmation/index.html",
  "my-bookings/index.html",
  "booking-details/index.html",
  "account/index.html",
  "admin/index.html",
  "admin/hotels/index.html",
  "admin/hotel-edit/index.html",
  "admin/rooms/index.html",
  "admin/bookings/index.html",
];

export default defineConfig({
  root,
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replaceAll("/", "-"), resolve(root, page)]),
      ),
    },
  },
});
