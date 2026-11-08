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
import {
  requestPasswordReset,
  signInUser,
} from "../../services/auth-service.js";
import {
  redirectIfAuthenticated,
  takePostLoginRoute,
} from "../../utils/auth-guard.js";

export function renderLoginPage() {
  const isAdminLogin = window.sessionStorage
    .getItem("hotel-booking:redirect-after-login")
    ?.startsWith("/admin/");
  const content = mountAuthPage({
    title: isAdminLogin ? "Admin sign-in" : "Log in",
    description: isAdminLogin
      ? "Sign in with an authorized administrator account to continue."
      : "Sign in to manage your account and reservations.",
  });
  const status = createStatusMessage();
  addConfigurationNotice(status);

  const form = document.createElement("form");
  form.className = "auth-form auth-modal__form";
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

  const resetLink = document.createElement("button");
  resetLink.className = "btn btn-link p-0 auth-modal__switch mb-3";
  resetLink.type = "button";
  resetLink.textContent = "Forgot password?";

  const submitButton = createSubmitButton("Log in");
  form.append(
    emailWrapper,
    passwordWrapper,
    rememberWrapper,
    resetLink,
    submitButton,
  );
  const accountLink = createPageLink(
    "Create an account",
    "/register/",
    "New here?",
  );
  content.append(status, form, accountLink);

  const resetForm = document.createElement("form");
  resetForm.className = "auth-form auth-modal__form";
  resetForm.noValidate = true;
  const { wrapper: resetEmailWrapper, input: resetEmailInput } = createField({
    id: "reset-email",
    label: "Email address",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const resetSubmit = createSubmitButton("Send reset link");
  const backToLogin = document.createElement("button");
  backToLogin.className = "btn btn-link p-0 auth-modal__switch";
  backToLogin.type = "button";
  backToLogin.textContent = "Back to log in";
  resetForm.append(resetEmailWrapper, resetSubmit, backToLogin);

  resetLink.addEventListener("click", () => {
    resetEmailInput.value = emailInput.value;
    clearStatusMessage(status);
    form.replaceWith(resetForm);
    accountLink.hidden = true;
    resetEmailInput.focus();
  });

  backToLogin.addEventListener("click", () => {
    clearStatusMessage(status);
    resetForm.replaceWith(form);
    accountLink.hidden = false;
    emailInput.focus();
  });

  resetForm.addEventListener("input", () => clearStatusMessage(status));
  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (resetSubmit.disabled) {
      return;
    }
    clearStatusMessage(status);
    if (!validateForm(resetForm)) {
      return;
    }

    setSubmitPending(resetSubmit, true, "Send reset link");
    try {
      await requestPasswordReset(resetEmailInput.value);
      resetForm.reset();
      setStatusMessage(
        status,
        "If an account matches that email, a password reset link will be sent.",
        "success",
      );
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(resetSubmit, false, "Send reset link");
    }
  });

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
      stopRedirectIfAuthenticated();
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

  const stopRedirectIfAuthenticated = redirectIfAuthenticated((error) =>
    setStatusMessage(status, error.message),
  );
}
