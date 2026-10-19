"use client";

import { Check, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { CTA, SERVICES } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";

const ITEMS = SERVICES.items;
const TURNKEY = SERVICES.turnkey;
// turnkey colour: the brand aurora's first stop
const TURNKEY_HEX = "#5aa2ff";

/** one service → that service; two or more → the turnkey package */
const recommend = (picked: Set<string>) => (picked.size === 0 ? null : picked.size === 1 ? [...picked][0] : "turnkey");

/**
 * 04 Services: pick what you need, the highlight moves to the matching card (like the old plan slider).
 * Three service columns, then the turnkey package as one wide card with the gradient border.
 */
export function Pricing() {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(ITEMS.map((s) => s.id)));
  const rec = recommend(picked);
  const recItem = ITEMS.find((s) => s.id === rec);
  const recName = rec === "turnkey" ? TURNKEY.name : recItem?.name;
  const recPrice = rec === "turnkey" ? TURNKEY.price : recItem?.price;
  const recHex = rec === "turnkey" ? TURNKEY_HEX : (recItem?.hex ?? "#8b919c");

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
      <div data-reveal className="card w-full p-6 text-left md:px-7 md:py-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div role="group" aria-labelledby="services-pick" className="flex flex-wrap items-center gap-2">
            <span id="services-pick" className="mr-2 text-[15px] text-body">
              {SERVICES.pickLabel}
            </span>
            {ITEMS.map((s) => {
              const on = picked.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.id)}
                  style={{ ["--c" as string]: s.hex }}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors duration-300 ${
                    on
                      ? "border-[color:var(--c)] bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-fg"
                      : "border-white/15 text-body hover:border-white/30 hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-4 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-[color:var(--c)] text-bg" : "border border-white/25"}`}
                  >
                    {on && <Check size={10} weight="bold" />}
                  </span>
                  {s.name}
                </button>
              );
            })}
          </div>
          <p className="flex items-baseline gap-2 whitespace-nowrap" aria-live="polite">
            {recName ? (
              <>
                <span className="text-[13px] text-faint">{SERVICES.recommend}</span>
                <span key={rec} className="animate-[quote-in_0.4s_var(--ease)_both] text-[20px] font-semibold" style={{ color: recHex }}>
                  {recName}
                </span>
                <span className="text-[20px] font-semibold text-fg">
                  {SERVICES.pricePrefix} {recPrice}
                </span>
              </>
            ) : (
              <span className="text-[15px] text-faint">Оберіть хоча б одну послугу</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
        {ITEMS.map((s, i) => {
          const hot = rec === s.id;
          return (
            <article
              key={s.id}
              data-reveal
              style={{ ["--d" as string]: `${i * 100}ms`, ["--c" as string]: s.hex }}
              className={`card flex flex-col items-center px-7 py-8 text-center transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease)] motion-reduce:transition-none sm:px-10 ${
                hot
                  ? "border-[color:var(--c)] shadow-[0_24px_64px_rgb(0_0_0/0.45),0_0_44px_color-mix(in_srgb,var(--c)_26%,transparent)] lg:-translate-y-3"
                  : ""
              }`}
            >
              <h3 className="text-title font-semibold text-[color:var(--c)]">{s.name}</h3>
              <p className="mt-1.5 min-h-[48px] text-[15px] text-body">{s.blurb}</p>

              <p className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-[18px] text-body">{SERVICES.pricePrefix}</span>
                <span className="text-[clamp(36px,3.2vw,52px)] font-semibold leading-none tracking-[-0.05em] text-fg">{s.price}</span>
              </p>

              <ul className="mt-7 flex w-full flex-col gap-3 text-left sm:mx-auto sm:max-w-[260px]">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-body">
                    <CheckCircle size={20} weight="fill" aria-hidden="true" className={`shrink-0 ${ACCENT[s.color].text}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto w-full pt-8">
                <Button href="#contact" variant={hot ? "primary" : "secondary"} className="w-full">
                  {CTA.primary}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {/* the turnkey package: same card, gradient border; lifts and glows when it is the recommendation */}
      <div data-reveal style={{ ["--d" as string]: "200ms" }} className="mt-5 w-full">
        <article
          style={{ ["--c" as string]: TURNKEY_HEX }}
          className={`card card-pro grid gap-8 px-7 py-9 text-left transition-[box-shadow] duration-500 ease-[var(--ease)] sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center ${
            rec === "turnkey" ? "shadow-[0_24px_64px_rgb(0_0_0/0.45),0_0_56px_color-mix(in_srgb,var(--c)_30%,transparent)]" : ""
          }`}
        >
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
                  <CheckCircle size={20} weight="fill" aria-hidden="true" className="shrink-0 text-cyan" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <p className="flex items-baseline gap-2">
              <span className="text-[18px] text-body">{SERVICES.pricePrefix}</span>
              <span className="text-[clamp(44px,4.4vw,72px)] font-semibold leading-none tracking-[-0.055em] text-fg">{TURNKEY.price}</span>
            </p>
            <Button href="#contact">{CTA.primary}</Button>
          </div>
        </article>
      </div>
    </HomeSection>
  );
}
