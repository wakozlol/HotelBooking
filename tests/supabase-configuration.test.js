import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

async function configurationError(url, key) {
  const vite = await createServer({
    configFile: false, envFile: false, appType: "custom",
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(key),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(""),
    },
  });
  try {
    const client = await vite.ssrLoadModule("/src/services/supabase.js");
    return client.getSupabaseConfigurationError();
  } finally {
    await vite.close();
  }
}

test("configuration notice identifies only the missing project URL", async () => {
  const error = await configurationError("", "test-key");
  assert.match(error, /missing: VITE_SUPABASE_URL\./);
});

test("configuration notice identifies the missing public key", async () => {
  const error = await configurationError("https://example.invalid", "");
  assert.match(error, /missing: VITE_SUPABASE_PUBLISHABLE_KEY \(or VITE_SUPABASE_ANON_KEY\)/);
});
