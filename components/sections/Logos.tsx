import { HERO } from "@/lib/content";

/** Small strip under the hero promise: availability pill, then the trust points. */
export function LogoStrip() {
  return (
    <div className="w-full">
      {/* hug-content pill: padding around the text, thin border, soft glass so it reads over the particles */}
      <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[rgb(6_8_14/0.6)] px-4 py-2 text-[14px] text-body backdrop-blur-md">
        <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-green" />
        {HERO.availability}
      </p>
      <ul aria-label="Чому ми" className="mt-7 grid w-full grid-cols-2 items-center gap-x-6 gap-y-4 text-[clamp(15px,1.3vw,19px)] text-fg/60 lg:flex lg:justify-between">
        {HERO.trust.map((t) => (
          <li key={t} className="whitespace-nowrap font-medium tracking-[-0.02em] max-sm:whitespace-normal">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
