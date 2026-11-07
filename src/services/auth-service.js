import {
  getSupabaseClient,
  SupabaseConfigurationError,
} from "./supabase.js";

export class AuthServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function registerUser({ email, password, firstName, lastName }) {
  const normalizedEmail = email.trim().toLowerCase();
  let result;

  try {
    result = await getSupabaseClient().auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        emailRedirectTo: new URL("/account/", window.location.origin).href,
      },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not create your account right now. Please try again.",
    );
  }

  if (result.error) {
    if (result.error.status === 429) {
      throw new AuthServiceError(
        "Too many registration attempts. Please wait a moment and try again.",
      );
    }
    throw new AuthServiceError(
      "We could not create an account with those details. Please check the form and try again.",
    );
  }

  if (!result.data.user) {
    throw new AuthServiceError(
      "We could not confirm the registration request. Please try again.",
    );
  }

  return {
    user: result.data.user,
    session: result.data.session,
    confirmationRequired: !result.data.session,
  };
}

export async function signInUser({ email, password }) {
  let result;

  try {
    result = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not sign you in right now. Please try again.",
    );
  }

  if (result.error) {
    if (result.error.status === 429) {
      throw new AuthServiceError(
        "Too many sign-in attempts. Please wait a moment and try again.",
      );
    }
    throw new AuthServiceError("Email or password is incorrect.");
  }

  if (!result.data.user) {
    throw new AuthServiceError(
      "We could not complete sign-in. Please try again.",
    );
  }

  return result.data.user;
}

export async function signOutUser() {
  let result;

  try {
    result = await getSupabaseClient().auth.signOut();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not sign you out. Please check your connection and try again.",
    );
  }

  if (result.error) {
    throw new AuthServiceError(
      "We could not sign you out. Please check your connection and try again.",
    );
  }
}

export async function requestPasswordReset(email) {
  let result;

  try {
    result = await getSupabaseClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: new URL("/reset-password/", window.location.origin).href,
      },
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not send a reset link right now. Please try again.",
    );
  }

  if (result.error) {
    if (result.error.status === 429) {
      throw new AuthServiceError(
        "Too many reset requests. Please wait a moment and try again.",
      );
    }
    throw new AuthServiceError(
      "We could not send a reset link right now. Please try again.",
    );
  }
}

export async function updatePassword(password) {
  let result;

  try {
    result = await getSupabaseClient().auth.updateUser({ password });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not update your password. Request a new reset link and try again.",
    );
  }

  if (result.error || !result.data.user) {
    throw new AuthServiceError(
      "We could not update your password. Request a new reset link and try again.",
    );
  }

  return result.data.user;
}

export async function getAuthenticatedUser() {
  let result;

  try {
    result = await getSupabaseClient().auth.getUser();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new AuthServiceError(
      "We could not verify your sign-in. Please refresh and try again.",
    );
  }

  if (result.error) {
    throw new AuthServiceError(
      "We could not verify your sign-in. Please refresh and try again.",
    );
  }

  return result.data.user;
}

export function subscribeToAuthChanges(callback) {
  return getSupabaseClient().auth.onAuthStateChange(callback);
}
