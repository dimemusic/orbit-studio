import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CTA, SERVICES } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G, IconTile, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";
import { Icon } from "../ui/icons";

const TURNKEY = SERVICES.turnkey;

/**
 * Services: three equal service cards (icon, name, one line, price, what's included),
 * then the turnkey package as one wide card with the gradient border.
 */
export function Pricing() {
  return (
    <HomeSection
      id="services"
      label={SERVICES.label}
      color="blue"
      title={
        <>
          {SERVICES.title[0]} <G tone="fresh">{SERVICES.title[1]}</G>
        </>
      }
      lead={SERVICES.lead}
    >
      <div className="grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
        {SERVICES.items.map((s, i) => (
          <article key={s.id} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className="card flex flex-col p-7 text-left">
            <IconTile color={s.color}>
              <Icon name={s.icon} />
            </IconTile>
            <h3 className="mt-5 text-title font-semibold">{s.name}</h3>
            <p className="mt-1.5 text-[15px] text-body">{s.blurb}</p>

            <ul className="mt-6 flex flex-col gap-2.5 border-t border-white/[0.07] pt-6">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px] text-body">
                  <CheckCircle size={18} weight="fill" aria-hidden="true" className={`shrink-0 ${ACCENT[s.color].text}`} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-end justify-between gap-4 pt-8">
              <p className="flex items-baseline gap-1.5">
                <span className="text-[15px] text-body">{SERVICES.pricePrefix}</span>
                <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-fg">{s.price}</span>
              </p>
              <a
                href="#contact"
                aria-label={`${CTA.primary}: ${s.name}`}
                className="group/l inline-flex items-center gap-1 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
              >
                Замовити
                <span aria-hidden="true" className="transition-transform duration-300 group-hover/l:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* the turnkey package: same card, gradient border */}
      <div data-reveal style={{ ["--d" as string]: "200ms" }} className="mt-5 w-full">
        <article className="card card-pro grid gap-8 px-7 py-9 text-left sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[clamp(26px,2.4vw,36px)] font-semibold tracking-[-0.03em]">
                <G>{TURNKEY.name}</G>
              </h3>
              <Tag color="blue">{TURNKEY.tag}</Tag>
            </div>
            <p className="mt-2 max-w-[56ch] text-[16px] text-body">{TURNKEY.blurb}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {TURNKEY.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px] text-body">
                  <CheckCircle size={18} weight="fill" aria-hidden="true" className="shrink-0 text-cyan" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <p className="flex items-baseline gap-2">
              <span className="text-[18px] text-body">{SERVICES.pricePrefix}</span>
              <span className="text-[clamp(40px,4vw,64px)] font-semibold leading-none tracking-[-0.055em] text-fg">{TURNKEY.price}</span>
            </p>
            <Button href="#contact">{CTA.primary}</Button>
          </div>
        </article>
      </div>
    </HomeSection>
  );
}
