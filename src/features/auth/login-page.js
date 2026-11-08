import "./auth.css";
import {
  addConfigurationNotice,
  clearStatusMessage,
  createField,
  createPasswordField,
  createPageLink,
  createStatusMessage,
  createSubmitButton,
  mountAuthPage,
  setStatusMessage,
  setSubmitPending,
  validateForm,
} from "./auth-ui.js";
import { signInUser } from "../../services/auth-service.js";
import {
  redirectIfAuthenticated,
  takePostLoginRoute,
} from "../../utils/auth-guard.js";

export function renderLoginPage() {
  const content = mountAuthPage({
    title: "Log in",
    description: "Sign in to manage your account and reservations.",
  });
  const status = createStatusMessage();
  addConfigurationNotice(status);

  const form = document.createElement("form");
  form.className = "auth-form";
  form.noValidate = true;

  const { wrapper: emailWrapper, input: emailInput } = createField({
    id: "email",
    label: "Email",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const { wrapper: passwordWrapper, input: passwordInput } =
    createPasswordField({
      id: "password",
      label: "Password",
      autocomplete: "current-password",
      minLength: 1,
    });

  const rememberWrapper = document.createElement("div");
  rememberWrapper.className = "form-check mb-3";
  const rememberInput = document.createElement("input");
  rememberInput.className = "form-check-input";
  rememberInput.id = "remember-me";
  rememberInput.name = "rememberMe";
  rememberInput.type = "checkbox";
  rememberInput.checked = true;
  const rememberLabel = document.createElement("label");
  rememberLabel.className = "form-check-label";
  rememberLabel.htmlFor = rememberInput.id;
  rememberLabel.textContent = "Remember me";
  rememberWrapper.append(rememberInput, rememberLabel);

  const submitButton = createSubmitButton("Log in");
  form.append(emailWrapper, passwordWrapper, rememberWrapper, submitButton);
  content.append(status, form, createPageLink("Create an account", "/register/", "New here?"));

  form.addEventListener("input", () => clearStatusMessage(status));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) {
      return;
    }
    clearStatusMessage(status);
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(submitButton, true, "Log in");
    try {
      await signInUser({
        email: emailInput.value,
        password: passwordInput.value,
        rememberMe: rememberInput.checked,
      });
      window.location.replace(takePostLoginRoute());
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(submitButton, false, "Log in");
    }
  });

  redirectIfAuthenticated((error) => setStatusMessage(status, error.message));
}
