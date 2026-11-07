import "../main.js";
import {
  clearStatusMessage,
  createPageLink,
  createPasswordField,
  createStatusMessage,
  createSubmitButton,
  mountAuthPage,
  setStatusMessage,
  setSubmitPending,
  validateForm,
} from "../features/auth/auth-ui.js";
import { getAuthenticatedUser, updatePassword } from "../services/auth-service.js";
import { getSupabaseConfigurationError } from "../services/supabase.js";

const securePasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

const content = mountAuthPage({
  title: "Choose a new password",
  description: "Use a secure password to protect your account.",
});
const status = createStatusMessage();
const form = document.createElement("form");
form.className = "auth-form";
form.noValidate = true;

const { wrapper: passwordWrapper, input: passwordInput } =
  createPasswordField({
    id: "reset-password-new",
    label: "New password",
    autocomplete: "new-password",
    requireSecurePassword: true,
  });
const { wrapper: confirmationWrapper, input: confirmationInput } =
  createPasswordField({
    id: "reset-password-confirm",
    label: "Confirm new password",
    autocomplete: "new-password",
  });
const submit = createSubmitButton("Update password");
form.append(passwordWrapper, confirmationWrapper, submit);
content.append(status, form, createPageLink("Return to log in", "/login/", ""));

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

passwordInput.addEventListener("input", updatePasswordValidity);
confirmationInput.addEventListener("input", updatePasswordValidity);
form.addEventListener("input", () => clearStatusMessage(status));
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submit.disabled) {
    return;
  }
  clearStatusMessage(status);
  updatePasswordValidity();
  if (!validateForm(form)) {
    return;
  }

  setSubmitPending(submit, true, "Update password");
  try {
    await updatePassword(passwordInput.value);
    setStatusMessage(
      status,
      "Your password has been updated. You can now sign in with it.",
      "success",
    );
    form.reset();
    form.classList.remove("was-validated");
    window.setTimeout(() => window.location.replace("/account/"), 1200);
  } catch (error) {
    setStatusMessage(status, error.message);
  } finally {
    setSubmitPending(submit, false, "Update password");
  }
});

async function checkRecoverySession() {
  const configurationError = getSupabaseConfigurationError();
  if (configurationError) {
    setStatusMessage(status, configurationError, "warning");
    form.hidden = true;
    return;
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      form.hidden = true;
      setStatusMessage(
        status,
        "This password reset link is invalid or has expired. Return to log in and request a new link.",
        "warning",
      );
    }
  } catch (error) {
    form.hidden = true;
    setStatusMessage(status, error.message, "warning");
  }
}

void checkRecoverySession();
