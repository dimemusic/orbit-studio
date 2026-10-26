import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { contentFor } from "@/lib/i18n";

const { PRIVACY } = contentFor("en");

export const metadata: Metadata = { title: PRIVACY.title };

export default function Privacy() {
  return <PageHero crumb={PRIVACY.crumb} title={PRIVACY.title} lead={PRIVACY.lead} />;
}
