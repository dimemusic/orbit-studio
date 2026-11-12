// Small language-independent constants. No copy imports here: client components that only need these
// must not pull a whole content file into their bundle.
import type { Lang } from "./content";

/** public origin for canonical / sitemap links (set NEXT_PUBLIC_SITE_URL once the domain is live) */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxartdigital.com";

/** the two words of the logo (never translated) */
export const WORDMARK = ["MaxArt", "Digital"] as const;

/** the same page in the other language: "/" ⇄ "/en", "/privacy" ⇄ "/en/privacy" */
export const otherPath = (path: string, to: Lang) => {
  const bare = path.replace(/^\/en(?=\/|$)/, "") || "/";
  return to === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
};
