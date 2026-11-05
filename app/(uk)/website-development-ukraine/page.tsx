import { GeoPage } from "@/components/GeoPage";
import { JsonLd } from "@/components/JsonLd";
import { contentFor } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const g = contentFor("uk").GEO.page;

export const metadata = pageMetadata("uk", "/website-development-ukraine", { title: g.title, description: g.description });

export default function Page() {
  return (
    <>
      <JsonLd lang="uk" geo />
      <GeoPage />
    </>
  );
}
