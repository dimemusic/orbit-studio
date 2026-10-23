import { SectionProgress } from "@/components/SectionProgress";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";

// One-page studio site: hero → work → services → process → about → FAQ → contact (order in lib/content.ts → HOME_SECTIONS).
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Pricing />
      <Process />
      <About />
      <Faq />
      <FinalCta />
      <SectionProgress />
    </>
  );
}
