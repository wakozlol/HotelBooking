export function createPageContent({ title, description, links = [] }) {
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "container page-content";

  const heading = document.createElement("h1");
  heading.className = "display-5 fw-semibold";
  heading.textContent = title;
  main.append(heading);

  const intro = document.createElement("p");
  intro.className = "lead text-body-secondary mt-3";
  intro.textContent = description;
  main.append(intro);

  if (links.length > 0) {
    const linkList = document.createElement("ul");
    linkList.className = "list-unstyled d-flex flex-wrap gap-3 mt-4";

    for (const item of links) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.className = "btn btn-outline-primary";
      link.href = item.href;
      link.textContent = item.label;
      listItem.append(link);
      linkList.append(listItem);
    }

    main.append(linkList);
  }

  return main;
}
