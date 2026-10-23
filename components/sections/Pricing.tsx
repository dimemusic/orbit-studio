"use client";

import { Check, CheckCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CTA, SERVICES } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G, IconTile, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";
import { useTween } from "../ui/hooks";
import { Icon } from "../ui/icons";

const ITEMS = SERVICES.items;
const TURNKEY = SERVICES.turnkey;
const FULL = ITEMS.reduce((s, i) => s + i.price, 0);
const money = (n: number) => `${SERVICES.currency}${Math.round(n).toLocaleString("uk-UA")}`;

/**
 * Services as a live estimate: each card has an «Додати» toggle, the bar below sums the picked services.
 * All three picked → the bar becomes the turnkey package (gradient border) with the saving shown.
 */
export function Pricing() {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(ITEMS.map((s) => s.id)));
  const all = picked.size === ITEMS.length;
  const sum = all ? TURNKEY.price : ITEMS.filter((s) => picked.has(s.id)).reduce((t, s) => t + s.price, 0);
  const shown = useTween(sum, 600);
  const names = ITEMS.filter((s) => picked.has(s.id)).map((s) => s.name);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
        {ITEMS.map((s, i) => {
          const on = picked.has(s.id);
          return (
            <div key={s.id} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className="flex">
              <article
                className={`card flex w-full flex-col p-7 text-left transition-[border-color] duration-500 ${on ? ACCENT[s.color].border : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <IconTile color={s.color}>
                    <Icon name={s.icon} />
                  </IconTile>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${on ? SERVICES.added : SERVICES.add}: ${s.name}`}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-300 ${
                      on ? `border-transparent ${ACCENT[s.color].tint} ${ACCENT[s.color].text}` : "border-white/15 text-body hover:border-white/30 hover:text-fg"
                    }`}
                  >
                    {on ? <Check size={14} weight="bold" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                    {on ? SERVICES.added : SERVICES.add}
                  </button>
                </div>
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
                <p className="mt-auto flex items-baseline gap-1.5 pt-8">
                  <span className="text-[15px] text-body">{SERVICES.pricePrefix}</span>
                  <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-fg">{money(s.price)}</span>
                </p>
              </article>
            </div>
          );
        })}
      </div>

      {/* live estimate; all three picked = the turnkey package */}
      <div data-reveal style={{ ["--d" as string]: "200ms" }} className="mt-5 w-full">
        <div
          className={`card grid gap-6 px-7 py-7 text-left transition-[border-color] duration-500 sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center ${
            all ? "card-pro" : ""
          }`}
        >
          <div aria-live="polite">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-grey">{SERVICES.summaryLabel}</p>
              {all && <Tag color="blue">{TURNKEY.name}</Tag>}
            </div>
            <p className="mt-2 text-[clamp(20px,1.8vw,26px)] font-semibold tracking-[-0.025em] text-fg">
              {names.length ? (all ? <G>{TURNKEY.blurb}</G> : names.join(" + ")) : SERVICES.summaryEmpty}
            </p>
            <p className="mt-1.5 text-[14px] text-grey">{SERVICES.summaryNote}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 lg:justify-end">
            <p className="flex items-baseline gap-2">
              <span className="text-[16px] text-body">{SERVICES.pricePrefix}</span>
              <span className="text-[clamp(40px,4vw,60px)] font-semibold leading-none tracking-[-0.055em] text-fg tabular-nums">
                {names.length ? money(shown) : "—"}
              </span>
              {all && (
                <span className="flex flex-col text-[13px] leading-tight">
                  <s className="text-faint">{money(FULL)}</s>
                  <span className="text-green">
                    {TURNKEY.save} {money(FULL - TURNKEY.price)}
                  </span>
                </span>
              )}
            </p>
            <Button href="#contact">{CTA.primary}</Button>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
