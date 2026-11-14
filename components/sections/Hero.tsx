"use client";

import { G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";
import { useContent } from "../Lang";

/**
 * 01: the promise, one primary + one secondary CTA, stats strip at the bottom of the screen.
 * Phones (< sm, asked Nov 2026): centred, one visible screen (100svh): the one 56 px button, «Наші роботи ↓» as a plain
 * link and three short facts in one row at the bottom, and the headline + lead centred in the space above them
 * (`my-auto`: the gap under the menu matches the gap above the button; pinned to the top it left a hole in the middle,
 * a shorter hero left an empty band of stars under the facts). From sm up: full screen, everything centred, two buttons, four facts on one line.
 * The hero copy is server-rendered as already revealed (`data-in`): it comes in when the boot ends
 * (html.booting removed by the head script / star field), without waiting for hydration, so it is the fast LCP.
 */
export function Hero() {
  const { CTA, HERO } = useContent();
  const [first, second, last] = HERO.title;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-[100svh] w-full flex-col px-gutter text-center sm:min-h-[100dvh]">
      <div className="flex flex-1 flex-col items-center pt-28 sm:justify-center sm:pb-10 sm:pt-32">
        <div className="plate my-auto flex flex-col items-center py-2 sm:my-0 sm:px-4 sm:py-8">
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

        <div data-reveal data-in style={{ ["--d" as string]: "160ms" }} className="flex w-full flex-col pt-8 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 sm:pt-0">
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

      <div data-reveal data-in style={{ ["--d" as string]: "280ms" }} className="mt-6 pb-8 sm:mt-0 lg:pb-12">
        <LogoStrip />
      </div>
    </section>
  );
}
