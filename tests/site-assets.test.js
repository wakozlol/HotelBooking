import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const vite = await createServer({
  configFile: false,
  envFile: false,
  appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
  define: { "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.invalid") },
});
const assets = await vite.ssrLoadModule("/src/utils/site-assets.js");
const { sampleHotelGalleryByStyle } = await vite.ssrLoadModule("/src/features/hotels/sample-hotels.js");
after(async () => { await vite.close(); });

test("site asset URLs use the configured Supabase project", () => {
  assert.equal(assets.getSiteAssetUrl("gallery/photo.jpg"),
    "https://example.invalid/storage/v1/object/public/site-assets/gallery/photo.jpg");
});

test("all gallery photos use the configured public asset bucket", () => {
  const images = Object.values(sampleHotelGalleryByStyle).flat();
  assert.equal(images.length, 16);
  for (const image of images) {
    assert.match(image.src, /^https:\/\/example\.invalid\/storage\/v1\/object\/public\/site-assets\/gallery\/photo-[\w-]+\.jpg$/);
  }
});

test("site image and favicon references are initialized", () => {
  const properties = new Map();
  const favicon = {};
  globalThis.document = {
    documentElement: { style: { setProperty: (key, value) => properties.set(key, value) } },
    querySelectorAll: () => [favicon],
  };
  try {
    assets.initializeSiteAssets();
    assert.match(properties.get("--site-auth-image"), /site-assets\/auth\/auth-lounge\.png/);
    assert.match(properties.get("--site-hero-image"), /site-assets\/hero\/resort\.jpg/);
    assert.match(favicon.href, /site-assets\/favicon\.svg$/);
  } finally {
    delete globalThis.document;
  }
});
