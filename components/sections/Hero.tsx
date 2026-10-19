import { homeNum } from "../home";
import { Eyebrow, G } from "../ui/Bits";
import { Button } from "../ui/Button";
import { LogoStrip } from "./Logos";

/** 01: the promise, one primary + one secondary CTA, studio strip at the bottom of the screen. */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-[100dvh] w-full flex-col px-gutter text-center">
      <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-32">
        <div className="plate flex flex-col items-center px-4 py-8">
          <div data-reveal>
            <Eyebrow color="blue">
              <span className="tabular-nums">{homeNum("top")} · </span>Хмара для креативних команд
            </Eyebrow>
          </div>
          <h1 id="hero-title" data-reveal style={{ ["--d" as string]: "80ms" }} className="legible mt-7 text-mega font-semibold">
            Усі файли.
            <br />
            Одна <G>пам&apos;ять.</G>
          </h1>
          <p data-reveal style={{ ["--d" as string]: "160ms" }} className="legible mt-8 max-w-[64ch] text-lead text-body">
            Пам&apos;ятає кожну версію, правку й експорт. Шифрує ще на твоєму пристрої.
          </p>
        </div>

        <div data-reveal style={{ ["--d" as string]: "240ms" }} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/signup">Почати безкоштовно</Button>
          <Button href="#how" variant="secondary">
            Як це працює
          </Button>
        </div>
      </div>

      <div data-reveal style={{ ["--d" as string]: "360ms" }} className="plate pb-[clamp(28px,4vw,48px)]">
        <LogoStrip />
      </div>
    </section>
  );
}
