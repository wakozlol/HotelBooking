export function createPageContent({ title, description, links = [], hero = false }) {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = hero ? "home-hero" : "container page-content";

  const content = document.createElement("div");
  content.className = hero ? "container home-hero__content" : "";

  const heading = document.createElement("h1");
  heading.className = hero ? "display-2 fw-bold" : "display-5 fw-semibold";
  heading.textContent = title;
  content.append(heading);

  const intro = document.createElement("p");
  intro.className = hero
    ? "lead home-hero__description mt-3"
    : "lead text-body-secondary mt-3";
  intro.textContent = description;
  content.append(intro);

  if (links.length > 0) {
    const linkList = document.createElement("ul");
    linkList.className = "list-unstyled d-flex flex-wrap gap-3 mt-4";

    links.forEach((item, index) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.className = hero
        ? index === 0
          ? "btn btn-warning btn-lg fw-semibold"
          : "btn btn-outline-light btn-lg"
        : "btn btn-outline-primary";
      link.href = item.href;
      link.textContent = item.label;
      listItem.append(link);
      linkList.append(listItem);
    });

    content.append(linkList);
  }

  main.append(content);
  return main;
}
