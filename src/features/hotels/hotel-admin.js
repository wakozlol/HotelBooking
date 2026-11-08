import { Modal } from "bootstrap";
import {
  createHotel,
  deleteHotel,
  updateHotel,
  uploadHotelImage,
} from "./hotel-service.js";

const hotelStyles = [
  ["coastal", "Coastal"],
  ["alpine", "Alpine"],
  ["garden", "Garden"],
  ["city", "City"],
];

function createField({ id, label, type = "text", maxLength, min, step }) {
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
  input.required = true;
  if (maxLength) {
    input.maxLength = maxLength;
  }
  if (min !== undefined) {
    input.min = String(min);
  }
  if (step) {
    input.step = step;
  }

  wrapper.append(labelElement, input);
  return { wrapper, input };
}

function createTextarea({ id, label, maxLength }) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-3";

  const labelElement = document.createElement("label");
  labelElement.className = "form-label fw-semibold";
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const textarea = document.createElement("textarea");
  textarea.className = "form-control";
  textarea.id = id;
  textarea.name = id;
  textarea.required = true;
  textarea.rows = 4;
  textarea.maxLength = maxLength;

  wrapper.append(labelElement, textarea);
  return { wrapper, input: textarea };
}

export function createHotelEditModal(onSaved) {
  const element = document.createElement("div");
  element.className = "modal fade hotel-admin-modal";
  element.tabIndex = -1;
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("aria-labelledby", "hotel-admin-modal-title");

  const dialog = document.createElement("div");
  dialog.className = "modal-dialog modal-dialog-centered modal-dialog-scrollable";
  const content = document.createElement("div");
  content.className = "modal-content";

  const header = document.createElement("div");
  header.className = "modal-header";
  const title = document.createElement("h2");
  title.className = "modal-title fs-5";
  title.id = "hotel-admin-modal-title";
  title.textContent = "Edit hotel";
  const close = document.createElement("button");
  close.className = "btn-close";
  close.type = "button";
  close.setAttribute("data-bs-dismiss", "modal");
  close.setAttribute("aria-label", "Close hotel editor");
  header.append(title, close);

  const form = document.createElement("form");
  form.noValidate = true;
  const body = document.createElement("div");
  body.className = "modal-body";
  const status = document.createElement("div");
  status.className = "alert d-none";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const name = createField({
    id: "hotel-admin-name",
    label: "Hotel name",
    maxLength: 120,
  });
  const location = createField({
    id: "hotel-admin-location",
    label: "Location",
    maxLength: 160,
  });
  const description = createTextarea({
    id: "hotel-admin-description",
    label: "Description",
    maxLength: 600,
  });
  const rate = createField({
    id: "hotel-admin-rate",
    label: "Illustrative nightly rate (EUR)",
    type: "number",
    min: 0,
    step: "0.01",
  });
  const imageUrl = createField({
    id: "hotel-admin-image-url",
    label: "Hotel image URL (HTTPS)",
    type: "url",
    maxLength: 2048,
  });
  imageUrl.input.placeholder = "https://example.com/hotel-photo.jpg";
  const styleWrapper = document.createElement("div");
  styleWrapper.className = "mb-3";
  const styleLabel = document.createElement("label");
  styleLabel.className = "form-label fw-semibold";
  styleLabel.htmlFor = "hotel-admin-style";
  styleLabel.textContent = "Hotel style";
  const style = document.createElement("select");
  style.className = "form-select";
  style.id = styleLabel.htmlFor;
  style.name = style.id;
  style.required = true;
  for (const [value, label] of hotelStyles) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    style.append(option);
  }
  styleWrapper.append(styleLabel, style);

  body.append(
    status,
    name.wrapper,
    location.wrapper,
    description.wrapper,
    rate.wrapper,
    styleWrapper,
    imageUrl.wrapper,
  );

  const footer = document.createElement("div");
  footer.className = "modal-footer";
  const cancel = document.createElement("button");
  cancel.className = "btn btn-outline-secondary";
  cancel.type = "button";
  cancel.dataset.bsDismiss = "modal";
  cancel.textContent = "Cancel";
  const save = document.createElement("button");
  save.className = "btn btn-primary";
  save.type = "submit";
  save.textContent = "Save changes";
  footer.append(cancel, save);

  form.append(body, footer);
  content.append(header, form);
  dialog.append(content);
  element.append(dialog);
  document.body.append(element);

  const modal = new Modal(element, {
    backdrop: true,
    keyboard: true,
    focus: true,
  });
  let activeHotel = null;

  function showStatus(message) {
    status.className = "alert alert-danger";
    status.textContent = message;
  }

  function clearStatus() {
    status.className = "alert d-none";
    status.textContent = "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    form.classList.add("was-validated");
    if (!form.reportValidity() || save.disabled) {
      return;
    }

    save.disabled = true;
    save.setAttribute("aria-busy", "true");
    save.textContent = "Saving...";
    try {
      const hotel = {
        name: name.input.value,
        location: location.input.value,
        description: description.input.value,
        nightlyRate: rate.input.value,
        style: style.value,
        imageUrl: imageUrl.input.value,
      };
      if (activeHotel) {
        await updateHotel(activeHotel.id, hotel);
      } else {
        await createHotel(hotel);
      }
      modal.hide();
      await onSaved(
        activeHotel ? "Hotel changes saved." : "Hotel created successfully.",
      );
    } catch (error) {
      showStatus(error.message);
    } finally {
      save.disabled = false;
      save.removeAttribute("aria-busy");
      save.textContent = activeHotel ? "Save changes" : "Create hotel";
    }
  });

  return {
    open(hotel) {
      activeHotel = hotel;
      clearStatus();
      form.classList.remove("was-validated");
      title.textContent = hotel ? "Edit hotel" : "Add a hotel";
      save.textContent = hotel ? "Save changes" : "Create hotel";
      imageUrl.wrapper.hidden = Boolean(hotel);
      imageUrl.input.required = !hotel;
      name.input.value = hotel?.name ?? "";
      location.input.value =
        hotel?.location.replace(/^Sample stay\s*[·-]\s*/, "") ?? "";
      description.input.value = hotel?.description ?? "";
      rate.input.value = hotel ? String(hotel.nightlyRate) : "";
      style.value = hotel?.style ?? hotelStyles[0][0];
      imageUrl.input.value = "";
      modal.show();
    },
  };
}

