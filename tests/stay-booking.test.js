import assert from "node:assert/strict";
import { test } from "node:test";
import { BookingOutcomeUnknownError } from "../src/features/bookings/booking-service.js";
import { createStayBooking } from "../src/features/bookings/stay-booking.js";

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.value = "";
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  focus() {}
  addEventListener(name, callback) { this.listeners[name] = callback; }
  get valueAsNumber() { return Number(this.value); }
  get validity() {
    const value = this.type === "number" ? Number(this.value) : this.value;
    const min = this.type === "number" ? Number(this.min) : this.min;
    const max = this.type === "number" ? Number(this.max) : this.max;
    return { valid: (!this.required || Boolean(this.value)) &&
      (!this.min || value >= min) &&
      (!this.max || value <= max) };
  }
  reportValidity() {
    return descendants(this).every((item) => item.validity.valid);
  }
  async fire(name) {
    await this.listeners[name]?.({ preventDefault() {} });
  }
}

function descendants(element) {
  return [element, ...element.children.flatMap(descendants)];
}

function setup(overrides = {}) {
  globalThis.document = { createElement: (tag) => new Element(tag) };
  const calls = [];
  const booking = createStayBooking({ id: "hotel-1" }, {
    live: true,
    findRooms: async (...args) => {
      calls.push(["search", ...args]);
      return [{ id: "room-1", capacity: 2, nightlyRate: 120.5 }];
    },
    getUser: async () => ({ id: "guest-1" }),
    reserveRoom: async (...args) => {
      calls.push(["book", ...args]);
      return { id: "reservation-1", status: "confirmed", total_eur: 241 };
    },
    ...overrides,
  });
  const all = () => descendants(booking.element);
  const byId = (id) => all().find((element) => element.id === id);
  const form = all().find((element) => element.tagName === "form");
  const confirm = all().find((element) => element.textContent === "Confirm booking");
  const status = all().find((element) => element.className === "hotel-stay-preview__summary");
  const fields = all().find((element) => element.tagName === "fieldset");
  const signIn = all().find((element) => element.tagName === "a");
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const dayAfter = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  byId("stay-check-in").value = tomorrow;
  byId("stay-check-out").value = dayAfter;
  byId("stay-guests").value = "2";
  const results = all().find((element) => element.className === "hotel-booking-results");
  return { booking, calls, form, confirm, status, fields, signIn, results, byId };
}

test("searches live rooms and confirms exactly the selected room at its quoted rate", async () => {
  const ui = setup();
  await ui.form.fire("submit");
  assert.match(ui.status.textContent, /Select a room/);
  const select = ui.byId("stay-room");
  select.value = "0";
  assert.match(select.children[0].textContent, /120\.50/);
  assert.match(select.children[0].textContent, /241\.00 total/);
  await ui.confirm.fire("click");
  assert.equal(ui.calls[0][1], "hotel-1");
  assert.equal(ui.calls[1][1].id, "room-1");
  assert.equal(ui.calls[1][1].nightlyRate, 120.5);
  assert.deepEqual(ui.calls[1][2], ui.calls[0][2]);
  assert.match(ui.status.textContent, /Booking confirmed.*reservation-1.*241\.00.*Pay at the hotel/);
  assert.equal(ui.fields.disabled, true);
  await ui.confirm.fire("click");
  assert.equal(ui.calls.length, 2);
});

test("reports an empty inventory without offering a booking", async () => {
  const ui = setup({ findRooms: async () => [] });
  await ui.form.fire("submit");
  assert.match(ui.status.textContent, /No rooms are available/);
  assert.equal(ui.results.hidden, true);
  await ui.confirm.fire("click");
  assert.equal(ui.calls.length, 0);
});

test("requires sign-in without submitting a reservation", async () => {
  const ui = setup({ getUser: async () => null });
  await ui.form.fire("submit");
  ui.byId("stay-room").value = "0";
  await ui.confirm.fire("click");
  assert.match(ui.status.textContent, /Sign in to book/);
  assert.equal(ui.signIn.hidden, false);
  assert.equal(ui.calls.length, 1);
});

test("changing stay details invalidates old results", async () => {
  const ui = setup();
  await ui.form.fire("submit");
  ui.byId("stay-guests").value = "1";
  await ui.byId("stay-guests").fire("input");
  await ui.confirm.fire("click");
  assert.equal(ui.calls.length, 1);
});

test("reports booking rejection without showing a confirmation", async () => {
  const ui = setup({ reserveRoom: async () => { throw new Error("The room is no longer available. Check availability again."); } });
  await ui.form.fire("submit");
  ui.byId("stay-room").value = "0";
  await ui.confirm.fire("click");
  assert.match(ui.status.textContent, /no longer available/);
  assert.doesNotMatch(ui.status.textContent, /confirmed/i);
  assert.equal(ui.fields.disabled, false);
});

test("does not search invalid dates or guest counts", async () => {
  const ui = setup();
  ui.byId("stay-guests").value = "101";
  await ui.form.fire("submit");
  assert.equal(ui.calls.length, 0);
  ui.byId("stay-guests").value = "2";
  ui.byId("stay-check-out").value = ui.byId("stay-check-in").value;
  await ui.form.fire("submit");
  assert.equal(ui.calls.length, 0);
});

test("uncertain booking outcomes prevent resubmission from the same form", async () => {
  const ui = setup({ reserveRoom: async () => { throw new BookingOutcomeUnknownError(); } });
  await ui.form.fire("submit");
  ui.byId("stay-room").value = "0";
  await ui.confirm.fire("click");
  assert.match(ui.status.textContent, /Contact the hotel/);
  assert.equal(ui.fields.disabled, true);
});

test("sample fallback cannot search or book", async () => {
  const ui = setup({ live: false, configurationError: () => "Configure Supabase." });
  assert.equal(ui.fields.disabled, true);
  assert.match(ui.booking.element.children[1].textContent, /Configure Supabase/);
  await ui.form.fire("submit");
  assert.equal(ui.calls.length, 0);
});
