import { G } from "./Bits";
import { Button } from "./Button";

/** End of every inner page: a wide card that leads back to pricing. */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-band-title" className="w-full px-gutter pb-[clamp(72px,10vw,140px)] pt-[clamp(24px,4vw,56px)]">
      <div
        data-reveal
        className="card flex flex-col items-center gap-8 px-6 py-12 text-center sm:px-12 lg:flex-row lg:justify-between lg:py-14 lg:text-left"
      >
        <div>
          <h2 id="cta-band-title" className="text-headline font-semibold">
            Дай файлам <G tone="aurora">пам&apos;ять.</G>
          </h2>
          <p className="mt-3 text-[16px] text-body">20 ГБ безкоштовно, без картки. Обери тариф, коли знадобиться більше.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/#pricing">Обрати тариф</Button>
          <Button href="/signup" variant="secondary">
            Почати безкоштовно
          </Button>
        </div>
      </div>
    </section>
  );
}
