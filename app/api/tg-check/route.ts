import { NextResponse } from "next/server";
import { tgUsername } from "@/lib/telegram";

// Does a Telegram username exist? The public page t.me/<name> shows a profile title (tgme_page_title) for an existing
// user, bot, group or channel, and only the generic «If you have Telegram…» text for a free username.
// Answers { exists: true | false | null }; null = could not tell (Telegram slow / down): the form then lets it through.

export async function GET(req: Request) {
  const name = tgUsername(new URL(req.url).searchParams.get("u") ?? "");
  if (!name) return NextResponse.json({ exists: false, reason: "format" });
  try {
    const r = await fetch(`https://t.me/${name}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MaxArtDigital-form/1.0)", "Accept-Language": "en" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
    });
    if (!r.ok) return NextResponse.json({ exists: null });
    const html = await r.text();
    return NextResponse.json(
      { exists: html.includes("tgme_page_title") },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ exists: null });
  }
}
