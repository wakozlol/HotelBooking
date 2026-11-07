import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Log in",
  description: "Guest authentication will be implemented in a later milestone.",
  layout: "auth",
  links: [{ label: "Create an account", href: "/register/" }],
});
