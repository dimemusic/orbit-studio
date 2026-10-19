import { SectionProgress } from "@/components/SectionProgress";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Problem } from "@/components/sections/Problem";
import { Security } from "@/components/sections/Security";
import { Proof } from "@/components/sections/Testimonials";

// Home tells one story, one idea per screen (order in components/home.ts). Details live on inner pages.
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Problem />
      <HowItWorks />
      <Security />
      <Proof />
      <Pricing />
      <Faq />
      <FinalCta />
      <SectionProgress />
    </>
  );
}
