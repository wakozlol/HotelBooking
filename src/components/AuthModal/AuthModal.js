import { Modal } from "bootstrap";
import {
  clearStatusMessage,
  createField,
  createPasswordField,
  createStatusMessage,
  setStatusMessage,
  setSubmitPending,
  validateForm,
} from "../../features/auth/auth-ui.js";
import {
  registerUser,
  requestPasswordReset,
  signInUser,
} from "../../services/auth-service.js";
import { getSupabaseConfigurationError } from "../../services/supabase.js";
import "./AuthModal.css";

const securePasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

function createCloseButton() {
  const button = document.createElement("button");
  button.className = "btn-close";
  button.type = "button";
  button.setAttribute("data-bs-dismiss", "modal");
  button.setAttribute("aria-label", "Close");
  return button;
}

function createModalShell({ id, title, description, wide = false }) {
  const modal = document.createElement("div");
  modal.id = id;
  modal.className = "modal fade auth-modal";
  modal.tabIndex = -1;
  modal.setAttribute("aria-labelledby", `${id}-title`);
  modal.setAttribute("aria-describedby", `${id}-description`);
  modal.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = `modal-dialog modal-dialog-centered ${wide ? "modal-lg" : ""}`;

  const content = document.createElement("div");
  content.className = "modal-content";

  const header = document.createElement("div");
  header.className = "modal-header border-0 pb-0";

  const intro = document.createElement("div");
  intro.className = "auth-modal__intro";
  const eyebrow = document.createElement("p");
  eyebrow.className = "auth-modal__eyebrow mb-2";
  eyebrow.textContent = "HOTEL BOOKING";
  const heading = document.createElement("h2");
  heading.id = `${id}-title`;
  heading.className = "modal-title h3 fw-bold";
  heading.textContent = title;
  const supportingText = document.createElement("p");
  supportingText.id = `${id}-description`;
  supportingText.className = "auth-modal__description mb-0";
  supportingText.textContent = description;
  intro.append(eyebrow, heading, supportingText);
  header.append(intro, createCloseButton());

  const body = document.createElement("div");
  body.className = "modal-body pt-4";
  const status = createStatusMessage();

  const footer = document.createElement("div");
  footer.className = "modal-footer justify-content-center border-0 pt-0";

  content.append(header, body, footer);
  dialog.append(content);
  modal.append(dialog);
  return { modal, body, footer, status };
}

function createSubmitButton(label, primary = true) {
  const button = document.createElement("button");
  button.className = `btn ${primary ? "btn-primary" : "btn-outline-primary"} auth-modal__submit`;
  button.type = "submit";
  button.textContent = label;
  return button;
}

function createFooterSwitch(prefix, label, action) {
  const text = document.createElement("p");
  text.className = "mb-0 text-center small text-body-secondary";
  text.append(document.createTextNode(prefix));

  const button = document.createElement("button");
  button.className = "btn btn-link p-0 ms-1 auth-modal__switch";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  text.append(button);
  return text;
}

function createPasswordResetForm(status) {
  const form = document.createElement("form");
  form.className = "auth-modal__form";
  form.noValidate = true;
  const { wrapper: emailWrapper, input: emailInput } = createField({
    id: "auth-reset-email",
    label: "Email address",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const submit = createSubmitButton("Send reset link");
  form.append(emailWrapper, submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) {
      return;
    }
    clearStatusMessage(status);
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(submit, true, "Send reset link");
    try {
      await requestPasswordReset(emailInput.value);
      form.reset();
      setStatusMessage(
        status,
        "If an account matches that email, a password reset link will be sent.",
        "success",
      );
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(submit, false, "Send reset link");
    }
  });
  return form;
}

function createLoginForm(
  status,
  { onAuthenticated, switchToRegister, onForgotPassword },
) {
  const form = document.createElement("form");
  form.className = "auth-modal__form";
  form.noValidate = true;

  const { wrapper: emailWrapper, input: emailInput } = createField({
    id: "auth-login-email",
    label: "Email address",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const { wrapper: passwordWrapper, input: passwordInput } =
    createPasswordField({
      id: "auth-login-password",
      label: "Password",
      autocomplete: "current-password",
      minLength: 1,
    });

  const forgotLink = document.createElement("button");
  forgotLink.className = "btn btn-link p-0 small auth-modal__switch";
  forgotLink.type = "button";
  forgotLink.textContent = "Forgot password?";

  const submit = createSubmitButton("Log in");
  form.append(emailWrapper, passwordWrapper, forgotLink, submit);

  forgotLink.addEventListener("click", onForgotPassword);
  form.addEventListener("input", () => clearStatusMessage(status));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) {
      return;
    }
    clearStatusMessage(status);
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(submit, true, "Log in");
    try {
      const user = await signInUser({
        email: emailInput.value,
        password: passwordInput.value,
      });
      onAuthenticated(user);
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(submit, false, "Log in");
    }
  });

  return {
    form,
    footer: createFooterSwitch(
      "Don't have an account?",
      "Create account",
      switchToRegister,
    ),
  };
}

