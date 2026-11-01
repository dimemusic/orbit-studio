import { Studio } from "@/components/sections/Studio";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Work } from "@/components/sections/Work";
import { JsonLd } from "@/components/JsonLd";
import type { Lang } from "@/lib/content";

// The one-page site: hero → «Як ми працюємо» → «Наші роботи» → прайс → заявка (shared by / and /en).
// About.tsx / Faq.tsx in components/sections are parked, not rendered.
export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd lang={lang} />
      <Hero />
      <Studio />
      <Work />
      <Pricing />
      <FinalCta />
    </>
  );
}
