import type { Lang, Plan } from "@/lib/content";
import { GEO_SLUG, SLUG } from "@/lib/services";
import { contentFor, SITE_URL } from "@/lib/i18n";

/**
 * Structured data for search engines (schema.org JSON-LD): the studio as a ProfessionalService with its
 * contacts, area and an offer catalogue built from the pricing plans, plus the WebSite in both languages.
 * Everything comes from lib/content*, so it always matches what the page shows.
 */
export function JsonLd({ lang, plan, geo }: { lang: Lang; plan?: Plan["id"]; geo?: boolean }) {
  const { BRAND, META, SERVICES, GEO, FAQ: SITE_FAQ } = contentFor(lang);
  // the «all Ukraine» page quotes its own questions, every other page the site-wide ones
  const FAQ = geo ? GEO.faq : SITE_FAQ;
  const country = { "@type": "Country", name: lang === "en" ? "Ukraine" : "Україна" };
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
        // the whole country plus each city we name on /website-development-ukraine (we work online with all of them)
        areaServed: [country, ...GEO.cities.map((name) => ({ "@type": "City", name })), "Worldwide"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: lang === "en" ? "sales" : "відділ продажів",
          email: BRAND.email,
          availableLanguage: ["uk", "en"],
          areaServed: "UA",
        },
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
      // the questions shown on the page (home, «all Ukraine»): service pages have no FAQ, and the schema must match what is visible
      ...(plan
        ? servicePage(lang, plan, home, org)
        : [
            {
              "@type": "FAQPage",
              mainEntity: FAQ.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ]),
      ...(geo ? geoPage(lang, home, org) : []),
    ],
  };
  // `<` escaped so the JSON can never close the script tag
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** the «all Ukraine» page: a WebPage about the studio's coverage + breadcrumbs Home › Services › this */
function geoPage(lang: Lang, home: string, org: string) {
  const { SERVICES, GEO } = contentFor(lang);
  const url = `${lang === "en" ? `${SITE_URL}/en` : SITE_URL}/${GEO_SLUG}`;
  return [
    { "@type": "WebPage", "@id": `${url}#page`, url, name: GEO.page.title, description: GEO.page.description, inLanguage: lang, isPartOf: { "@id": `${home}#website` }, about: { "@id": org } },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SERVICES.pages.home, item: home },
        { "@type": "ListItem", position: 2, name: GEO.page.crumb, item: `${home}#services` },
        { "@type": "ListItem", position: 3, name: GEO.link, item: url },
      ],
    },
  ];
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
