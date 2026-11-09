import { createClient } from "@supabase/supabase-js";

let client;
let rememberSession = true;

const authStorage = {
  getItem(key) {
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue !== null) {
      rememberSession = false;
      return sessionValue;
    }

    const localValue = window.localStorage.getItem(key);
    if (localValue !== null) {
      rememberSession = true;
    }
    return localValue;
  },
  setItem(key, value) {
    const target = rememberSession
      ? window.localStorage
      : window.sessionStorage;
    const other = rememberSession
      ? window.sessionStorage
      : window.localStorage;
    target.setItem(key, value);
    other.removeItem(key);
  },
  removeItem(key) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export class SupabaseConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

function getConfiguration() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  const missing = [];
  if (!url || url === "https://your-project-ref.supabase.co") {
    missing.push("VITE_SUPABASE_URL");
  }
  if (!key || key === "your-supabase-publishable-key" || key === "your-supabase-anon-key") {
    missing.push("VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)");
  }
  if (missing.length) {
    return {
      error: `Supabase configuration is missing: ${missing.join(", ")}. Set the missing values in your local .env file or Netlify build environment, then restart Vite or redeploy.`,
    };
  }

  if (/^sb_secret_/i.test(key)) {
    return {
      error:
        "A secret Supabase key cannot be used in the browser. Configure the publishable key instead.",
    };
  }

  const tokenPayload = key.split(".")[1];
  if (tokenPayload) {
    try {
      const base64Payload = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload = base64Payload.padEnd(
        Math.ceil(base64Payload.length / 4) * 4,
        "=",
      );
      const payload = JSON.parse(atob(paddedPayload));
      if (payload.role === "service_role") {
        return {
          error:
            "A service-role key cannot be used in the browser. Configure the publishable or anon key instead.",
        };
      }
    } catch {
      // Non-JWT publishable keys do not have a JWT payload.
    }
  }

  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.hostname !== "localhost" &&
      parsedUrl.hostname !== "127.0.0.1"
    ) {
      return {
        error: "The Supabase URL must use HTTPS outside local development.",
      };
    }
  } catch {
    return { error: "The Supabase URL in .env is not a valid URL." };
  }

  return { url, key };
}

export function getSupabaseConfigurationError() {
  return getConfiguration().error ?? null;
}

export function isSupabaseConfigured() {
  return getSupabaseConfigurationError() === null;
}

export function setRememberSession(remember) {
  rememberSession = remember;
}

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  const configuration = getConfiguration();
  if (configuration.error) {
    throw new SupabaseConfigurationError(configuration.error);
  }

  client = createClient(configuration.url, configuration.key, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  return client;
}
