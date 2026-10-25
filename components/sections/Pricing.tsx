"use client";

import { Check, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState, type CSSProperties } from "react";
import { CTA, SERVICES, type Service } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { IconTile, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { useTween } from "../ui/hooks";
import { Icon } from "../ui/icons";
import { RevealWords } from "../ui/RevealWords";

const ITEMS: Service[] = SERVICES.items;
const TURNKEY = SERVICES.turnkey;
const FULL = ITEMS.reduce((s, i) => s + i.price, 0);
const money = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ${SERVICES.currency}`;
const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;
/** 1 день · 2–4 дні · 5+ днів */
const days = (n: number) => {
  const d = n % 10;
  const h = n % 100;
  return `${n} ${d === 1 && h !== 11 ? "день" : d >= 2 && d <= 4 && (h < 12 || h > 14) ? "дні" : "днів"}`;
};

/**
 * Services as a package builder: one full screen (lg+). Big word-by-word title + one line on the right, then
 * 3 service rows on hairlines (whole row toggles, picked = colour stripe + faint tint) and the «Ваш пакет» card
 * (.card-pro, sticky): picked services with prices, counting total, term; all three = the turnkey offer.
 * Everything picked by default. Phones: rows stacked, the package card under them, section may be taller.
 */
export function Pricing() {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(ITEMS.map((s) => s.id)));
  const chosen = ITEMS.filter((s) => picked.has(s.id));
  const all = chosen.length === ITEMS.length;
  const total = useTween(all ? TURNKEY.price : chosen.reduce((t, s) => t + s.price, 0), 600);
  const term = chosen.reduce((t, s) => t + s.days[0], 0);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col px-gutter pb-[clamp(24px,4.5vh,48px)] pt-[clamp(88px,12vh,128px)] lg:h-[100dvh]"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="services-title" className="legible text-mega font-semibold">
          <RevealWords text={SERVICES.title[0]} accent={SERVICES.title[1]} tone="fresh" />
        </h2>
        <p className="legible text-lead text-body">{SERVICES.lead}</p>
      </header>

      <div className="relative z-[1] flex w-full min-w-0 flex-1 items-center py-[clamp(24px,4vh,44px)] lg:min-h-0 lg:items-stretch lg:pb-0 lg:pt-[clamp(28px,5vh,56px)]">
        <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <ul aria-label={SERVICES.listLabel} className="min-w-0 lg:flex lg:flex-col">
            {ITEMS.map((s, i) => (
              <li key={s.id} data-reveal style={delay(i)} className="min-w-0 border-t border-white/[0.09] last:border-b lg:flex lg:flex-1 lg:flex-col">
                <Row s={s} on={picked.has(s.id)} onToggle={() => toggle(s.id)} />
              </li>
            ))}
          </ul>

          {/* the wrapper only moves (scale + rise), the card's content fades: no opacity on the glass */}
          <div data-reveal data-lift style={delay(ITEMS.length)} className="min-w-0 lg:self-stretch">
            <aside aria-label={SERVICES.package} className="card card-pro flex h-full flex-col p-7" data-hot={all ? "" : undefined}>
              {/* fixed min height (fits the full turnkey state), so toggling never shifts the centred layout */}
              <div className="lift-fade flex flex-1 flex-col" style={delay(ITEMS.length + 1)}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-title font-semibold text-fg">{SERVICES.package}</h3>
                  <span aria-hidden={!all} className={`transition-opacity duration-500 ${all ? "opacity-100" : "opacity-0"}`}>
                    <Tag color="blue">{TURNKEY.name}</Tag>
                  </span>
                </div>

                {/* picked services: each line folds open / shut */}
                <ul className="mt-4">
                  {ITEMS.map((s) => {
                    const on = picked.has(s.id);
                    return (
                      <li
                        key={s.id}
                        aria-hidden={!on}
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease)] ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                      >
                        <span className="flex min-h-0 items-center justify-between gap-3 overflow-hidden text-[15px]">
                          <span className="flex items-center gap-2.5 py-1.5 text-body">
                            <span aria-hidden="true" className={`size-1.5 rounded-full ${ACCENT[s.color].dot}`} />
                            {s.name}
                          </span>
                          <span className="tabular-nums text-fg">
                            {SERVICES.pricePrefix} {money(s.price)}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mb-6 mt-4 border-t border-white/[0.09] pt-5" aria-live="polite">
                  {chosen.length === 0 ? (
                    <p className="py-3 text-[15px] text-grey">{SERVICES.empty}</p>
                  ) : (
                    <>
                      <p className="text-[13px] text-grey">{all ? TURNKEY.name : SERVICES.total}</p>
                      <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[clamp(30px,2.6vw,40px)] font-semibold leading-none tracking-[-0.04em] text-fg tabular-nums">
                          {SERVICES.pricePrefix} {money(total)}
                        </span>
                        {all && <s className="text-[15px] text-faint tabular-nums">{money(FULL)}</s>}
                      </p>
                      {all && (
                        <p className="mt-2 text-[14px] text-green">
                          {SERVICES.save} {money(FULL - TURNKEY.price)}
                        </p>
                      )}
                      <p className="mt-3 text-[14px] text-body">
                        {SERVICES.term} {all ? TURNKEY.term : `${SERVICES.pricePrefix} ${days(term)}`}
                      </p>
                      {all && <p className="mt-1 text-[14px] text-grey">{TURNKEY.perks.join(" · ")}</p>}
                    </>
                  )}
                </div>

                <Button href="#contact" className="mt-auto w-full">
                  {CTA.primary}
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

/** a service on hairlines: icon · name + blurb · included (2 columns) · price + term · toggle. The whole row toggles. */
function Row({ s, on, onToggle }: { s: Service; on: boolean; onToggle: () => void }) {
  const a = ACCENT[s.color];
  return (
    <div
      onClick={onToggle}
      className={`relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 py-5 pl-4 pr-4 transition-colors lg:flex-1 lg:content-center duration-300 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 md:px-5 ${
        on ? "bg-white/[0.025]" : "md:hover:bg-white/[0.015]"
      }`}
    >
      {/* picked: a thin stripe in the service colour */}
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[2px] transition-opacity duration-300 ${a.dot} ${on ? "opacity-100" : "opacity-0"}`} />
      <IconTile color={s.color}>
        <Icon name={s.icon} />
      </IconTile>
      <div className="min-w-0">
        <h3 className="text-[clamp(22px,2vw,30px)] font-medium leading-tight tracking-[-0.03em] text-fg">{s.name}</h3>
        <p className="mt-1 text-[15px] leading-snug text-body">{s.blurb}</p>
        {/* what's included: tinted pills in the service colour, one line where it fits */}
        <ul className="mt-3.5 flex flex-wrap gap-2">
          {s.features.map((f) => (
            <li
              key={f}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium leading-none text-fg/90 ${a.border} ${a.tint}`}
            >
              <Check size={12} weight="bold" aria-hidden="true" className={`shrink-0 ${a.text}`} />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-5 md:col-span-1 md:self-center">
        <p className="md:text-right">
          <span className="block text-[22px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
            {SERVICES.pricePrefix} {money(s.price)}
          </span>
          <span className="mt-1.5 block text-[14px] text-grey">
            {s.days[0]}–{days(s.days[1])}
          </span>
        </p>
        <button
          type="button"
          aria-pressed={on}
          aria-label={`${on ? SERVICES.added : SERVICES.add}: ${s.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`inline-flex h-11 w-[7.5rem] shrink-0 items-center justify-center gap-1.5 rounded-full border text-[14px] font-semibold transition-[background-color,border-color,color] duration-300 ${
            on ? `border-transparent ${a.tint} ${a.text}` : "border-white/[0.18] text-fg hover:border-white/40 hover:bg-white/[0.07]"
          }`}
        >
          {on ? <Check size={14} weight="bold" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
          {on ? SERVICES.added : SERVICES.add}
        </button>
      </div>
    </div>
  );
}
