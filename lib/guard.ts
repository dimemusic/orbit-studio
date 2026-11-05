// Abuse guards for the API routes (contact form, Telegram nick check): who is calling, from where, how often, how big.
// Volumetric DDoS is absorbed by Vercel's edge (and Vercel Firewall rules); this only keeps one client from flooding
// our endpoints, the Telegram chat or the Resend quota.
//
// Rate limits use Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (shared by every
// serverless instance: the real limit). Without them an in-memory counter per instance is used: weaker (each instance
// counts on its own, a cold start resets it) but it still stops a single script hammering one warm instance.

type Hit = { ok: boolean; retryAfter: number };

const mem = new Map<string, { n: number; until: number }>();

function memHit(key: string, limit: number, windowSec: number): Hit {
  const now = Date.now();
  // drop expired counters now and then so the map never grows without bound
  if (mem.size > 5000) for (const [k, v] of mem) if (v.until <= now) mem.delete(k);
  const cur = mem.get(key);
  if (!cur || cur.until <= now) {
    mem.set(key, { n: 1, until: now + windowSec * 1000 });
    return { ok: true, retryAfter: 0 };
  }
  cur.n += 1;
  return { ok: cur.n <= limit, retryAfter: Math.ceil((cur.until - now) / 1000) };
}

async function redisHit(url: string, token: string, key: string, limit: number, windowSec: number): Promise<Hit | null> {
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      // INCR, set the window only on the first hit (NX), read what is left of it
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(windowSec), "NX"], ["TTL", key]]),
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const [inc, , ttl] = (await r.json()) as { result: number }[];
    const ttlSec = ttl?.result > 0 ? ttl.result : windowSec;
    return { ok: inc.result <= limit, retryAfter: ttlSec };
  } catch {
    return null; // Redis down: fall back to memory rather than block real visitors
  }
}

/** count one request for `key`; ok = still within `limit` per `windowSec` */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<Hit> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const k = `rl:${key}`;
  if (url && token) {
    const hit = await redisHit(url, token, k, limit, windowSec);
    if (hit) return hit;
  }
  return memHit(k, limit, windowSec);
}

/** the caller's IP as Vercel sees it (x-forwarded-for is set by Vercel's edge, the first entry is the client) */
export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

/**
 * Was this request made by a page of this site? Browsers always send Origin on a POST fetch and Sec-Fetch-Site on
 * every fetch, so another website cannot use our endpoints from its visitors' browsers. A script can fake both:
 * this is a filter, the rate limit is the guard.
 */
export function sameOrigin(req: Request, { requireOrigin }: { requireOrigin: boolean }) {
  const h = req.headers;
  const site = h.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = h.get("origin");
  if (!origin) return !requireOrigin;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  const own = h.get("x-forwarded-host") || h.get("host");
  if (own) allowed.add(own);
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
  } catch {}
  return allowed.has(host);
}

/** read a JSON body of at most `max` bytes; null = too big or not JSON */
export async function readJson(req: Request, max: number): Promise<Record<string, unknown> | "too-big" | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > max) return "too-big";
  const text = await req.text().catch(() => "");
  if (text.length > max) return "too-big";
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** API answers carry no cache and no sniffing */
export const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } as const;
