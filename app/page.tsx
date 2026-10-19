import { SectionProgress } from "@/components/SectionProgress";
import { About } from "@/components/sections/About";
import { AdminDemo } from "@/components/sections/AdminDemo";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Guarantees } from "@/components/sections/Guarantees";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Team } from "@/components/sections/Testimonials";
import { Work } from "@/components/sections/Work";

// One-page studio site, one idea per screen (order in lib/content.ts → HOME_SECTIONS).
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <About />
      <Pricing />
      <AdminDemo />
      <Process />
      <Team />
      <Guarantees />
      <Faq />
      <FinalCta />
      <SectionProgress />
    </>
  );
}
