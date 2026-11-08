function localDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextDateValue(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function createField(id, label, type) {
  const wrapper = document.createElement("div");
  const labelElement = document.createElement("label");
  labelElement.className = "form-label fw-semibold";
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.className = "form-control";
  input.id = id;
  input.type = type;
  input.required = true;
  wrapper.append(labelElement, input);
  return { wrapper, input };
}

export function createStayPreview() {
  const section = document.createElement("section");
  section.className = "hotel-stay-preview";
  section.hidden = true;
  section.setAttribute("aria-labelledby", "hotel-stay-preview-title");

  const heading = document.createElement("h3");
  heading.className = "hotel-details__heading";
  heading.id = "hotel-stay-preview-title";
  heading.textContent = "Choose your stay";

  const notice = document.createElement("p");
  notice.className = "hotel-details__notice";
  notice.textContent =
    "Preview only: availability is not checked and reservations cannot be made yet.";

  const fields = document.createElement("div");
  fields.className = "hotel-stay-preview__fields";
  const checkIn = createField("stay-preview-check-in", "Check-in", "date");
  const checkOut = createField("stay-preview-check-out", "Check-out", "date");
  const guests = createField("stay-preview-guests", "Guests", "number");
  checkIn.input.max = "9999-12-30";
  checkOut.input.max = "9999-12-31";
  guests.input.min = "1";
  guests.input.step = "1";
  guests.input.value = "1";
  fields.append(checkIn.wrapper, checkOut.wrapper, guests.wrapper);

  const summary = document.createElement("p");
  summary.className = "hotel-stay-preview__summary";
  summary.setAttribute("role", "status");
  summary.setAttribute("aria-live", "polite");
  section.append(heading, notice, fields, summary);

  function updateSummary() {
    const today = localDateValue(new Date());
    checkIn.input.min = today;
    checkOut.input.min = nextDateValue(
      checkIn.input.validity.valid && checkIn.input.value
        ? checkIn.input.value
        : today,
    );

    if (!checkIn.input.value || !checkOut.input.value) {
      summary.textContent = "Choose check-in and check-out dates.";
      return;
    }
    if (!checkIn.input.validity.valid || !checkOut.input.validity.valid) {
      summary.textContent =
        "Choose a check-in date from today and a later check-out date.";
      return;
    }
    if (
      !guests.input.validity.valid ||
      !Number.isSafeInteger(guests.input.valueAsNumber)
    ) {
      summary.textContent = "Enter a whole number of guests greater than zero.";
      return;
    }

    const nights =
      (Date.parse(`${checkOut.input.value}T00:00:00Z`) -
        Date.parse(`${checkIn.input.value}T00:00:00Z`)) /
      86400000;
    const guestCount = guests.input.valueAsNumber;
    summary.textContent = `${nights} ${nights === 1 ? "night" : "nights"} for ${guestCount} ${guestCount === 1 ? "guest" : "guests"}.`;
  }

  for (const input of [checkIn.input, checkOut.input, guests.input]) {
    input.addEventListener("input", updateSummary);
    input.addEventListener("change", updateSummary);
  }
  updateSummary();

  return {
    element: section,
    show() {
      updateSummary();
      section.hidden = false;
      checkIn.input.focus();
    },
  };
}
