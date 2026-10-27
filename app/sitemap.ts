import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n";

/** both languages of every page, linked to each other */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (uk: string, en: string, priority: number) => {
    const languages = { uk: `${SITE_URL}${uk}`, en: `${SITE_URL}${en}` };
    return [
      { url: languages.uk, priority, alternates: { languages } },
      { url: languages.en, priority, alternates: { languages } },
    ];
  };
  return [...page("/", "/en", 1), ...page("/privacy", "/en/privacy", 0.3)];
}
