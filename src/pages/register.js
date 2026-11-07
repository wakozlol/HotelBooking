import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Create an account",
  description: "Guest registration will be implemented in a later milestone.",
  links: [{ label: "Already registered? Log in", href: "/login/" }],
});
