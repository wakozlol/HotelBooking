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

function setup(offers = [], findOffers) {
  globalThis.document = { createElement: (tag) => new Element(tag) };
  const calls = [];
  const selection = [];
  const booking = createStayBooking({ id: "hotel-1" }, {
    live: true,
    findOffers: async (...args) => {
      calls.push(args);
      return findOffers ? findOffers(...args) : offers;
    },
    startBooking: (draft) => selection.push(draft),
  });
  const all = () => descendants(booking.element);
  const byId = (id) => all().find((element) => element.id === id);
  const form = all().find((element) => element.tagName === "form");
  const status = all().find((element) => element.className === "hotel-stay-preview__summary");
  return { booking, calls, selection, all, byId, form, status };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 400));

test("automatically loads offers on opening without an availability button", async () => {
  const ui = setup([]);
  ui.booking.show();
  await Promise.resolve();
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0][0], "hotel-1");
  assert.equal(ui.calls[0][1].checkIn, ui.byId("stay-check-in").value);
  assert.equal(ui.calls[0][1].checkOut, ui.byId("stay-check-out").value);
  assert.ok(!ui.all().some((element) => element.textContent === "Check availability"));
  ui.booking.show();
  assert.equal(ui.calls.length, 1);
});

test("refreshes offers after valid input and preserves selected booking details", async () => {
  const ui = setup([{ typeId: "type-1", typeName: "Double", roomId: "room-1", capacity: 2, nightlyRate: 120.5, availableCount: 2 }]);
  ui.booking.show();
  await Promise.resolve();
  ui.byId("stay-check-in").value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  ui.byId("stay-check-out").value = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  ui.byId("stay-guests").value = "2";
  await ui.byId("stay-guests").fire("input");
  await flush();
  assert.equal(ui.calls.length, 2);
  assert.equal(ui.calls[0][0], "hotel-1");
  assert.ok(ui.all().some((element) => element.textContent.includes("2 available") && element.textContent.includes("241.00 total")));
  const button = ui.all().find((element) => element.textContent === "Select room");
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
  ui.booking.show();
  await Promise.resolve();
  assert.equal(ui.all().find((element) => element.textContent === "Unavailable").disabled, true);
  assert.match(ui.status.textContent, /No rooms are available/);
});

test("clearly labels sample inventory as a test, not a hotel stay", async () => {
  const ui = setup([{ typeId: "type-1", typeName: "SAMPLE TEST ONLY - NO HOTEL STAY - Double", roomId: "room-1", capacity: 2, nightlyRate: 120, availableCount: 1 }]);
  ui.booking.show();
  await Promise.resolve();
  assert.ok(ui.all().some((element) => element.textContent.includes("not a real hotel stay")));
  assert.ok(ui.all().some((element) => element.textContent.includes("Do not travel or pay")));
});

test("does not search invalid dates or guest counts", async () => {
  const ui = setup();
  ui.booking.show();
  await Promise.resolve();
  ui.byId("stay-guests").value = "101";
  await ui.byId("stay-guests").fire("input");
  await flush();
  assert.equal(ui.calls.length, 1);
  assert.match(ui.status.textContent, /Choose valid dates/);
  ui.byId("stay-guests").value = "2";
  ui.byId("stay-check-out").value = ui.byId("stay-check-in").value;
  await ui.byId("stay-check-out").fire("input");
  await flush();
  assert.equal(ui.calls.length, 1);
});

test("ignores an earlier availability result after the selection changes", async () => {
  let resolveFirst;
  const pending = new Promise((resolve) => { resolveFirst = resolve; });
  const ui = setup([], () => pending);
  ui.booking.show();
  ui.byId("stay-guests").value = "101";
  await ui.byId("stay-guests").fire("input");
  resolveFirst([{ typeId: "old", typeName: "Stale room", roomId: "room-1", capacity: 2, nightlyRate: 100, availableCount: 1 }]);
  await Promise.resolve();
  await Promise.resolve();
  assert.ok(!ui.all().some((element) => element.textContent === "Stale room"));
  assert.match(ui.status.textContent, /Choose valid dates/);
});

test("shows availability errors instead of claiming there are no room types", async () => {
  const ui = setup([], async () => { throw new Error("Availability could not be checked."); });
  ui.booking.show();
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(ui.status.textContent, /could not be checked/);
});

test("reports no room types", async () => {
  const ui = setup();
  ui.booking.show();
  await Promise.resolve();
  assert.match(ui.status.textContent, /No active room types/);
});
