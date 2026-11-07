import { createAuthLayout } from "../../app/layouts/AuthLayout.js";
import { getSupabaseConfigurationError } from "../../services/supabase.js";

export function mountAuthPage({ title, description }) {
  const app = document.querySelector("#app");
  if (!app) {
    throw new Error('Page is missing the required "#app" element.');
  }

  app.replaceChildren(createAuthLayout({ title, description }));
  const content = app.querySelector("#main-content");
  if (!content) {
    throw new Error("The authentication page is missing its main content area.");
  }
  return content;
}

export function createStatusMessage() {
  const message = document.createElement("div");
  message.className = "alert d-none auth-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  return message;
}

export function setStatusMessage(element, message, type = "danger") {
  element.className = `alert alert-${type} auth-message`;
  element.textContent = message;
}

export function clearStatusMessage(element) {
  element.className = "alert d-none auth-message";
  element.textContent = "";
}

export function addConfigurationNotice(element) {
  const error = getSupabaseConfigurationError();
  if (error) {
    setStatusMessage(element, error, "warning");
  }
}

export function createField({
  id,
  label,
  type = "text",
  autocomplete,
  required = true,
  maxLength = 80,
  minLength,
  pattern,
  help,
}) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-3";

  const labelElement = document.createElement("label");
  labelElement.className = "form-label fw-semibold";
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.className = "form-control";
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = required;
  if (autocomplete) {
    input.autocomplete = autocomplete;
  }
  if (maxLength) {
    input.maxLength = maxLength;
  }
  if (minLength) {
    input.minLength = minLength;
  }
  if (pattern) {
    input.pattern = pattern;
  }

  const invalidMessage = document.createElement("div");
  invalidMessage.id = `${id}-feedback`;
  invalidMessage.className = "invalid-feedback";
  invalidMessage.textContent = help ?? `Enter your ${label.toLowerCase()}.`;
  input.setAttribute("aria-describedby", invalidMessage.id);

  wrapper.append(labelElement, input, invalidMessage);
  return { wrapper, input };
}

export function createPasswordField({
  id,
  label,
  autocomplete,
  help,
  minLength = 12,
  requireSecurePassword = false,
}) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-3";

  const labelElement = document.createElement("label");
  labelElement.className = "form-label fw-semibold";
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group has-validation";

  const input = document.createElement("input");
  input.className = "form-control";
  input.id = id;
  input.name = id;
  input.type = "password";
  input.autocomplete = autocomplete;
  input.required = true;
  input.minLength = minLength;
  if (requireSecurePassword) {
    input.pattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{12,}";
  }

  const toggle = document.createElement("button");
  toggle.className = "btn btn-outline-secondary";
  toggle.type = "button";
  toggle.setAttribute("aria-controls", id);
  toggle.setAttribute("aria-label", `Show ${label.toLowerCase()}`);
  toggle.textContent = "Show";
  toggle.addEventListener("click", () => {
    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    toggle.textContent = shouldShow ? "Hide" : "Show";
    toggle.setAttribute(
      "aria-label",
      `${shouldShow ? "Hide" : "Show"} ${label.toLowerCase()}`,
    );
    input.focus();
  });
  const invalidMessage = document.createElement("div");
  invalidMessage.id = `${id}-feedback`;
  invalidMessage.className = "invalid-feedback";
  invalidMessage.textContent =
    help ??
    (requireSecurePassword
      ? `Use at least ${minLength} characters with an uppercase letter, a lowercase letter, a number, and a symbol.`
      : `Enter a password with at least ${minLength} characters.`);

  input.setAttribute("aria-describedby", invalidMessage.id);
  inputGroup.append(input, toggle, invalidMessage);
  wrapper.append(labelElement, inputGroup);
  return { wrapper, input };
}

export function createSubmitButton(label) {
  const button = document.createElement("button");
  button.className = "btn btn-primary w-100 mt-2";
  button.type = "submit";
  button.textContent = label;
  return button;
}

export function setSubmitPending(button, pending, label) {
  button.disabled = pending;
  button.setAttribute("aria-busy", String(pending));
  button.replaceChildren();

  if (pending) {
    const spinner = document.createElement("span");
    spinner.className = "spinner-border spinner-border-sm me-2";
    spinner.setAttribute("aria-hidden", "true");
    button.append(spinner);
  }
  button.append(document.createTextNode(pending ? "Please wait..." : label));
}

export function validateForm(form) {
  form.classList.add("was-validated");
  const invalidField = form.querySelector(":invalid");
  if (invalidField) {
    invalidField.focus();
    return false;
  }
  return true;
}

export function createPageLink(label, href, prefix) {
  const paragraph = document.createElement("p");
  paragraph.className = "text-center mt-4 mb-0";
  paragraph.append(document.createTextNode(prefix));

  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  paragraph.append(" ", link);
  return paragraph;
}