function createRegisterForm(status, { onAuthenticated, switchToLogin }) {
  const form = document.createElement("form");
  form.className = "auth-modal__form";
  form.noValidate = true;

  const nameRow = document.createElement("div");
  nameRow.className = "row g-3";
  const { wrapper: firstNameWrapper, input: firstNameInput } = createField({
    id: "auth-register-first-name",
    label: "First name",
    autocomplete: "given-name",
  });
  firstNameWrapper.classList.remove("mb-3");
  firstNameWrapper.classList.add("col-md-6");
  const { wrapper: lastNameWrapper, input: lastNameInput } = createField({
    id: "auth-register-last-name",
    label: "Last name",
    autocomplete: "family-name",
  });
  lastNameWrapper.classList.remove("mb-3");
  lastNameWrapper.classList.add("col-md-6");
  nameRow.append(firstNameWrapper, lastNameWrapper);

  const { wrapper: emailWrapper, input: emailInput } = createField({
    id: "auth-register-email",
    label: "Email address",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const { wrapper: passwordWrapper, input: passwordInput } =
    createPasswordField({
      id: "auth-register-password",
      label: "Password",
      autocomplete: "new-password",
      requireSecurePassword: true,
    });
  const { wrapper: confirmationWrapper, input: confirmationInput } =
    createPasswordField({
      id: "auth-register-confirm-password",
      label: "Confirm password",
      autocomplete: "new-password",
      help: "Enter the same password again.",
    });

  const termsWrapper = document.createElement("div");
  termsWrapper.className = "form-check mb-3";
  const terms = document.createElement("input");
  terms.className = "form-check-input";
  terms.id = "auth-register-terms";
  terms.type = "checkbox";
  terms.required = true;
  const termsLabel = document.createElement("label");
  termsLabel.className = "form-check-label small";
  termsLabel.htmlFor = terms.id;
  termsLabel.textContent = "I accept the Terms and Conditions.";
  const termsFeedback = document.createElement("div");
  termsFeedback.className = "invalid-feedback";
  termsFeedback.textContent = "Please accept the Terms and Conditions to continue.";
  termsWrapper.append(terms, termsLabel, termsFeedback);

  const submit = createSubmitButton("Create account");
  form.append(
    nameRow,
    emailWrapper,
    passwordWrapper,
    confirmationWrapper,
    termsWrapper,
    submit,
  );

  function updateNameValidity(input) {
    input.setCustomValidity(
      input.value.trim().length > 0 && input.value.trim().length <= 80
        ? ""
        : "Enter a name between 1 and 80 characters.",
    );
  }

  function updatePasswordValidity() {
    passwordInput.setCustomValidity(
      securePasswordPattern.test(passwordInput.value)
        ? ""
        : "Use at least 12 characters with an uppercase letter, a lowercase letter, a number, and a symbol.",
    );
    confirmationInput.setCustomValidity(
      confirmationInput.value === passwordInput.value
        ? ""
        : "The passwords do not match.",
    );
  }

  firstNameInput.addEventListener("input", () => updateNameValidity(firstNameInput));
  lastNameInput.addEventListener("input", () => updateNameValidity(lastNameInput));
  passwordInput.addEventListener("input", updatePasswordValidity);
  confirmationInput.addEventListener("input", updatePasswordValidity);
  form.addEventListener("input", () => clearStatusMessage(status));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) {
      return;
    }
    clearStatusMessage(status);
    updateNameValidity(firstNameInput);
    updateNameValidity(lastNameInput);
    updatePasswordValidity();
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(submit, true, "Create account");
    try {
      const result = await registerUser({
        email: emailInput.value,
        password: passwordInput.value,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
      });
      if (result.confirmationRequired) {
        form.reset();
        form.classList.remove("was-validated");
        setStatusMessage(
          status,
          "If this email can be registered, check your inbox for a confirmation link. Your account is not signed in until you confirm.",
          "success",
        );
        return;
      }

      setStatusMessage(status, "Your account is ready. You're signed in.", "success");
      onAuthenticated(result.user);
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(submit, false, "Create account");
    }
  });

  return {
    form,
    footer: createFooterSwitch(
      "Already have an account?",
      "Log in",
      switchToLogin,
    ),
  };
}

