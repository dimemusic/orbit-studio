import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n";
import { SLUG } from "@/lib/services";

/**
 * Indexable pages in both languages, linked to each other (hreflang).
 * The privacy pages hold placeholder text (noindex) and join the sitemap once the real policy is in.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { uk: `${SITE_URL}/`, en: `${SITE_URL}/en` };
  const lastModified = new Date();
  return [
    { url: languages.uk, lastModified, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: languages.en, lastModified, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
    // one page per service, both languages
    ...Object.values(SLUG).flatMap((slug) => {
      const langs = { uk: `${SITE_URL}/${slug}`, en: `${SITE_URL}/en/${slug}` };
      return [
        { url: langs.uk, lastModified, changeFrequency: "monthly" as const, priority: 0.8, alternates: { languages: langs } },
        { url: langs.en, lastModified, changeFrequency: "monthly" as const, priority: 0.7, alternates: { languages: langs } },
      ];
    }),
  ];
}
