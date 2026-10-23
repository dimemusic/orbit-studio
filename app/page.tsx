import { Build } from "@/components/sections/Build";
import { Hero } from "@/components/sections/Hero";
import { SectionSnap } from "@/components/SectionSnap";

// Rebuilding the page section by section: hero → «Як ми працюємо». Other sections stay in components/sections for reuse.
export default function Home() {
  return (
    <>
      <Hero />
      <Build />
      <SectionSnap />
    </>
  );
}
