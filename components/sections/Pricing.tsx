"use client";

import { Buildings, Check, IdentificationCard, Rocket, ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import type { Plan } from "@/lib/content";
import { PACKAGE_PICK } from "../home";
import { useContent } from "../Lang";
import { ACCENT, type Accent } from "../ui/accent";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { RevealWords } from "../ui/RevealWords";

const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;
const ICON = { card: IdentificationCard, landing: Rocket, shop: ShoppingBag, corp: Buildings } as const;
const COLOR: Record<Plan["id"], Accent> = { card: "cyan", landing: "violet", shop: "green", corp: "blue" };

/**
 * Pricing by website type: one full screen (lg+). Title + one line on the right, then 4 plan cards
 * (icon, name, who it's for, «від $N», term, 4 included items, «Обрати» → the form with that type picked).
 * The recommended plan is a .card-pro with a badge and a primary button. Under the cards: one line of extras.
 */
export function Pricing() {
  const { SERVICES, CONTACT, UI } = useContent();
  const pick = (i: number) => window.dispatchEvent(new CustomEvent(PACKAGE_PICK, { detail: [CONTACT.chips[i]] }));

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col justify-center px-gutter pb-[clamp(24px,4.5vh,48px)] pt-[clamp(88px,12vh,128px)] lg:h-[100dvh]"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="services-title" className="legible text-mega font-semibold">
          <RevealWords text={SERVICES.title[0]} accent={SERVICES.title[1]} tone="violet" />
        </h2>
        <p className="legible max-w-[34ch] text-lead text-body">{SERVICES.lead}</p>
      </header>

      <ul
        aria-label={SERVICES.listLabel}
        className="relative z-[1] mt-[clamp(20px,3.5vh,48px)] grid w-full min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5"
      >
        {SERVICES.plans.map((p, i) => {
          const a = ACCENT[COLOR[p.id]];
          const Ic = ICON[p.id];
          return (
            <li key={p.id} data-reveal style={delay(i)} className="flex min-w-0">
              <article
                aria-labelledby={`plan-${p.id}`}
                className={`card flex w-full flex-col px-[clamp(20px,1.8vw,28px)] py-[clamp(18px,2.6vh,28px)] ${p.hot ? "card-pro" : ""}`}
                data-hot={p.hot ? "" : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid size-11 place-items-center rounded-xl ${a.tint} ${a.text}`}>
                    <Ic size={22} weight="light" aria-hidden="true" />
                  </span>
                  {p.hot && <Tag color="blue">{SERVICES.hot}</Tag>}
                </div>

                <h3 id={`plan-${p.id}`} className="mt-[clamp(12px,2vh,20px)] text-[clamp(20px,1.6vw,24px)] font-semibold leading-tight tracking-[-0.03em] text-fg">
                  {p.name}
                </h3>
                <p className="mt-1.5 text-[14px] leading-snug text-grey">{p.for}</p>

                <p className="mt-[clamp(12px,2vh,20px)] flex items-baseline gap-2">
                  <span className="text-[14px] text-grey">{SERVICES.pricePrefix}</span>
                  <span className="text-[clamp(32px,2.6vw,42px)] font-semibold leading-none tracking-[-0.04em] text-fg tabular-nums">
                    {SERVICES.currency}
                    {p.price.toLocaleString(UI.locale)}
                  </span>
                </p>
                <p className="mt-2 text-[14px] text-body">
                  {SERVICES.term} {UI.days(p.days)}
                </p>

                <ul className="mt-[clamp(12px,2vh,20px)] flex flex-col gap-[clamp(6px,1vh,10px)] border-t border-white/[0.09] pt-[clamp(12px,2vh,20px)]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[15px] leading-snug text-body">
                      <Check size={15} weight="bold" aria-hidden="true" className={`shrink-0 ${a.text}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-[clamp(14px,2.4vh,24px)]">
                  <Button href="#contact" size="nav" variant={p.hot ? "primary" : "secondary"} onClick={() => pick(i)} className="w-full">
                    {SERVICES.choose}
                  </Button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* extras: one quiet line under the cards */}
      <p className="legible relative z-[1] mt-[clamp(16px,3vh,28px)] flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-body">
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
