import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
  localStorage: storage,
  sessionStorage: storage,
  location: { origin: "https://example.invalid" },
};
let response;
const requests = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  requests.push({ url: String(input), ...options });
  return new Response(JSON.stringify(response.body), {
    status: response.status,
    headers: { "Content-Type": "application/json", "X-Supabase-Api-Version": "2024-01-01" },
  });
};
const vite = await createServer({
  configFile: false, envFile: false, appType: "custom",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://example.invalid"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("test-key"),
  },
});
const service = await vite.ssrLoadModule("/src/services/auth-service.js");
const { getSupabaseClient } = await vite.ssrLoadModule("/src/services/supabase.js");
after(async () => {
  await getSupabaseClient().auth.stopAutoRefresh();
  await vite.close();
  globalThis.fetch = originalFetch;
  delete globalThis.window;
});

test("signup submits names and confirmation redirect to Supabase", async () => {
  response = { status: 200, body: { id: "guest-id", email: "guest@example.invalid" } };
  const result = await service.registerUser({
    email: " Guest@Example.invalid ", password: "example-password",
    firstName: " Jane ", lastName: " Doe ",
  });
  assert.equal(result.confirmationRequired, true);
  const request = requests.at(-1);
  assert.match(request.url, /\/auth\/v1\/signup/);
  assert.equal(new URL(request.url).searchParams.get("redirect_to"), "https://example.invalid/account/");
  const body = JSON.parse(request.body);
  assert.equal(body.email, "guest@example.invalid");
  assert.deepEqual(body.data, { first_name: "Jane", last_name: "Doe" });
});

test("login distinguishes an unconfirmed email from bad credentials", async () => {
  response = { status: 400, body: { code: "email_not_confirmed", msg: "Email not confirmed" } };
  await assert.rejects(service.signInUser({ email: "test@example.invalid", password: "bad" }), /Confirm your email/);
  response = { status: 400, body: { code: "invalid_credentials", msg: "Invalid login credentials" } };
  await assert.rejects(service.signInUser({ email: "test@example.invalid", password: "bad" }), /Email or password is incorrect/);
});

test("login does not misreport a server failure as incorrect credentials", async () => {
  response = { status: 500, body: { code: "unexpected_failure", msg: "server error" } };
  await assert.rejects(service.signInUser({ email: "test@example.invalid", password: "bad" }), /Supabase configuration/);
});
