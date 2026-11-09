export function getSiteAssetUrl(path) {
  const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!configuredUrl) return null;
  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return null;
    }
    return new URL(`storage/v1/object/public/site-assets/${path}`, `${url.href.replace(/\/+$/, "")}/`).href;
  } catch {
    return null;
  }
}

export function initializeSiteAssets() {
  for (const [property, path] of [
    ["--site-auth-image", "auth/auth-lounge.png"],
    ["--site-hero-image", "hero/resort.jpg"],
  ]) {
    const url = getSiteAssetUrl(path);
    if (url) document.documentElement.style.setProperty(property, `url("${url}")`);
  }
  const favicon = getSiteAssetUrl("favicon.svg");
  if (favicon) {
    document.querySelectorAll('link[rel="icon"]').forEach((link) => { link.href = favicon; });
  }
}
