import { Build } from "@/components/sections/Build";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Work } from "@/components/sections/Work";
import { SectionSnap } from "@/components/SectionSnap";

// The one-page site: hero → «Як ми працюємо» → «Наші роботи» → прайс → заявка (shared by / and /en).
// About.tsx / Faq.tsx in components/sections are parked, not rendered.
export function HomePage() {
  return (
    <>
      <Hero />
      <Build />
      <Work />
      <Pricing />
      <FinalCta />
      <SectionSnap />
    </>
  );
}
