import "../main.js";
import { renderPage } from "../components/site-shell.js";

renderPage({
  title: "Hotel details",
  description: "Hotel information and room availability will appear here.",
  links: [
    {
      label: "Continue to example booking",
      href: "/booking/?roomTypeId=example-room-type&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=1",
    },
    { label: "Back to hotels", href: "/hotels/" },
  ],
});
