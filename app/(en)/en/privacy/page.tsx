import { PageHero } from "@/components/ui/PageHero";
import { contentFor } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const { PRIVACY } = contentFor("en");

// placeholder text for now: kept out of search results until the real policy is in (then drop `noindex`)
export const metadata = pageMetadata("en", "/en/privacy", { title: PRIVACY.title, noindex: true });

export default function Privacy() {
  return <PageHero crumb={PRIVACY.crumb} title={PRIVACY.title} lead={PRIVACY.lead} />;
}
