import { Suspense } from "react";
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
// Each section below the hero is its own <Suspense> boundary: React 19 then hydrates them one by one and yields to
// the browser between them, instead of one long task for the whole page (Lighthouse TBT). Their HTML is still in the
// page (streamed right after the shell and slotted in place); the hero is NOT wrapped, so it is in the shell itself
// and the first screen keeps that slotting below the fold (no layout shift, the LCP comes first). On phones the hero is
// shorter than the screen, so Build's boundary has a one-screen fallback.
export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd lang={lang} />
      {/* the first screen stays in the shell: it is the LCP and keeps everything streamed after it below the fold (no shift) */}
      <Hero />
      {/* the fallback holds one screen (= Build's own min height) until the streamed section is slotted in: on phones
          the hero is shorter than the screen, and without it the footer showed right under the hero and jumped (CLS 0.19) */}
      <Suspense fallback={<div aria-hidden="true" className="min-h-[100dvh]" />}>
        <Build />
      </Suspense>
      <Suspense>
        <Work />
      </Suspense>
      <Suspense>
        <Pricing />
      </Suspense>
      <Suspense>
        <Faq />
      </Suspense>
      <Suspense>
        <FinalCta />
      </Suspense>
    </>
  );
}
