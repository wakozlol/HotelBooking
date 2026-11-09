const protectedRoutes = new Set([
  "/account/",
  "/booking/",
  "/my-bookings/",
  "/admin/",
  "/admin/hotels/",
  "/admin/hotel-edit/",
]);
const redirectStorageKey = "hotel-booking:redirect-after-login";

export function rememberProtectedRoute(pathname) {
  const route = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (protectedRoutes.has(route)) {
    window.sessionStorage.setItem(redirectStorageKey, route);
  }
}

export function takePostLoginRoute(fallback = "/") {
  const route = window.sessionStorage.getItem(redirectStorageKey);
  window.sessionStorage.removeItem(redirectStorageKey);
  return protectedRoutes.has(route) ? route : fallback;
}
