(() => {
  if (window.__HOTEL_BOOKING_VITE__ === true) {
    return;
  }

  const app = document.querySelector("#app");
  const entryScript = document.currentScript;
  const entry = app?.dataset.entry;

  if (!entryScript || !app || !entry) {
    throw new Error("Page is missing its static-file fallback configuration.");
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
        { label: "Back to hotels", route: "hotels" },
      ],
    },
    login: {
      title: "Log in",
      description:
        "Sign-in requires the Vite development server and your local Supabase configuration. Run npm run dev to use authentication.",
      layout: "auth",
      links: [{ label: "Create an account", route: "register" }],
    },
    register: {
      title: "Create an account",
      description:
        "Registration requires the Vite development server and your local Supabase configuration. Run npm run dev to create an account.",
      layout: "auth",
      links: [{ label: "Already registered? Log in", route: "login" }],
    },
    "reset-password": {
      title: "Reset password",
      description:
        "Password resets require the Vite development server and your local Supabase configuration. Open the reset link from your email with the site running.",
      layout: "auth",
      links: [{ label: "Return to log in", route: "login" }],
    },
    account: {
      title: "Account",
      description:
        "Account management requires Vite and the configured Supabase project. Run npm run dev and sign in to access your profile.",
      links: [{ label: "Log in", route: "login" }],
    },
    admin: {
      title: "Administration",
      description:
        "Hotel administration tools will be implemented in a later milestone.",
      layout: "admin",
      links: [{ label: "Manage hotels", route: "admin/hotels" }],
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
  };

  const routeFiles = {
    home: "index.html",
    hotels: "pages/hotels/index.html",
    hotel: "pages/hotel/index.html",
    login: "pages/login/index.html",
    register: "pages/register/index.html",
    "reset-password": "pages/reset-password/index.html",
    account: "pages/account/index.html",
    admin: "pages/admin/index.html",
    "admin/hotels": "pages/admin/hotels/index.html",
    "admin/hotel-edit": "pages/admin/hotel-edit/index.html",
  };

  const page = routes[entry];
  if (!page) {
    throw new Error(`Unknown page entry: ${entry}`);
  }

  const favicon =
    document.querySelector('link[rel="icon"]') ?? document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/svg+xml";
  favicon.href = new URL("public/favicon.svg", projectRoot).href;
  if (!favicon.isConnected) {
    document.head.append(favicon);
  }
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

    const brandText = admin ? "Hotel Booking Admin" : "Hotel Booking";
    const brand = createLink(
      brandText,
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
    main.className = entry === "home" ? "file-main file-main--hero" : "file-main";

    const content = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "file-eyebrow";
    eyebrow.textContent =
      page.layout === "admin" ? "PROPERTY MANAGEMENT" : "YOUR NEXT GETAWAY";

    const heading = document.createElement("h1");
    heading.textContent = page.title;

    const description = document.createElement("p");
    description.className = "file-description";
    description.textContent = page.description;
    content.append(eyebrow, heading, description);

    if (page.links.length > 0) {
      const linkList = document.createElement("ul");
      linkList.className = "file-actions";
      page.links.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.append(
          createLink(
            item.label,
            item.route,
            entry === "home" && index > 0
              ? "file-button file-button--outline"
              : "file-button",
          ),
        );
        linkList.append(listItem);
      });
      content.append(linkList);
    }
    main.append(content);
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
      "Find your next favorite place to stay and make every journey memorable.";
    footerBrand.append(footerTitle, footerDescription);

    const footerNav = document.createElement("nav");
    footerNav.setAttribute("aria-label", "Footer navigation");
    footerNav.append(
      createLink("Browse hotels", "hotels"),
      createLink("Sign in", "login"),
    );
    const copyright = document.createElement("p");
    copyright.textContent = `© ${new Date().getFullYear()} Hotel Booking. All rights reserved.`;
    footer.append(footerBrand, footerNav, copyright);
    shell.append(footer);
  }

  app.replaceChildren(shell);
})();
