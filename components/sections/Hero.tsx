"use client";

import { G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";
import { useContent } from "../Lang";

/**
 * 01: the promise, one primary + one secondary CTA, stats strip at the bottom of the screen.
 * Phones (< sm, asked Nov 2026): centred and compact, NOT a full screen (a full-screen hero looked like the whole
 * page, so people did not scroll): one 56 px button, «Наші роботи ↓» as a plain link, three short facts in one row,
 * and the next section peeks in. From sm up: full screen, two buttons, the four facts on one line.
 * The hero copy is server-rendered as already revealed (`data-in`): it comes in when the boot ends
 * (html.booting removed by the head script / star field), without waiting for hydration, so it is the fast LCP.
 */
export function Hero() {
  const { CTA, HERO } = useContent();
  const [first, second, last] = HERO.title;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex w-full flex-col px-gutter text-center sm:min-h-[100dvh]">
      <div className="flex flex-col items-center pt-32 sm:flex-1 sm:justify-center sm:pb-10">
        <div className="plate flex flex-col items-center py-2 sm:px-4 sm:py-8">
          {/* no JS reveal on the headline: it is the LCP. `.hero-in` is a CSS-only blur-to-sharp entrance on the h1 as ONE element (split into words, the lead paragraph became the LCP and mobile PageSpeed fell to ~75) */}
          <h1 id="hero-title" className="hero-in legible text-mega font-semibold">
            {first}
            <br />
            {second} <G tone="violet">{last}</G>
          </h1>
          <p data-reveal data-in style={{ ["--d" as string]: "80ms" }} className="legible mt-5 max-w-[40rem] text-lead text-body sm:mt-8">
            {HERO.lead}
          </p>
        </div>

        <div data-reveal data-in style={{ ["--d" as string]: "160ms" }} className="mt-6 flex w-full flex-col sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
          <Button href="#contact" size="hero" className="w-full sm:w-64">{CTA.primary}</Button>
          {/* phones: a plain link under the one button; from sm: the usual secondary button */}
          <a href="#work" className="mt-2 flex h-12 w-full items-center justify-center gap-2 text-base font-semibold text-fg sm:hidden">
            {CTA.work} <span aria-hidden="true">↓</span>
          </a>
          <span className="hidden sm:contents">
            <Button href="#work" variant="secondary" className="w-64">
              {CTA.work}
            </Button>
          </span>
        </div>
      </div>

      <div data-reveal data-in style={{ ["--d" as string]: "280ms" }} className="mt-6 pb-16 sm:mt-0 sm:pb-8 lg:pb-12">
        <LogoStrip />
      </div>
    </section>
  );
}
