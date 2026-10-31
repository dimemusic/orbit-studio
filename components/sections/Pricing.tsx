"use client";

import { Buildings, Check, IdentificationCard, Rocket, ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import type { Plan } from "@/lib/content";
import { PACKAGE_PICK } from "../home";
import { useContent } from "../Lang";
import { ACCENT, type Accent } from "../ui/accent";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { SplitTitle } from "../ui/SplitTitle";

const ICON = { card: IdentificationCard, landing: Rocket, shop: ShoppingBag, corp: Buildings } as const;
const COLOR: Record<Plan["id"], Accent> = { card: "cyan", landing: "violet", shop: "green", corp: "blue" };

/**
 * Pricing by website type: one full screen (lg+). Title + one line on the right, then 4 plan rows on hairlines
 * (icon, name + who it's for + included pills, «від $N» + term, «Обрати» → the form with that type picked).
 * The recommended plan gets a blue stripe, a faint tint, a badge and the primary button. Under the list: one line of extras.
 */
export function Pricing() {
  const { SERVICES, CONTACT, UI } = useContent();
  const pick = (i: number) => window.dispatchEvent(new CustomEvent(PACKAGE_PICK, { detail: [CONTACT.chips[i]] }));

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative flex min-h-[100dvh] w-full flex-col justify-center px-gutter pb-10 pt-28"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="services-title" className="legible text-mega font-semibold">
          <SplitTitle text={SERVICES.title[0]} accent={SERVICES.title[1]} tone="violet" />
        </h2>
        <p data-reveal className="legible max-w-[34ch] text-lead text-body">{SERVICES.lead}</p>
      </header>

      {/* plans as rows on hairlines: icon · name + who it's for + included · price + term · «Обрати» */}
      <ul aria-label={SERVICES.listLabel} className="relative z-[1] mt-10 w-full min-w-0">
        {SERVICES.plans.map((p, i) => {
          const a = ACCENT[COLOR[p.id]];
          const Ic = ICON[p.id];
          return (
            <li key={p.id} data-reveal="row" className="min-w-0 border-t border-white/[0.09] last:border-b">
              <article
                aria-labelledby={`plan-${p.id}`}
                className={`relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 py-5 pl-4 pr-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-x-6 md:px-5 ${
                  p.hot ? "bg-linear-to-r from-white/[0.035] via-white/[0.015] to-transparent" : ""
                }`}
              >
                {/* recommended: a stripe in the plan colour */}
                {p.hot && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px] bg-blue" />}
                <span data-row-icon className={`grid size-11 place-items-center self-start rounded-xl md:self-center ${a.tint} ${a.text}`}>
                  <Ic size={22} weight="light" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 id={`plan-${p.id}`} className="text-[clamp(22px,2vw,30px)] font-medium leading-tight tracking-[-0.03em] text-fg">
                      {p.name}
                    </h3>
                    {p.hot && <Tag color="blue">{SERVICES.hot}</Tag>}
                  </div>
                  <p className="mt-1 text-[15px] leading-snug text-body">{p.for}</p>
                  <ul className="mt-3 flex flex-wrap gap-2 lg:[@media(max-height:52rem)]:hidden">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium leading-none text-fg/90 ${a.border} ${a.tint}`}
                      >
                        <Check size={12} weight="bold" aria-hidden="true" className={a.text} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-5 md:col-span-1 md:gap-8">
                  <p className="md:text-right">
                    <span className="flex items-baseline gap-1.5 md:justify-end">
                      <span className="text-[14px] text-grey">{SERVICES.pricePrefix}</span>
                      <span className="text-[clamp(24px,2vw,30px)] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
                        {SERVICES.currency}
                        {p.price.toLocaleString(UI.locale)}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[14px] text-grey">
                      {SERVICES.term} {UI.days(p.days)}
                    </span>
                  </p>
                  <Button href="#contact" size="nav" variant={p.hot ? "primary" : "secondary"} onClick={() => pick(i)} className="w-[9rem] shrink-0">
                    {SERVICES.choose}
                  </Button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* extras: one quiet line under the list */}
      <p data-reveal className="legible relative z-[1] mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-body">
        <span className="text-grey">{SERVICES.extrasLabel}:</span>
        {SERVICES.extras.map((e) => (
          <span key={e.name}>
            {e.name} <span className="font-semibold text-fg">{e.price}</span>
          </span>
        ))}
      </p>
    </section>
  );
}
