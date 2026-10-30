import type { Lang } from "@/lib/content";
import { contentFor, SITE_URL } from "@/lib/i18n";

/**
 * Structured data for search engines (schema.org JSON-LD): the studio as a ProfessionalService with its
 * contacts, area and an offer catalogue built from the pricing plans, plus the WebSite in both languages.
 * Everything comes from lib/content*, so it always matches what the page shows.
 */
export function JsonLd({ lang }: { lang: Lang }) {
  const { BRAND, META, SERVICES } = contentFor(lang);
  const home = lang === "en" ? `${SITE_URL}/en` : `${SITE_URL}/`;
  const org = `${SITE_URL}/#studio`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": org,
        name: BRAND.name,
        url: home,
        logo: `${SITE_URL}/icon.svg`,
        image: `${SITE_URL}/og-${lang}.png`,
        description: META.service,
        email: BRAND.email,
        sameAs: [BRAND.telegramUrl],
        address: { "@type": "PostalAddress", addressLocality: lang === "en" ? "Lviv" : "Львів", addressCountry: "UA" },
        areaServed: [{ "@type": "Country", name: lang === "en" ? "Ukraine" : "Україна" }, "Worldwide"],
        knowsLanguage: ["uk", "en"],
        priceRange: `$${Math.min(...SERVICES.plans.map((p) => p.price))}+`,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: SERVICES.listLabel,
          itemListElement: SERVICES.plans.map((p) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: p.name, description: `${p.for} ${p.features.join(", ")}.` },
            priceSpecification: { "@type": "PriceSpecification", minPrice: p.price, priceCurrency: "USD" },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: BRAND.name,
        inLanguage: lang,
        publisher: { "@id": org },
      },
    ],
  };
  // `<` escaped so the JSON can never close the script tag
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
