"use client";

import { G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";
import { useContent } from "../Lang";

/**
 * 01: the promise, one primary + one secondary CTA, stats strip at the bottom of the screen.
 * The entrance is pure CSS keyed to the boot (globals.css «hero entrance»): when html.booting goes, the title
 * lines rise out of a mask, then the lead, the buttons and the stats follow. No JS involved, so it is the fast LCP.
 */
export function Hero() {
  const { CTA, HERO } = useContent();
  const [first, second, last] = HERO.title;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-[100dvh] w-full flex-col px-gutter text-center">
      <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-32">
        <div className="plate flex flex-col items-center px-4 py-8">
          <h1 id="hero-title" className="legible text-mega font-semibold">
            <span className="hl">
              <span>{first}</span>
            </span>
            <span className="hl">
              <span style={{ ["--l" as string]: 1 }}>
                {second} <G tone="violet">{last}</G>
              </span>
            </span>
          </h1>
          <p data-hero style={{ ["--d" as string]: "220ms" }} className="legible mt-8 max-w-[64ch] text-lead text-body">
            {HERO.lead}
          </p>
        </div>

        <div data-hero style={{ ["--d" as string]: "340ms" }} className="mt-8 flex w-full flex-wrap justify-center gap-3">
          <Button href="#contact">{CTA.primary}</Button>
          <Button href="#work" variant="secondary">
            {CTA.work}
          </Button>
        </div>
      </div>

      <div data-hero style={{ ["--d" as string]: "480ms" }} className="plate pb-[clamp(28px,4vw,48px)]">
        <LogoStrip />
      </div>
    </section>
  );
}
