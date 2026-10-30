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
    <section id="top" aria-labelledby="hero-title" className="snap-section relative flex min-h-[100dvh] w-full flex-col px-gutter text-center">
      <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-32">
        <div className="plate flex flex-col items-center px-4 py-8">
          <h1 id="hero-title" data-reveal data-in className="legible text-mega font-semibold">
            {first}
            <br />
            {second} <G tone="violet">{last}</G>
          </h1>
          <p data-reveal data-in style={{ ["--d" as string]: "80ms" }} className="legible mt-8 max-w-[64ch] text-lead text-body">
            {HERO.lead}
          </p>
        </div>

        <div data-reveal data-in style={{ ["--d" as string]: "160ms" }} className="mt-8 flex w-full flex-wrap justify-center gap-3">
          <Button href="#contact">{CTA.primary}</Button>
          <Button href="#work" variant="secondary">
            {CTA.work}
          </Button>
        </div>
      </div>

      <div data-reveal data-in style={{ ["--d" as string]: "280ms" }} className="plate pb-[clamp(28px,4vw,48px)]">
        <LogoStrip />
      </div>
    </section>
  );
}
