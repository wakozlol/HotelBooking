import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Find your next stay",
  description: "Welcome to Hotel Booking. Hotel search and booking features will be added in a later milestone.",
  links: [
    { label: "Browse hotels", href: "/hotels/" },
    { label: "Log in", href: "/login/" },
  ],
});
