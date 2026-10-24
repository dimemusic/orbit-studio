import { Build } from "@/components/sections/Build";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { SectionSnap } from "@/components/SectionSnap";

// Rebuilding the page section by section: hero → «Як ми працюємо» → «Наші роботи». Other sections stay in components/sections for reuse.
export default function Home() {
  return (
    <>
      <Hero />
      <Build />
      <Work />
      <SectionSnap />
    </>
  );
}
