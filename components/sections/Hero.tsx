"use client";

import { G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";
import { useContent } from "../Lang";

/**
 * 01: the promise, one primary + one secondary CTA, stats strip at the bottom of the screen.
 * The hero copy is server-rendered as already revealed (`data-in`): it comes in when the boot ends
 * (html.booting removed by the head script / star field), without waiting for hydration, so it is the fast LCP.
 */
export function Hero() {
  const { CTA, HERO } = useContent();
  const [first, second, last] = HERO.title;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-[100dvh] w-full flex-col px-gutter text-left sm:text-center">
      <div className="flex flex-1 flex-col items-start justify-center pb-10 pt-28 sm:items-center sm:pt-32">
        <div className="plate flex flex-col items-start py-6 sm:items-center sm:px-4 sm:py-8">
          {/* no JS reveal on the headline: it is the LCP. `.hero-in` is a CSS-only blur-to-sharp entrance on the h1 as ONE element (split into words, the lead paragraph became the LCP and mobile PageSpeed fell to ~75) */}
          <h1 id="hero-title" className="hero-in legible text-mega font-semibold">
            {first}
            <br />
            {second} <G tone="violet">{last}</G>
          </h1>
          <p data-reveal data-in style={{ ["--d" as string]: "80ms" }} className="legible mt-6 max-w-[40rem] text-lead text-body sm:mt-8">
            {HERO.lead}
          </p>
        </div>

        <div data-reveal data-in style={{ ["--d" as string]: "160ms" }} className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button href="#contact" className="w-full sm:w-64">{CTA.primary}</Button>
          <Button href="#work" variant="secondary" className="w-full sm:w-64">
            {CTA.work}
          </Button>
        </div>
      </div>

      <div>
        <div data-reveal data-in style={{ ["--d" as string]: "280ms" }} className="pb-8 lg:pb-12">
          <LogoStrip />
        </div>
      </div>
    </section>
  );
}
