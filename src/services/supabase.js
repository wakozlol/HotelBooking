import { createClient } from "@supabase/supabase-js";

let client;

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

  if (!url || !key) {
    return {
      error:
        "Supabase is not configured. Copy .env.example to .env, add your project URL and publishable key, then restart Vite.",
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
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  return client;
}