export function createHotelAdminActions(hotel, { editModal, refresh }) {
  const actions = document.createElement("div");
  actions.className = "hotel-card__admin";

  const status = document.createElement("p");
  status.className = "hotel-card__admin-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const buttons = [];
  function createAction(label, className) {
    const button = document.createElement("button");
    button.className = `btn ${className} btn-sm`;
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", `${label} ${hotel.name}`);
    button.addEventListener("click", (event) => event.stopPropagation());
    actions.append(button);
    buttons.push(button);
    return button;
  }

  function setBusy(busy) {
    for (const button of buttons) {
      button.disabled = busy;
      button.setAttribute("aria-busy", String(busy));
    }
    imageInput.disabled = busy;
  }

  function showError(error) {
    status.className = "hotel-card__admin-status text-danger";
    status.textContent = error.message;
  }

  const edit = createAction("Edit", "btn-outline-primary");
  edit.addEventListener("click", () => editModal.open(hotel));

  const addImage = createAction("Add image", "btn-outline-secondary");
  const imageInput = document.createElement("input");
  imageInput.className = "visually-hidden";
  imageInput.type = "file";
  imageInput.accept = "image/jpeg,image/png,image/webp";
  imageInput.tabIndex = -1;
  imageInput.setAttribute("aria-hidden", "true");
  addImage.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) {
      return;
    }
    setBusy(true);
    status.className = "hotel-card__admin-status";
    status.textContent = "Uploading image...";
    try {
      await uploadHotelImage(hotel, file);
      await refresh(`${hotel.name} image updated.`);
    } catch (error) {
      showError(error);
    } finally {
      imageInput.value = "";
      setBusy(false);
    }
  });
  actions.append(imageInput);

  const remove = createAction("Delete", "btn-outline-danger");
  remove.addEventListener("click", async () => {
    if (!window.confirm(`Delete ${hotel.name}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    status.className = "hotel-card__admin-status";
    status.textContent = "Deleting hotel...";
    try {
      await deleteHotel(hotel.id);
      await refresh(`${hotel.name} deleted.`);
    } catch (error) {
      await refresh(error.message, "danger");
    } finally {
      setBusy(false);
    }
  });

  actions.append(status);
  return actions;
}
