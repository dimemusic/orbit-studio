import { Build } from "@/components/sections/Build";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Work } from "@/components/sections/Work";
import { JsonLd } from "@/components/JsonLd";
import type { Lang } from "@/lib/content";

// The one-page site: hero → «Як ми працюємо» → «Наші роботи» → прайс → заявка (shared by / and /en).
// → питання (FAQ, also FAQPage JSON-LD). About.tsx is parked, not rendered.
export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd lang={lang} />
      <Hero />
      <Build />
      <Work />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
