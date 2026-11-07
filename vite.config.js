import { mkdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const pages = [
  { route: "/hotels/", file: "hotels/index.html" },
  { route: "/hotel/", file: "hotel/index.html" },
  { route: "/booking/", file: "booking/index.html" },
  { route: "/login/", file: "login/index.html" },
  { route: "/register/", file: "register/index.html" },
  { route: "/booking-confirmation/", file: "booking-confirmation/index.html" },
  { route: "/my-bookings/", file: "my-bookings/index.html" },
  { route: "/booking-details/", file: "booking-details/index.html" },
  { route: "/account/", file: "account/index.html" },
  { route: "/admin/", file: "admin/index.html" },
  { route: "/admin/hotels/", file: "admin/hotels/index.html" },
  { route: "/admin/hotel-edit/", file: "admin/hotel-edit/index.html" },
  { route: "/admin/rooms/", file: "admin/rooms/index.html" },
  { route: "/admin/bookings/", file: "admin/bookings/index.html" },
];

const routeFiles = new Map(
  pages.flatMap(({ route, file }) => [
    [route, file],
    [route.slice(0, -1), file],
  ]),
);

function mapPageUrls() {
  return {
    name: "hotel-booking-page-urls",
    enforce: "post",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [pathname, query] = (request.url ?? "/").split("?");
        const normalizedPath = pathname.endsWith("/")
          ? pathname
          : `${pathname}/`;
        const pageFile = routeFiles.get(normalizedPath);

        if (pageFile) {
          request.url = `/pages/${pageFile}${query ? `?${query}` : ""}`;
        }

        next();
      });
    },
    async writeBundle(outputOptions, bundle) {
      // Keep public route URLs stable while source HTML remains grouped in pages/.
      const outputDirectory = resolve(
        outputOptions.dir ?? resolve(projectRoot, "dist"),
      );

      for (const fileName of Object.keys(bundle)) {
        if (
          !fileName.startsWith("pages/") ||
          !fileName.endsWith(".html")
        ) {
          continue;
        }

        const publicFileName = fileName.slice("pages/".length);
        const source = resolve(outputDirectory, fileName);
        const destination = resolve(outputDirectory, publicFileName);
        await mkdir(dirname(destination), { recursive: true });
        await rename(source, destination);
      }
    },
  };
}

export default defineConfig({
  root: projectRoot,
  plugins: [mapPageUrls()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, "index.html"),
        ...Object.fromEntries(
          pages.map(({ file }) => [
            file.replaceAll("/", "-"),
            resolve(projectRoot, "pages", file),
          ]),
        ),
      },
    },
  },
});
