// Keep these in sync with the checks in supabase/schema.sql.
export const MAX_BODY_LENGTH = 280;
export const MAX_NAME_LENGTH = 50;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const NAME_STORAGE_KEY = "wall:author-name";
