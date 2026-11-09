import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Hotel details",
  description: "Hotel information and room availability will appear here.",
  links: [{ label: "Back to hotels", href: "/hotels/" }],
});
