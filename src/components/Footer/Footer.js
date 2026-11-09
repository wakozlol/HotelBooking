import "./Footer.css";

const footerLinks = [
  { label: "Browse hotels", href: "/hotels/" },
  { label: "My bookings", href: "/my-bookings/" },
  { label: "Sign in", href: "/login/" },
];

export function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  const container = document.createElement("div");
  container.className = "container";

  const content = document.createElement("div");
  content.className = "row g-4 g-lg-5 py-5";

  const brand = document.createElement("div");
  brand.className = "col-12 col-lg-5";
  const brandLine = document.createElement("div");
  brandLine.className = "site-footer__brand";
  const mark = document.createElement("span");
  mark.className = "site-footer__mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "H";
  const title = document.createElement("p");
  title.className = "site-footer__title mb-0";
  title.textContent = "Hotel Booking";
  brandLine.append(mark, title);
  const description = document.createElement("p");
  description.className = "site-footer__description mb-0";
  description.textContent =
    "Find your next favorite place to stay and make every journey memorable.";
  brand.append(brandLine, description);

  const nav = document.createElement("nav");
  nav.className = "col-12 col-sm-6 col-lg-3";
  nav.setAttribute("aria-label", "Footer navigation");
  const navTitle = document.createElement("h2");
  navTitle.className = "site-footer__heading";
  navTitle.textContent = "Explore";
  const list = document.createElement("ul");
  list.className = "site-footer__links list-unstyled mb-0";

  for (const item of footerLinks) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    listItem.append(link);
    list.append(listItem);
  }

  nav.append(navTitle, list);

  const help = document.createElement("div");
  help.className = "col-12 col-sm-6 col-lg-4";
  const helpTitle = document.createElement("h2");
  helpTitle.className = "site-footer__heading";
  helpTitle.textContent = "Plan your stay";
  const helpText = document.createElement("p");
  helpText.className = "site-footer__description mb-0";
  helpText.textContent =
    "Explore the hotel collection or sign in to manage your account.";
  help.append(helpTitle, helpText);

  const divider = document.createElement("div");
  divider.className = "col-12";
  const bottom = document.createElement("div");
  bottom.className = "site-footer__bottom d-flex flex-column flex-md-row justify-content-between gap-2";

  const copyright = document.createElement("p");
  copyright.className = "site-footer__legal mb-0";
  copyright.textContent = `© ${new Date().getFullYear()} Hotel Booking. All rights reserved.`;
  const note = document.createElement("p");
  note.className = "site-footer__legal mb-0";
  note.textContent = "Stay curious. Travel well.";
  bottom.append(copyright, note);

  content.append(brand, nav, help, divider);
  content.lastElementChild.append(bottom);
  container.append(content);
  footer.append(container);
  return footer;
}
