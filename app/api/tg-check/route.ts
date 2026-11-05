import { NextResponse } from "next/server";
import { tgUsername } from "@/lib/telegram";
import { NO_STORE, clientIp, rateLimit, sameOrigin } from "@/lib/guard";

// Does a Telegram username exist? The public page t.me/<name> shows a profile title (tgme_page_title) for an existing
// user, bot, group or channel, and only the generic «If you have Telegram…» text for a free username.
// Answers { exists: true | false | null }; null = could not tell (Telegram slow / down, or too many checks): the form
// then lets it through. Only this site's pages may ask, and each IP only so often: otherwise anyone could use us to
// hammer t.me or probe which usernames exist.

const PER_MIN = 30; // typing a nick with a 600ms debounce costs a handful of checks

export async function GET(req: Request) {
  if (!sameOrigin(req, { requireOrigin: false })) return NextResponse.json({ exists: null }, { status: 403, headers: NO_STORE });
  const hit = await rateLimit(`tg:${clientIp(req)}`, PER_MIN, 60);
  if (!hit.ok) return NextResponse.json({ exists: null }, { status: 429, headers: { ...NO_STORE, "Retry-After": String(hit.retryAfter) } });

  const name = tgUsername(new URL(req.url).searchParams.get("u") ?? "");
  if (!name) return NextResponse.json({ exists: false, reason: "format" }, { headers: NO_STORE });
  try {
    const r = await fetch(`https://t.me/${name}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MaxArtDigital-form/1.0)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
    });
    if (!r.ok) return NextResponse.json({ exists: null }, { headers: NO_STORE });
    const html = await r.text();
    // private: the answer is per visitor, a shared CDN cache would let a flood skip the rate limit
    return NextResponse.json({ exists: html.includes("tgme_page_title") }, { headers: { ...NO_STORE, "Cache-Control": "private, max-age=600" } });
  } catch {
    return NextResponse.json({ exists: null }, { headers: NO_STORE });
  }
}
