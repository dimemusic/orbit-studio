import { CTA, HERO } from "@/lib/content";
import { G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";

/** 01: the promise, one primary + one secondary CTA, stats strip at the bottom of the screen. */
export function Hero() {
  const [first, second, last] = HERO.title;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-[100dvh] w-full flex-col px-gutter text-center">
      <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-32">
        <div className="plate flex flex-col items-center px-4 py-8">
          <h1 id="hero-title" data-reveal className="legible text-mega font-semibold">
            {first}
            <br />
            {second} <G>{last}</G>
          </h1>
          <p data-reveal style={{ ["--d" as string]: "80ms" }} className="legible mt-8 max-w-[64ch] text-lead text-body">
            {HERO.lead}
          </p>
        </div>

        <div data-reveal style={{ ["--d" as string]: "160ms" }} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="#contact">{CTA.primary}</Button>
          <Button href="#work" variant="secondary">
            {CTA.work}
          </Button>
        </div>
      </div>

      <div data-reveal style={{ ["--d" as string]: "280ms" }} className="plate pb-[clamp(28px,4vw,48px)]">
        <LogoStrip />
      </div>
    </section>
  );
}
