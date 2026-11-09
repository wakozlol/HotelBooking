import { mkdir, rename } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const pages = [
  { route: "/hotels/", file: "hotels/index.html", module: "hotels.js" },
  { route: "/hotel/", file: "hotel/index.html", module: "hotel.js" },
  { route: "/login/", file: "login/index.html", module: "login.js" },
  { route: "/register/", file: "register/index.html", module: "register.js" },
  {
    route: "/reset-password/",
    file: "reset-password/index.html",
    module: "reset-password.js",
  },
  { route: "/account/", file: "account/index.html", module: "account.js" },
  { route: "/admin/", file: "admin/index.html", module: "admin.js" },
  {
    route: "/admin/hotels/",
    file: "admin/hotels/index.html",
    module: "admin-hotels.js",
  },
  {
    route: "/admin/hotel-edit/",
    file: "admin/hotel-edit/index.html",
    module: "admin-hotel-edit.js",
  },
];

const pageEntries = new Map([
  ["index.html", "/src/main.js"],
  ["pages/index.html", "/src/main.js"],
  ...pages.map(({ file, module }) => [
    `pages/${file}`,
    `/src/pages/${module}`,
  ]),
]);

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
    transformIndexHtml: {
      order: "pre",
      handler(_html, context) {
        const pagePath = relative(projectRoot, context.filename).replaceAll(
          "\\",
          "/",
        );
        const modulePath = pageEntries.get(pagePath);
        const tags = [
          {
            tag: "script",
            children: "window.__HOTEL_BOOKING_VITE__ = true;",
            injectTo: "head-prepend",
          },
        ];

        if (modulePath) {
          tags.push({
            tag: "script",
            attrs: { type: "module", src: modulePath },
            injectTo: "body",
          });
        }

        return tags;
      },
    },
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
          !fileName.endsWith(".html") ||
          fileName === "pages/index.html"
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
        "pages/index": resolve(projectRoot, "pages/index.html"),
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
