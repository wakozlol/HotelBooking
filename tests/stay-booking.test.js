import assert from "node:assert/strict";
import { test } from "node:test";
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
      (!this.min || value >= min) && (!this.max || value <= max) };
  }
  checkValidity() { return descendants(this).every((item) => item.validity.valid); }
  reportValidity() { return this.checkValidity(); }
  async fire(name) { await this.listeners[name]?.({ preventDefault() {} }); }
}

function descendants(element) {
  return [element, ...element.children.flatMap(descendants)];
}

function setup(offers = []) {
  globalThis.document = { createElement: (tag) => new Element(tag) };
  const calls = [];
  const selection = [];
  const booking = createStayBooking({ id: "hotel-1" }, {
    live: true,
    findOffers: async (...args) => { calls.push(args); return offers; },
    startBooking: (draft) => selection.push(draft),
  });
  const all = () => descendants(booking.element);
  const byId = (id) => all().find((element) => element.id === id);
  const form = all().find((element) => element.tagName === "form");
  const status = all().find((element) => element.className === "hotel-stay-preview__summary");
  byId("stay-check-in").value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  byId("stay-check-out").value = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  byId("stay-guests").value = "2";
  return { booking, calls, selection, all, byId, form, status };
}

test("shows real offers and preserves the selected booking details", async () => {
  const ui = setup([{ typeId: "type-1", typeName: "Double", roomId: "room-1", capacity: 2, nightlyRate: 120.5, availableCount: 2 }]);
  await ui.form.fire("submit");
  assert.equal(ui.calls[0][0], "hotel-1");
  assert.ok(ui.all().some((element) => element.textContent.includes("2 available") && element.textContent.includes("241.00 total")));
  const button = ui.all().find((element) => element.textContent === "Book now");
  await button.fire("click");
  assert.equal(ui.selection[0].hotelId, "hotel-1");
  assert.equal(ui.selection[0].typeId, "type-1");
  assert.equal(ui.selection[0].roomId, "room-1");
  assert.equal(ui.selection[0].nightlyRate, 120.5);
  assert.equal(ui.selection[0].guests, 2);
  assert.ok(ui.selection[0].requestId);
});

test("disables unavailable room offers", async () => {
  const ui = setup([{ typeId: "type-1", typeName: "Double", roomId: null, capacity: 2, nightlyRate: 100, availableCount: 0 }]);
  await ui.form.fire("submit");
  assert.equal(ui.all().find((element) => element.textContent === "Unavailable").disabled, true);
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

test("reports no room types", async () => {
  const ui = setup();
  await ui.form.fire("submit");
  assert.match(ui.status.textContent, /No room types/);
});
