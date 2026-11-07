import "../main.js";
import { renderPage } from "../app/App.js";
import { renderAccountPage } from "../features/auth/account-page.js";
import { getOwnProfile } from "../services/profile-service.js";
import { requireAuthenticatedUser } from "../utils/auth-guard.js";

renderPage({
  title: "Your account",
  description: "Checking your sign-in and loading your account details...",
});

async function initializeAccountPage() {
  let user;
  let profile;
  try {
    user = await requireAuthenticatedUser();
    if (!user) {
      return;
    }
    profile = await getOwnProfile(user.id);
  } catch (error) {
    renderPage({
      title: "Your account",
      description: error.message,
      links: [{ label: "Go to log in", href: "/login/" }],
    });
    return;
  }

  renderAccountPage(user, profile);
}

void initializeAccountPage();
