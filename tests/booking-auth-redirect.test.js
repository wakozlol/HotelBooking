import assert from "node:assert/strict";
import { test } from "node:test";
import { rememberProtectedRoute, takePostLoginRoute } from "../src/utils/auth-redirect.js";

test("booking is an allowed post-login destination and external redirects are rejected", () => {
  const state = new Map();
  globalThis.window = {
    sessionStorage: {
      getItem: (key) => state.get(key) ?? null,
      setItem: (key, value) => state.set(key, value),
      removeItem: (key) => state.delete(key),
    },
  };
  rememberProtectedRoute("/booking");
  assert.equal(takePostLoginRoute(), "/booking/");
  assert.equal(takePostLoginRoute(), "/");
  state.set("hotel-booking:redirect-after-login", "https://example.invalid/");
  assert.equal(takePostLoginRoute(), "/");
  delete globalThis.window;
});
