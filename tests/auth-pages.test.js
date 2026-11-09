import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.value = "";
    this.textContent = "";
    this.classList = { add() {}, remove() {} };
  }

  append(...children) {
    this.children.push(...children.filter((child) => typeof child !== "string"));
  }

  replaceChildren(...children) {
    this.children = [];
    this.append(...children);
  }

  setAttribute() {}
  setCustomValidity() {}
  focus() {}
  addEventListener(type, listener) {
    (this.listeners[type] ??= []).push(listener);
  }

  querySelector(selector) {
    if (selector === ":invalid") return null;
    return find(this, (element) => selector === `#${element.id}`);
  }

  async dispatch(type) {
    for (const listener of this.listeners[type] ?? []) {
      await listener({ preventDefault() {} });
    }
  }
}

function find(element, predicate) {
  if (predicate(element)) return element;
  for (const child of element.children) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return null;
}

const app = new Element("div");
const storage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = {
  documentElement: { dir: "ltr" },
  createElement: (tag) => new Element(tag),
  createTextNode: (text) => ({ textContent: text, children: [] }),
  querySelector: (selector) => selector === "#app" ? app : null,
  addEventListener() {},
};
globalThis.window = {
  sessionStorage: storage,
  localStorage: storage,
  location: { origin: "https://example.invalid", replace() {} },
  addEventListener() {},
};

const vite = await createServer({
  configFile: false, envFile: false, appType: "custom",
  plugins: [{
    name: "stub-unrelated-page-layout",
    enforce: "pre",
    resolveId(source) {
      if (source.replaceAll("\\", "/").endsWith("/app/App.js")) return "\0test-app-layout";
    },
    load(id) {
      if (id === "\0test-app-layout") return "export function renderPage() {}";
    },
  }],
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(""),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(""),
  },
});
const { renderLoginPage } = await vite.ssrLoadModule("/src/features/auth/login-page.js");
const { renderRegistrationPage } = await vite.ssrLoadModule("/src/features/auth/register-page.js");
after(async () => {
  await vite.close();
  delete globalThis.window;
  delete globalThis.document;
});

for (const [name, render, oppositeRoute] of [
  ["login", renderLoginPage, "/register/"],
  ["registration", renderRegistrationPage, "/login/"],
]) {
  test(`${name} retains its configuration warning while editing and submitting`, async () => {
    render();
    const warning = find(app, (element) => element.className?.includes("alert-warning"));
    const form = find(app, (element) => element.tagName === "form");
    const link = find(app, (element) => element.href === oppositeRoute);
    assert.ok(link);
    assert.match(warning.textContent, /VITE_SUPABASE_URL/);
    for (const [id, value] of [
      ["email", "guest@example.invalid"], ["password", "TestPassword1!"],
      ["confirm-password", "TestPassword1!"], ["first-name", "Guest"], ["last-name", "Example"],
    ]) {
      const input = find(form, (element) => element.id === id);
      if (input) input.value = value;
    }
    await form.dispatch("input");
    assert.match(warning.className, /alert-warning/);
    await form.dispatch("submit");
    assert.match(warning.textContent, /VITE_SUPABASE_URL/);
    const error = find(app, (element) => element.className?.includes("alert-danger"));
    assert.match(error.textContent, /VITE_SUPABASE_URL/);
  });
}