export function createAuthModal({ onAuthenticated = () => {} } = {}) {
  const root = document.createElement("div");
  root.className = "auth-modal-host";

  const loginShell = createModalShell({
    id: "site-login-modal",
    title: "Welcome back",
    description: "Sign in to pick up where your next stay begins.",
  });
  const registerShell = createModalShell({
    id: "site-register-modal",
    title: "Create your account",
    description: "A few details, and your next getaway is closer.",
    wide: true,
  });

  root.append(loginShell.modal, registerShell.modal);
  const modals = new Map([
    ["login", new Modal(loginShell.modal, { backdrop: true, keyboard: true, focus: true })],
    ["register", new Modal(registerShell.modal, { backdrop: true, keyboard: true, focus: true })],
  ]);
  const configurationError = getSupabaseConfigurationError();
  let activeModal = null;
  let pendingModal = null;
  let returnFocusTarget = null;

  function show(name) {
    if (activeModal === name) {
      return;
    }
    const target = modals.get(name);
    if (!target) {
      throw new Error(`Unknown authentication modal: ${name}`);
    }
    if (name === "login") {
      showLoginView();
    }
    const targetStatus =
      name === "login" ? loginShell.status : registerShell.status;
    clearStatusMessage(targetStatus);
    if (configurationError) {
      setStatusMessage(targetStatus, configurationError, "warning");
    }
    if (activeModal) {
      pendingModal = name;
      modals.get(activeModal).hide();
      return;
    }
    activeModal = name;
    target.show();
  }

  function openModal(name) {
    returnFocusTarget = document.activeElement;
    clearStatusMessage(loginShell.status);
    clearStatusMessage(registerShell.status);
    show(name);
  }

  let loginView;
  let resetView;

  function showLoginView() {
    if (resetView?.form.isConnected) {
      resetView.form.replaceWith(loginView.form);
      loginShell.footer.replaceChildren(loginView.footer);
    }
    clearStatusMessage(loginShell.status);
  }

  function showResetView() {
    clearStatusMessage(loginShell.status);
    loginView.form.replaceWith(resetView.form);
    loginShell.footer.replaceChildren(resetView.footer);
  }

  resetView = {
    form: createPasswordResetForm(loginShell.status),
    footer: createFooterSwitch("Remembered it?", "Back to log in", showLoginView),
  };

  loginView = createLoginForm(loginShell.status, {
    onAuthenticated: (user) => {
      clearStatusMessage(loginShell.status);
      modals.get("login").hide();
      onAuthenticated(user);
    },
    switchToRegister: () => show("register"),
    onForgotPassword: showResetView,
  });
  loginShell.body.append(loginShell.status, loginView.form);
  loginShell.footer.append(loginView.footer);

  const registerForm = createRegisterForm(registerShell.status, {
    onAuthenticated: (user) => {
      clearStatusMessage(registerShell.status);
      modals.get("register").hide();
      onAuthenticated(user);
    },
    switchToLogin: () => show("login"),
  });
  registerShell.body.append(registerShell.status, registerForm.form);
  registerShell.footer.append(registerForm.footer);

  if (configurationError) {
    for (const shell of [loginShell, registerShell]) {
      setStatusMessage(shell.status, configurationError, "warning");
    }
  }

  for (const [name, shell] of [
    ["login", loginShell],
    ["register", registerShell],
  ]) {
    shell.modal.addEventListener("shown.bs.modal", () => {
      shell.modal
        .querySelector(
          "input:not([type='hidden']):not([disabled]), button:not(.btn-close):not([disabled])",
        )
        ?.focus();
    });
    shell.modal.addEventListener("hidden.bs.modal", () => {
      if (activeModal === name) {
        activeModal = null;
      }
      if (pendingModal) {
        const nextModal = pendingModal;
        pendingModal = null;
        activeModal = nextModal;
        modals.get(nextModal).show();
        return;
      }
      if (returnFocusTarget?.isConnected) {
        returnFocusTarget.focus();
      }
    });
  }

  return { element: root, open: openModal };
}
