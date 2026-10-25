"use client";

import { ArrowRight, Check, CheckCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState, type CSSProperties } from "react";
import { CTA, SERVICES } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G, IconTile, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { Icon } from "../ui/icons";

const ITEMS = SERVICES.items;
const TURNKEY = SERVICES.turnkey;
const delay = (i: number) => ({ "--d": `${i * 90}ms` }) as CSSProperties;

/**
 * Services: one full screen in Work's language. Big title + one line on the right, then 4 equal columns:
 * 3 service cards with «Додати» toggles and the turnkey card (.card-pro), and a live summary line below.
 * All three picked → the turnkey card lights up (thicker gradient ring + «Ваш вибір») and the summary points to it.
 * Phones: one column, turnkey first; below lg the section may grow taller than the screen.
 */
export function Pricing() {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const all = picked.size === ITEMS.length;
  const names = ITEMS.filter((s) => picked.has(s.id)).map((s) => s.name);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toTurnkey = () => {
    const cta = document.getElementById("turnkey-cta");
    cta?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    cta?.focus({ preventScroll: true });
  };

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col px-gutter pb-[clamp(24px,4.5vh,48px)] pt-[clamp(88px,12vh,128px)] lg:h-[100dvh]"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="services-title" className="legible text-mega font-semibold">
          {SERVICES.title[0]} <G tone="fresh">{SERVICES.title[1]}</G>
        </h2>
        <p className="legible text-lead text-body">{SERVICES.lead}</p>
      </header>

      <div className="relative z-[1] mt-[clamp(24px,4vh,44px)] grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-4 lg:gap-[clamp(14px,1.4vw,20px)]">
        {ITEMS.map((s, i) => {
          const on = picked.has(s.id);
          const a = ACCENT[s.color];
          return (
            <div key={s.id} data-reveal style={delay(i)} className="flex min-w-0">
              <article className={`card flex w-full flex-col p-[clamp(20px,1.8vw,28px)] text-left transition-[border-color] duration-500 ${on ? a.border : ""}`}>
                <IconTile color={s.color}>
                  <Icon name={s.icon} />
                </IconTile>
                <h3 className="mt-5 text-[clamp(22px,2vw,30px)] font-medium leading-tight tracking-[-0.03em] text-fg">{s.name}</h3>
                <p className="mt-1.5 text-[15px] leading-snug text-body">{s.blurb}</p>
                <ul className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.07] pt-5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[15px] leading-snug text-body">
                      <Check size={14} weight="bold" aria-hidden="true" className={`shrink-0 ${a.text}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-[15px] text-body">{SERVICES.pricePrefix}</span>
                    <span className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-fg">{s.price}</span>
                  </p>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${on ? SERVICES.added : SERVICES.add}: ${s.name}`}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition-[background-color,border-color,color] duration-300 ${
                      on ? `border-transparent ${a.tint} ${a.text}` : "border-white/[0.18] text-fg hover:border-white/40 hover:bg-white/[0.07]"
                    }`}
                  >
                    {on ? SERVICES.added : SERVICES.add}
                    {on ? <Check size={14} weight="bold" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                  </button>
                </div>
              </article>
            </div>
          );
        })}

        {/* turnkey: first on phones, last column on desktop */}
        <div data-reveal style={delay(ITEMS.length)} className="order-first flex min-w-0 md:order-none">
          <article
            data-hot={all ? "" : undefined}
            className="card card-pro flex w-full flex-col p-[clamp(20px,1.8vw,28px)] text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <Tag color="blue">{TURNKEY.name}</Tag>
              <span aria-hidden={!all} className={`transition-opacity duration-500 ${all ? "opacity-100" : "opacity-0"}`}>
                <Tag color="green">{TURNKEY.best}</Tag>
              </span>
            </div>
            <h3 className="mt-5 text-[clamp(22px,2vw,30px)] font-medium leading-tight tracking-[-0.03em] text-fg">{TURNKEY.blurb}</h3>
            <ul className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.07] pt-5">
              {TURNKEY.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[15px] leading-snug text-body">
                  <CheckCircle size={18} weight="fill" aria-hidden="true" className="shrink-0 text-blue" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <p className="flex items-baseline gap-2">
                <span className="text-[16px] text-body">{SERVICES.pricePrefix}</span>
                <span className="text-[clamp(32px,2.8vw,44px)] font-semibold leading-none tracking-[-0.045em] text-fg">{TURNKEY.price}</span>
              </p>
              <p className="mt-2 text-[14px] text-green">{TURNKEY.save}</p>
              <Button id="turnkey-cta" href="#contact" className="mt-5 w-full">
                {CTA.primary}
              </Button>
            </div>
          </article>
        </div>
      </div>

      {/* live summary: no data-reveal, it sits too low on the screen for the reveal observer to ever fire */}
      <div
        aria-live="polite"
        className="relative z-[1] mt-4 flex min-h-11 w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[15px]"
      >
        {names.length ? (
          <>
            <span className="text-grey">{SERVICES.summaryLabel}</span>
            <span className="font-medium text-fg">{names.join(" + ")}</span>
            <span className="text-grey">·</span>
            <span className="text-body">
              {SERVICES.pricePrefix} {SERVICES.summaryPrice}
            </span>
            {all && (
              <button
                type="button"
                onClick={toTurnkey}
                className="group/tk inline-flex items-center gap-1.5 rounded-full py-2 font-medium text-blue transition-colors hover:text-fg"
              >
                {SERVICES.summaryAll}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover/tk:translate-x-[3px]" />
              </button>
            )}
          </>
        ) : (
          <span className="text-grey">{SERVICES.summaryEmpty}</span>
        )}
      </div>
    </section>
  );
}
