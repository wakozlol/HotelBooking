import { getSupabaseClient } from "./supabase.js";

export class ProfileServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProfileServiceError";
  }
}

export async function getOwnProfile(userId) {
  let result;

  try {
    result = await getSupabaseClient()
      .from("profiles")
      .select("first_name, last_name, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();
  } catch {
    throw new ProfileServiceError(
      "We could not load your profile. Check your connection and try again.",
    );
  }

  if (result.error) {
    throw new ProfileServiceError(
      "We could not load your profile. Check your connection and try again.",
    );
  }

  if (!result.data) {
    throw new ProfileServiceError(
      "Your profile is not available yet. Confirm that the profiles migration is installed, then try again.",
    );
  }

  return result.data;
}

export async function updateOwnProfile(userId, { firstName, lastName }) {
  const profile = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
  };

  if (
    profile.first_name.length < 1 ||
    profile.first_name.length > 80 ||
    profile.last_name.length < 1 ||
    profile.last_name.length > 80
  ) {
    throw new ProfileServiceError(
      "First and last name must each contain between 1 and 80 characters.",
    );
  }

  let result;
  try {
    result = await getSupabaseClient()
      .from("profiles")
      .update(profile)
      .eq("id", userId)
      .select("first_name, last_name, created_at, updated_at")
      .single();
  } catch {
    throw new ProfileServiceError(
      "We could not save your profile. Check your connection and try again.",
    );
  }

  if (result.error || !result.data) {
    throw new ProfileServiceError(
      "We could not save your profile. Check your connection and try again.",
    );
  }

  return result.data;
}
