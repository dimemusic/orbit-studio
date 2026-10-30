import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n";

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
  ];
}
