import type { Plan } from "./content";

/** URL of each plan's SEO page (the same slug in both languages: /landing-page and /en/landing-page) */
export const SLUG: Record<Plan["id"], string> = {
  card: "business-card-site",
  landing: "landing-page",
  shop: "online-store",
  corp: "corporate-website",
};

export const planBySlug = (slug: string) => (Object.keys(SLUG) as Plan["id"][]).find((id) => SLUG[id] === slug);

/** the «website development across Ukraine» page (same slug in both languages: /website-development-ukraine and /en/…) */
export const GEO_SLUG = "website-development-ukraine";
