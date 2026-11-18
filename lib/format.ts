/** Short Facebook-style timestamps: "now", "5m", "3h", "2d", then a date. */
export function timeAgo(iso: string, now: number): string {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return "now";

  const minutes = Math.max(1, Math.floor(seconds / 60));
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Turns Supabase/network errors into messages a visitor can act on. */
export function friendlyError(err: unknown): string {
  const e = (err ?? {}) as { message?: string; code?: string };
  const message = e.message ?? "";

  if (e.code === "23514") {
    return "That post broke the wall's rules: it must be 280 characters or less and can't be empty.";
  }
  if (e.code === "42501" || /row-level security/i.test(message)) {
    return "The wall's security rules blocked this request.";
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (/maximum allowed size|payload too large|too large/i.test(message)) {
    return "That photo is too big. The limit is 5MB.";
  }
  if (/mime type|invalid_mime_type/i.test(message)) {
    return "That file type isn't supported. Use JPG, PNG, GIF or WebP.";
  }
  return message || "Something went wrong. Please try again.";
}
