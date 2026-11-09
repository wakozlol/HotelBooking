import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
globalThis.window = { localStorage: storage, sessionStorage: storage };

const requests = [];
let responseBody = null;
let responseStatus = 200;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  requests.push({ url: String(input), ...options });
  return new Response(JSON.stringify(responseBody), {
    status: responseStatus,
    headers: { "Content-Type": "application/json" },
  });
};

const vite = await createServer({
  configFile: false,
  envFile: false,
  appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.invalid"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("test-key"),
  },
});
const { getOwnProfile, createOwnProfile, updateOwnProfile } =
  await vite.ssrLoadModule("/src/services/profile-service.js");
const { getSupabaseClient } = await vite.ssrLoadModule("/src/services/supabase.js");

after(async () => {
  await getSupabaseClient().auth.stopAutoRefresh();
  await vite.close();
  globalThis.fetch = originalFetch;
  delete globalThis.window;
});

test("a missing profile is returned as null", async () => {
  responseBody = [];
  responseStatus = 200;
  assert.equal(await getOwnProfile("guest-id"), null);
});

test("creates a profile with trimmed names and the authenticated user ID", async () => {
  responseBody = { first_name: "Alice", last_name: "Guest", created_at: "2026-01-01", updated_at: "2026-01-01" };
  const result = await createOwnProfile("guest-id", { firstName: " Alice ", lastName: " Guest " });
  const request = requests.at(-1);
  assert.equal(request.method, "POST");
  assert.deepEqual(JSON.parse(request.body), {
    id: "guest-id",
    first_name: "Alice",
    last_name: "Guest",
  });
  assert.equal(result.first_name, "Alice");
});

test("updates an existing profile without modifying its ID", async () => {
  responseBody = { first_name: "Alice", last_name: "Updated" };
  await updateOwnProfile("guest-id", { firstName: "Alice", lastName: "Updated" });
  const request = requests.at(-1);
  assert.equal(request.method, "PATCH");
  assert.match(request.url, /id=eq\.guest-id/);
  assert.deepEqual(JSON.parse(request.body), { first_name: "Alice", last_name: "Updated" });
});

test("rejects invalid names before sending a request", async () => {
  const previous = requests.length;
  await assert.rejects(createOwnProfile("guest-id", { firstName: " ", lastName: "Guest" }), /between 1 and 80/);
  assert.equal(requests.length, previous);
});

test("reports profile creation errors", async () => {
  responseStatus = 409;
  responseBody = { code: "23505", message: "duplicate" };
  await assert.rejects(createOwnProfile("guest-id", { firstName: "Alice", lastName: "Guest" }), /refresh the page/);
});
