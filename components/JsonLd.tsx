import type { Lang, Plan } from "@/lib/content";
import { SLUG } from "@/lib/services";
import { contentFor, SITE_URL } from "@/lib/i18n";

/**
 * Structured data for search engines (schema.org JSON-LD): the studio as a ProfessionalService with its
 * contacts, area and an offer catalogue built from the pricing plans, plus the WebSite in both languages.
 * Everything comes from lib/content*, so it always matches what the page shows.
 */
export function JsonLd({ lang, plan }: { lang: Lang; plan?: Plan["id"] }) {
  const { BRAND, META, SERVICES, FAQ } = contentFor(lang);
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
      // the questions shown on the page (home and service pages): what search and AI answers quote
      {
        "@type": "FAQPage",
        mainEntity: FAQ.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      ...(plan ? servicePage(lang, plan, home, org) : []),
    ],
  };
  // `<` escaped so the JSON can never close the script tag
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** a service page: the Service itself (provider = the studio, price, area) + breadcrumbs Home › Services › this */
function servicePage(lang: Lang, id: Plan["id"], home: string, org: string) {
  const { SERVICES } = contentFor(lang);
  const p = SERVICES.plans.find((x) => x.id === id)!;
  const pg = SERVICES.pages.items[id];
  const url = `${lang === "en" ? `${SITE_URL}/en` : SITE_URL}/${SLUG[id]}`;
  return [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: p.name,
      serviceType: p.name,
      description: pg.description,
      url,
      provider: { "@id": org },
      areaServed: { "@type": "Country", name: lang === "en" ? "Ukraine" : "Україна" },
      offers: { "@type": "Offer", url, priceCurrency: "USD", price: p.price, priceSpecification: { "@type": "PriceSpecification", minPrice: p.price, priceCurrency: "USD" } },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SERVICES.pages.home, item: home },
        { "@type": "ListItem", position: 2, name: SERVICES.pages.crumb, item: `${home}#services` },
        { "@type": "ListItem", position: 3, name: p.name, item: url },
      ],
    },
  ];
}
