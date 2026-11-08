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
import { registerUser } from "../../services/auth-service.js";
import { redirectIfAuthenticated } from "../../utils/auth-guard.js";

const securePasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function renderRegistrationPage() {
  const content = mountAuthPage({
    title: "Create an account",
    description: "Create a guest account to manage your reservations.",
  });
  const status = createStatusMessage();
  addConfigurationNotice(status);

  const form = document.createElement("form");
  form.className = "auth-form auth-modal__form";
  form.noValidate = true;

  const { wrapper: firstNameWrapper, input: firstNameInput } = createField({
    id: "first-name",
    label: "First name",
    autocomplete: "given-name",
    help: "Enter a first name between 1 and 80 characters.",
  });
  const { wrapper: lastNameWrapper, input: lastNameInput } = createField({
    id: "last-name",
    label: "Last name",
    autocomplete: "family-name",
    help: "Enter a last name between 1 and 80 characters.",
  });
  const { wrapper: emailWrapper, input: emailInput } = createField({
    id: "email",
    label: "Email",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  });
  const { wrapper: phoneWrapper, input: phoneInput } = createField({
    id: "phone",
    label: "Phone number (optional)",
    type: "tel",
    autocomplete: "tel",
    required: false,
    maxLength: 32,
  });
  const { wrapper: passwordWrapper, input: passwordInput } =
    createPasswordField({
      id: "password",
      label: "Password",
      autocomplete: "new-password",
      requireSecurePassword: true,
    });
  const { wrapper: confirmationWrapper, input: confirmationInput } =
    createPasswordField({
      id: "confirm-password",
      label: "Confirm password",
      autocomplete: "new-password",
      help: "Enter the same password again.",
    });

  const termsWrapper = document.createElement("div");
  termsWrapper.className = "form-check mb-3";
  const termsInput = document.createElement("input");
  termsInput.className = "form-check-input";
  termsInput.id = "terms";
  termsInput.type = "checkbox";
  termsInput.required = true;
  const termsLabel = document.createElement("label");
  termsLabel.className = "form-check-label";
  termsLabel.htmlFor = termsInput.id;
  termsLabel.textContent = "I accept the Terms and Conditions.";
  const termsFeedback = document.createElement("div");
  termsFeedback.className = "invalid-feedback";
  termsFeedback.textContent =
    "Please accept the Terms and Conditions to create your account.";
  termsWrapper.append(termsInput, termsLabel, termsFeedback);

  const submitButton = createSubmitButton("Create account");
  form.append(
    firstNameWrapper,
    lastNameWrapper,
    emailWrapper,
    phoneWrapper,
    passwordWrapper,
    confirmationWrapper,
    termsWrapper,
    submitButton,
  );
  content.append(
    status,
    form,
    createPageLink("Log in", "/login/", "Already have an account?"),
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

  firstNameInput.addEventListener("input", () =>
    updateNameValidity(firstNameInput),
  );
  lastNameInput.addEventListener("input", () =>
    updateNameValidity(lastNameInput),
  );
  passwordInput.addEventListener("input", updatePasswordValidity);
  confirmationInput.addEventListener("input", updatePasswordValidity);
  form.addEventListener("input", () => clearStatusMessage(status));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) {
      return;
    }
    clearStatusMessage(status);
    updateNameValidity(firstNameInput);
    updateNameValidity(lastNameInput);
    updatePasswordValidity();
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(submitButton, true, "Create account");
    try {
      const result = await registerUser({
        email: emailInput.value,
        password: passwordInput.value,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        phone: phoneInput.value,
      });

      if (result.confirmationRequired) {
        form.reset();
        form.classList.remove("was-validated");
        setStatusMessage(
          status,
          "If this email can be registered, check your inbox for a confirmation link. After confirming, you can sign in.",
          "success",
        );
        return;
      }

      setStatusMessage(status, "Your account has been created.", "success");
      window.location.replace("/account/");
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(submitButton, false, "Create account");
    }
  });

  redirectIfAuthenticated((error) => setStatusMessage(status, error.message));
}
