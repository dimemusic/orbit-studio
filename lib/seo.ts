import type { Metadata } from "next";
import type { Lang } from "./content";
import { contentFor, otherPath, SITE_URL } from "./i18n";

const OG_LOCALE: Record<Lang, string> = { uk: "uk_UA", en: "en_GB" };

/**
 * Metadata of one page: canonical + hreflang (uk, en, x-default = uk), Open Graph and Twitter card
 * with the per-language preview image (public/og-uk.png, public/og-en.png, 1200×630).
 * `path` is the page's own path ("/", "/privacy", "/en", "/en/privacy"); `title` overrides the site title.
 */
export function pageMetadata(lang: Lang, path: string, opts: { title?: string; noindex?: boolean } = {}): Metadata {
  const { META } = contentFor(lang);
  const uk = otherPath(path, "uk");
  const en = otherPath(path, "en");
  const title = opts.title ? `${opts.title} · MaxArt Digital` : META.title;
  const image = { url: `/og-${lang}.png`, width: 1200, height: 630, alt: META.ogAlt };
  return {
    title: opts.title ?? { absolute: META.title },
    description: META.description,
    alternates: { canonical: path, languages: { uk, en, "x-default": uk } },
    openGraph: {
      type: "website",
      url: path,
      siteName: "MaxArt Digital",
      title,
      description: META.description,
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === "uk" ? "en" : "uk"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: META.description, images: [image.url] },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

export { SITE_URL };
