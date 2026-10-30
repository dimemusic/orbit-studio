import { uk, type Content, type Lang } from "./content";
import { en } from "./content.en";

/** public origin for canonical / sitemap links (set NEXT_PUBLIC_SITE_URL once the domain is live) */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxartdigital.com";

export const DICT: Record<Lang, Content> = { uk, en };
export const contentFor = (lang: Lang) => DICT[lang];
/** the same page in the other language: "/" ⇄ "/en", "/privacy" ⇄ "/en/privacy" */
export const otherPath = (path: string, to: Lang) => {
  const bare = path.replace(/^\/en(?=\/|$)/, "") || "/";
  return to === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
};
