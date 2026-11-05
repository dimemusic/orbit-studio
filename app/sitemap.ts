import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n";
import { GEO_SLUG, SLUG } from "@/lib/services";

/**
 * Last real content change of the public pages (YYYY-MM-DD). Bump it in the same commit whenever the copy of a page
 * changes: Google trusts <lastmod> only if it is accurate, so it must never be «now» on every build.
 * changefreq / priority are left out on purpose (Google ignores both).
 * Indexable pages in both languages, linked to each other (hreflang). The privacy pages hold placeholder text (noindex)
 * and join the sitemap once the real policy is in.
 */
export const LAST_UPDATED = "2026-11-05";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(LAST_UPDATED);
  const pair = (path: string) => {
    const languages = { uk: `${SITE_URL}${path}`, en: `${SITE_URL}/en${path === "/" ? "" : path}`, "x-default": `${SITE_URL}${path}` };
    return [
      { url: languages.uk, lastModified, alternates: { languages } },
      { url: languages.en, lastModified, alternates: { languages } },
    ];
  };
  return [...pair("/"), ...pair(`/${GEO_SLUG}`), ...Object.values(SLUG).flatMap((slug) => pair(`/${slug}`))];
}
