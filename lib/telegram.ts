// Telegram usernames: 5 to 32 characters, Latin letters, digits and _, start with a letter, never end with _.
export const TG_USER = /^[a-zA-Z][a-zA-Z0-9_]{3,30}[a-zA-Z0-9]$/;

/** «@nick», «nick», «t.me/nick», «https://t.me/nick» → «nick»; anything else → null */
export function tgUsername(raw: string): string | null {
  const s = raw.trim().replace(/^https?:\/\//i, "").replace(/^(www\.)?(t\.me|telegram\.me)\//i, "").replace(/^@/, "").replace(/\/+$/, "");
  return TG_USER.test(s) ? s : null;
}
