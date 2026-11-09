import { renderPage } from "../app/App.js";
import { getAuthenticatedUser } from "../services/auth-service.js";
import { isSupabaseConfigured } from "../services/supabase.js";
import { getHotelAdminRole } from "../features/hotels/hotel-service.js";

const protectedRoutes = new Set([
  "/account/",
  "/admin/",
  "/admin/hotels/",
  "/admin/hotel-edit/",
]);
const redirectStorageKey = "hotel-booking:redirect-after-login";

export function takePostLoginRoute() {
  const route = window.sessionStorage.getItem(redirectStorageKey);
  window.sessionStorage.removeItem(redirectStorageKey);
  return protectedRoutes.has(route) ? route : "/";
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (user) {
    return user;
  }

  const route = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  if (protectedRoutes.has(route)) {
    window.sessionStorage.setItem(redirectStorageKey, route);
  }
  window.location.replace("/login/");
  return null;
}

export function redirectIfAuthenticated(onError) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  let active = true;
  void getAuthenticatedUser().then((user) => {
    if (active && user) {
      window.location.replace(takePostLoginRoute());
    }
  }).catch((error) => {
    if (active) {
      onError(error);
    }
  });
  return () => {
    active = false;
  };
}

export async function renderProtectedPlaceholder(page) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch (error) {
    renderPage({
      title: page.title,
      description: error.message,
      links: [{ label: "Go to log in", href: "/login/" }],
    });
    return;
  }

  if (user) {
    renderPage(page);
  }
}

export async function renderProtectedAdminPage(page) {
  let user;
  try {
    user = await requireAuthenticatedUser();
    if (!user) {
      return;
    }

    if (!(await getHotelAdminRole(user.id))) {
      renderPage({
        title: "Admin access required",
        description:
          "You are signed in, but this account is not authorized to access hotel administration.",
        links: [{ label: "Back to home", href: "/" }],
      });
      return;
    }

    renderPage(page);
  } catch (error) {
    renderPage({
      title: "Unable to verify admin access",
      description: error.message,
      links: [{ label: "Try signing in again", href: "/login/" }],
    });
  }
}
