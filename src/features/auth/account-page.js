import { renderPage } from "../../app/App.js";
import { updateOwnProfile } from "../../services/profile-service.js";
import {
  createField,
  createStatusMessage,
  setStatusMessage,
  setSubmitPending,
  validateForm,
} from "./auth-ui.js";
import "./auth.css";

function formatCreatedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "Not available";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(date);
}

export function renderAccountPage(user, profile) {
  renderPage({
    title: "Your account",
    description: "Review your account information and update your profile.",
  });

  const content = document.querySelector("#main-content");
  if (!content) {
    throw new Error("The account page is missing its main content area.");
  }

  const card = document.createElement("section");
  card.className = "account-form";
  card.setAttribute("aria-label", "Account details");

  const emailField = createField({
    id: "account-email",
    label: "Email",
    type: "email",
    autocomplete: "email",
    required: false,
    maxLength: 254,
  });
  emailField.input.value = user.email ?? "";
  emailField.input.readOnly = true;
  emailField.input.classList.add("bg-body-secondary");

  const form = document.createElement("form");
  form.noValidate = true;
  form.append(emailField.wrapper);

  const { wrapper: firstNameWrapper, input: firstNameInput } = createField({
    id: "account-first-name",
    label: "First name",
    autocomplete: "given-name",
  });
  firstNameInput.value = profile.first_name;
  const { wrapper: lastNameWrapper, input: lastNameInput } = createField({
    id: "account-last-name",
    label: "Last name",
    autocomplete: "family-name",
  });
  lastNameInput.value = profile.last_name;
  form.append(firstNameWrapper, lastNameWrapper);

  const accountDetails = document.createElement("p");
  accountDetails.className = "account-details";
  const createdLabel = document.createElement("strong");
  createdLabel.textContent = "Member since";
  const createdDate = document.createElement("span");
  createdDate.textContent = formatCreatedDate(profile.created_at);
  accountDetails.append(createdLabel, createdDate);

  const status = createStatusMessage();
  const saveButton = document.createElement("button");
  saveButton.className = "btn btn-primary w-100";
  saveButton.type = "submit";
  saveButton.textContent = "Save changes";
  form.append(status, accountDetails, saveButton);
  card.append(form);
  content.append(card);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saveButton.disabled) {
      return;
    }
    status.className = "alert d-none auth-message";
    status.textContent = "";
    if (!validateForm(form)) {
      return;
    }

    setSubmitPending(saveButton, true, "Save changes");
    try {
      const updatedProfile = await updateOwnProfile(user.id, {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
      });
      firstNameInput.value = updatedProfile.first_name;
      lastNameInput.value = updatedProfile.last_name;
      createdDate.textContent = formatCreatedDate(updatedProfile.created_at);
      setStatusMessage(status, "Your profile has been updated.", "success");
    } catch (error) {
      setStatusMessage(status, error.message);
    } finally {
      setSubmitPending(saveButton, false, "Save changes");
    }
  });
}
