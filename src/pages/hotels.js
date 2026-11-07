import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Hotels",
  description: "Hotel listings will appear here when browsing is implemented.",
  links: [{ label: "Example hotel details", href: "/hotel/?id=example-hotel" }],
});
