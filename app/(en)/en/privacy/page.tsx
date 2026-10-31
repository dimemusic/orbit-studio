import { PrivacyBody } from "@/components/PrivacyBody";
import { PageHero } from "@/components/ui/PageHero";
import { contentFor } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const { PRIVACY } = contentFor("en");

// the policy text is in, but the data controller's legal name / address are still placeholders: keep it out of
// search results until they are filled in (then drop `noindex` and add the page to app/sitemap.ts)
export const metadata = pageMetadata("en", "/en/privacy", { title: PRIVACY.title, noindex: true });

export default function Privacy() {
  return (
    <>
      <PageHero crumb={PRIVACY.crumb} title={PRIVACY.title} lead={PRIVACY.lead} />
      <PrivacyBody />
    </>
  );
}
