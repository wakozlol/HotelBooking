import { renderPage } from "../app/App.js";
import {
  getAuthenticatedUser,
  subscribeToAuthChanges,
} from "../services/auth-service.js";
import { isSupabaseConfigured } from "../services/supabase.js";

const protectedRoutes = new Set([
  "/account/",
  "/booking/",
  "/booking-confirmation/",
  "/booking-details/",
  "/my-bookings/",
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

  let redirected = false;
  const redirect = () => {
    if (!redirected) {
      redirected = true;
      window.location.replace(takePostLoginRoute());
    }
  };

  const {
    data: { subscription },
  } = subscribeToAuthChanges((event, session) => {
    if (session?.user && event !== "SIGNED_OUT") {
      redirect();
    }
  });

  void getAuthenticatedUser().then((user) => {
    if (user) {
      redirect();
    }
  }).catch((error) => {
    onError(error);
  });

  return () => subscription.unsubscribe();
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
