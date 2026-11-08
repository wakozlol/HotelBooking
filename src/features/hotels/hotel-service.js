import { getSupabaseClient } from "../../services/supabase.js";

const hotelColumns = [
  "id",
  "name",
  "location",
  "description",
  "style",
  "image_url",
  "image_path",
  "photo_credit",
  "photo_license",
  "photo_license_url",
  "photo_source",
  "highlights",
  "nightly_rate",
  "amenities",
].join(", ");

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumImageSize = 5 * 1024 * 1024;
const allowedStyles = new Set(["coastal", "alpine", "garden", "city"]);

export class HotelServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = "HotelServiceError";
  }
}

function mapHotel(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    style: row.style,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    photoCredit: row.photo_credit,
    photoLicense: row.photo_license,
    photoLicenseUrl: row.photo_license_url,
    photoSource: row.photo_source,
    highlights: row.highlights,
    nightlyRate: Number(row.nightly_rate),
    amenities: row.amenities,
  };
}

export async function getHotelListings() {
  const { data, error } = await getSupabaseClient()
    .from("hotels")
    .select(hotelColumns)
    .order("created_at", { ascending: true });

  if (error) {
    throw new HotelServiceError(
      "Hotel listings could not be loaded. Confirm the hotel migration is installed and try again.",
    );
  }

  return data.map(mapHotel);
}

export async function getHotelAdminRole(userId) {
  const { data, error } = await getSupabaseClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    throw new HotelServiceError(
      "Your hotel administrator access could not be verified. Please refresh and try again.",
    );
  }

  return data?.role === "admin";
}

function validateHotelUpdate(hotel) {
  const name = hotel.name.trim();
  const location = hotel.location.trim();
  const description = hotel.description.trim();
  const nightlyRate = Number(hotel.nightlyRate);

  if (name.length < 1 || name.length > 120) {
    throw new HotelServiceError("Hotel name must contain 1 to 120 characters.");
  }
  if (location.length < 1 || location.length > 160) {
    throw new HotelServiceError("Hotel location must contain 1 to 160 characters.");
  }
  if (description.length < 1 || description.length > 600) {
    throw new HotelServiceError(
      "Hotel description must contain 1 to 600 characters.",
    );
  }
  if (!allowedStyles.has(hotel.style)) {
    throw new HotelServiceError("Choose a valid hotel style.");
  }
  if (!Number.isFinite(nightlyRate) || nightlyRate < 0 || nightlyRate > 100000) {
    throw new HotelServiceError(
      "The illustrative nightly rate must be between €0 and €100,000.",
    );
  }

  return {
    name,
    location,
    description,
    style: hotel.style,
    nightly_rate: nightlyRate,
  };
}

export async function updateHotel(hotelId, hotel) {
  const update = validateHotelUpdate(hotel);
  const { data, error } = await getSupabaseClient()
    .from("hotels")
    .update(update)
    .eq("id", hotelId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new HotelServiceError(
      "Hotel changes could not be saved. Check your administrator access and try again.",
    );
  }
}

export async function createHotel(hotel) {
  const update = validateHotelUpdate(hotel);
  let imageUrl;
  try {
    imageUrl = new URL(hotel.imageUrl.trim());
  } catch {
    throw new HotelServiceError("Enter a valid HTTPS image URL.");
  }
  if (imageUrl.protocol !== "https:") {
    throw new HotelServiceError("The hotel image URL must use HTTPS.");
  }

  const slug = update.name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 68);
  if (!slug) {
    throw new HotelServiceError("The hotel name must contain letters or numbers.");
  }

  const { data, error } = await getSupabaseClient()
    .from("hotels")
    .insert({
      id: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
      ...update,
      image_url: imageUrl.href,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new HotelServiceError(
      "The hotel could not be created. Check your administrator access and try again.",
    );
  }
}

async function removeStoredImage(path, failureMessage) {
  const { error } = await getSupabaseClient()
    .storage
    .from("hotel-images")
    .remove([path]);
  if (error) {
    throw new HotelServiceError(failureMessage);
  }
}

export async function uploadHotelImage(hotel, file) {
  const extension = imageTypes.get(file?.type);
  if (!extension) {
    throw new HotelServiceError("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size < 1 || file.size > maximumImageSize) {
    throw new HotelServiceError("Choose an image smaller than 5 MB.");
  }

  const client = getSupabaseClient();
  const imagePath = `${hotel.id}/${crypto.randomUUID()}.${extension}`;
  const storage = client.storage.from("hotel-images");
  const { error: uploadError } = await storage.upload(imagePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new HotelServiceError(
      "The image could not be uploaded. Check your administrator access and try again.",
    );
  }

  const imageUrl = storage.getPublicUrl(imagePath).data.publicUrl;
  const { data, error: updateError } = await client
    .from("hotels")
    .update({
      image_url: imageUrl,
      image_path: imagePath,
      photo_credit: null,
      photo_license: null,
      photo_license_url: null,
      photo_source: null,
    })
    .eq("id", hotel.id)
    .select("id")
    .maybeSingle();

  if (updateError || !data) {
    const { error: cleanupError } = await storage.remove([imagePath]);
    if (cleanupError) {
      throw new HotelServiceError(
        "The hotel image was uploaded, but the hotel could not be updated or the unused image removed.",
      );
    }
    throw new HotelServiceError(
      "The image was uploaded but could not be attached to the hotel.",
    );
  }

  if (hotel.imagePath) {
    await removeStoredImage(
      hotel.imagePath,
      "The new image was saved, but the previous uploaded image could not be removed.",
    );
  }
}

export async function deleteHotel(hotelId) {
  const client = getSupabaseClient();
  const { data: hotel, error: readError } = await client
    .from("hotels")
    .select("image_path")
    .eq("id", hotelId)
    .maybeSingle();

  if (readError || !hotel) {
    throw new HotelServiceError(
      "This hotel could not be found. Refresh the page and try again.",
    );
  }

  const { data, error } = await client
    .from("hotels")
    .delete()
    .eq("id", hotelId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new HotelServiceError(
      "Hotel could not be deleted. Check your administrator access and try again.",
    );
  }

  if (hotel.image_path) {
    await removeStoredImage(
      hotel.image_path,
      "The hotel was deleted, but its uploaded image could not be removed.",
    );
  }
}
