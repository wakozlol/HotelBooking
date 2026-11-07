(() => {
  const app = document.querySelector("#app");
  const entryScript = document.currentScript;
  const entry = app?.dataset.entry;

  if (window.location.protocol !== "file:") {
    return;
  }

  if (!entryScript || !app || !entry) {
    throw new Error("Page is missing its local-file fallback configuration.");
  }

  const projectRoot = new URL("../", entryScript.src);

  const routes = {
    home: {
      title: "Find your next stay",
      description:
        "Welcome to Hotel Booking. Browse hotels and plan your next stay.",
      links: [
        { label: "Browse hotels", route: "hotels" },
        { label: "Log in", route: "login" },
      ],
    },
    hotels: {
      title: "Hotels",
      description: "Hotel listings will appear here when browsing is implemented.",
      links: [{ label: "Example hotel details", route: "hotel" }],
    },
    hotel: {
      title: "Hotel details",
      description: "Hotel information and room availability will appear here.",
      links: [
        { label: "Continue to example booking", route: "booking" },
        { label: "Back to hotels", route: "hotels" },
      ],
    },
    booking: {
      title: "Booking",
      description:
        "Booking details and confirmation will be implemented in a later milestone.",
      links: [
        { label: "Log in", route: "login" },
        { label: "Browse hotels", route: "hotels" },
      ],
    },
    login: {
      title: "Log in",
      description:
        "Guest authentication will be implemented in a later milestone.",
      layout: "auth",
      links: [{ label: "Create an account", route: "register" }],
    },
    register: {
      title: "Create an account",
      description: "Guest registration will be implemented in a later milestone.",
      layout: "auth",
      links: [{ label: "Already registered? Log in", route: "login" }],
    },
    "booking-confirmation": {
      title: "Booking confirmation",
      description:
        "Booking confirmation details will appear here when booking is implemented.",
      links: [
        { label: "View example booking details", route: "booking-details" },
        { label: "My bookings", route: "my-bookings" },
      ],
    },
    "my-bookings": {
      title: "My bookings",
      description:
        "Your booking history will appear here after guest accounts and reservations are implemented.",
      links: [
        { label: "Log in", route: "login" },
        { label: "Browse hotels", route: "hotels" },
      ],
    },
    "booking-details": {
      title: "Booking details",
      description: "Details for the selected booking will appear here.",
      links: [{ label: "Back to my bookings", route: "my-bookings" }],
    },
    account: {
      title: "Account",
      description: "Account settings will be implemented with guest authentication.",
      links: [
        { label: "Log in", route: "login" },
        { label: "My bookings", route: "my-bookings" },
      ],
    },
    admin: {
      title: "Administration",
      description:
        "Hotel administration tools will be implemented in a later milestone.",
      layout: "admin",
      links: [
        { label: "Manage hotels", route: "admin/hotels" },
        { label: "Manage rooms", route: "admin/rooms" },
        { label: "Manage bookings", route: "admin/bookings" },
      ],
    },
    "admin-hotels": {
      title: "Manage hotels",
      description:
        "Hotel administration will be implemented in a later milestone.",
      layout: "admin",
      links: [
        { label: "Edit example hotel", route: "admin/hotel-edit" },
        { label: "Admin home", route: "admin" },
      ],
    },
    "admin-hotel-edit": {
      title: "Edit hotel",
      description: "Hotel editing will be implemented in a later milestone.",
      layout: "admin",
      links: [{ label: "Back to hotels", route: "admin/hotels" }],
    },
    "admin-rooms": {
      title: "Manage rooms",
      description: "Room administration will be implemented in a later milestone.",
      layout: "admin",
      links: [
        { label: "Manage hotels", route: "admin/hotels" },
        { label: "Admin home", route: "admin" },
      ],
    },
    "admin-bookings": {
      title: "Manage bookings",
      description:
        "Reservation administration will be implemented in a later milestone.",
      layout: "admin",
      links: [{ label: "Admin home", route: "admin" }],
    },
  };

  const routeFiles = {
    home: "index.html",
    hotels: "pages/hotels/index.html",
    hotel: "pages/hotel/index.html",
    booking: "pages/booking/index.html",
    login: "pages/login/index.html",
    register: "pages/register/index.html",
    "booking-confirmation": "pages/booking-confirmation/index.html",
    "my-bookings": "pages/my-bookings/index.html",
    "booking-details": "pages/booking-details/index.html",
    account: "pages/account/index.html",
    admin: "pages/admin/index.html",
    "admin/hotels": "pages/admin/hotels/index.html",
    "admin/hotel-edit": "pages/admin/hotel-edit/index.html",
    "admin/rooms": "pages/admin/rooms/index.html",
    "admin/bookings": "pages/admin/bookings/index.html",
  };

  const page = routes[entry];
  if (!page) {
    throw new Error(`Unknown page entry: ${entry}`);
  }

  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/svg+xml";
  favicon.href = new URL("public/favicon.svg", projectRoot).href;
  document.head.append(favicon);
  document.title = `${page.title} | Hotel Booking`;

  function createLink(label, route, className = "") {
    const link = document.createElement("a");
    link.href = new URL(routeFiles[route], projectRoot).href;
    link.textContent = label;
    if (className) {
      link.className = className;
    }
    return link;
  }

  function createHeader(admin = false) {
    const header = document.createElement("header");
    header.className = admin ? "file-header file-header--admin" : "file-header";

    const brand = createLink(
      admin ? "Hotel Booking Admin" : "Hotel Booking",
      admin ? "admin" : "home",
      "file-brand",
    );
    header.append(brand);

    if (admin) {
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", "Administration");
      for (const [label, route] of [
        ["Overview", "admin"],
        ["Hotels", "admin/hotels"],
        ["Rooms", "admin/rooms"],
        ["Bookings", "admin/bookings"],
      ]) {
        nav.append(createLink(label, route));
      }
      header.append(nav, createLink("View website", "home"));
      return header;
    }

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Main navigation");
    for (const [label, route] of [
      ["Hotels", "hotels"],
      ["My bookings", "my-bookings"],
      ["Account", "account"],
    ]) {
      nav.append(createLink(label, route));
    }
    const accountLinks = document.createElement("div");
    accountLinks.className = "file-header__account";
    accountLinks.append(
      createLink("Log in", "login"),
      createLink("Register", "register", "file-button"),
    );
    header.append(nav, accountLinks);
    return header;
  }

  function createMain() {
    const main = document.createElement("main");
    main.id = "main-content";
    main.className = "file-main";

    const eyebrow = document.createElement("p");
    eyebrow.className = "file-eyebrow";
    eyebrow.textContent =
      page.layout === "admin" ? "PROPERTY MANAGEMENT" : "YOUR NEXT GETAWAY";

    const heading = document.createElement("h1");
    heading.textContent = page.title;

    const description = document.createElement("p");
    description.className = "file-description";
    description.textContent = page.description;
    main.append(eyebrow, heading, description);

    const linkList = document.createElement("ul");
    linkList.className = "file-actions";
    for (const item of page.links) {
      const listItem = document.createElement("li");
      listItem.append(
        createLink(item.label, item.route, "file-button"),
      );
      linkList.append(listItem);
    }
    main.append(linkList);
    return main;
  }

  const shell = document.createElement("div");
  shell.className = `file-site file-site--${page.layout ?? "public"}`;
  if (page.layout !== "auth") {
    shell.append(createHeader(page.layout === "admin"));
  } else {
    const authHeader = document.createElement("header");
    authHeader.className = "file-auth-header";
    authHeader.append(createLink("Hotel Booking", "home", "file-brand"));
    shell.append(authHeader);
  }

  shell.append(createMain());

  if (!page.layout || page.layout === "main") {
    const footer = document.createElement("footer");
    footer.className = "file-footer";
    const footerBrand = document.createElement("div");
    const footerTitle = document.createElement("strong");
    footerTitle.textContent = "Hotel Booking";
    const footerDescription = document.createElement("p");
    footerDescription.textContent =
      "Find a comfortable stay for your next trip.";
    footerBrand.append(footerTitle, footerDescription);

    const footerNav = document.createElement("nav");
    footerNav.setAttribute("aria-label", "Footer navigation");
    footerNav.append(
      createLink("Browse hotels", "hotels"),
      createLink("My bookings", "my-bookings"),
      createLink("Sign in", "login"),
    );
    footer.append(footerBrand, footerNav);
    shell.append(footer);
  }

  app.replaceChildren(shell);
})();
