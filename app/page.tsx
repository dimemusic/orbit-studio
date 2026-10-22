import { SectionProgress } from "@/components/SectionProgress";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";

// One-page studio site: hero → work → services → process → FAQ → contact (order in lib/content.ts → HOME_SECTIONS).
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Pricing />
      <Process />
      <Faq />
      <FinalCta />
      <SectionProgress />
    </>
  );
}
