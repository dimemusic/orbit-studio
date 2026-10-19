"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useTween } from "../ui/hooks";
import { ACCENT, type Accent } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";

type Billing = "month" | "year";

// Fictional prices (UAH).
const PLANS: {
  name: string;
  blurb: string;
  storage: string;
  /** included storage, GB */
  limit: number;
  price: Record<Billing, number>;
  unit: string;
  cta: string;
  color: Accent;
  features: string[];
}[] = [
  {
    name: "Free",
    blurb: "Для фрилансу й перших проєктів",
    storage: "20 ГБ",
    limit: 20,
    price: { month: 0, year: 0 },
    unit: "назавжди",
    cta: "Почати безкоштовно",
    color: "green",
    features: ["Історія версій 30 днів", "2 пристрої", "Шифрування на пристрої"],
  },
  {
    name: "Pro",
    blurb: "Для дизайнерів, які живуть у версіях",
    storage: "2 ТБ",
    limit: 2000,
    price: { month: 349, year: 279 },
    unit: "на місяць",
    cta: "Спробувати Pro",
    color: "blue",
    features: ["Уся історія версій", "Семантичний пошук", "Граф зв'язків", "Файли до 500 ГБ"],
  },
  {
    name: "Team",
    blurb: "Для студій і продакшенів",
    storage: "10 ТБ",
    limit: 10000,
    price: { month: 249, year: 199 },
    unit: "за людину на місяць",
    cta: "Написати нам",
    color: "violet",
    features: ["Усе з Pro", "Ролі й доступи", "Журнал доступу", "SSO"],
  },
];

const uah = new Intl.NumberFormat("uk-UA");

// slider stops, GB (log-ish so both 20 ГБ and 10 ТБ are reachable)
const STOPS = [5, 10, 20, 50, 100, 250, 500, 1000, 2000, 4000, 6000, 10000];
const size = (gb: number) => (gb < 1000 ? `${gb} ГБ` : `${uah.format(gb / 1000)} ТБ`);
const planFor = (gb: number) => PLANS.findIndex((p) => gb <= p.limit);

// tier colours, same order as PLANS: Free mint, Pro blue, Team violet
const TIER_COLOR = ["#4fe3c1", "#3d8bff", "#a78bfa"] as const;
// where each plan's limit sits on the slider (tick position, % and stop index)
const TICK_STOP = PLANS.map((p) => STOPS.indexOf(p.limit));
const TICK_AT = TICK_STOP.map((s) => (s / (STOPS.length - 1)) * 100);
// the track fill grows through the tiers it has passed: mint until 20 ГБ, then mint → blue, past 2 ТБ blue → violet
const TRACK_FILL = `linear-gradient(90deg, ${TIER_COLOR[0]} 0%, ${TIER_COLOR[0]} ${TICK_AT[0]}%, ${TIER_COLOR[1]} ${TICK_AT[1]}%, ${TIER_COLOR[2]} 100%)`;

// --tier is a registered colour, so every consumer fades with it; the .range overrides beat globals.css by specificity
const TIER_CSS = `
@property --tier{syntax:"<color>";inherits:true;initial-value:${TIER_COLOR[0]}}
.tier-root{transition:--tier 400ms var(--ease)}
.range.tier-range::-webkit-slider-runnable-track{background:linear-gradient(90deg,transparent var(--p),#20232b var(--p)),var(--fill)}
.range.tier-range::-moz-range-track{background:linear-gradient(90deg,transparent var(--p),#20232b var(--p)),var(--fill)}
.range.tier-range::-webkit-slider-thumb{background:#e8f0ff;border:3px solid var(--tier);box-shadow:0 0 0 6px color-mix(in srgb,var(--tier) 22%,transparent),0 4px 14px rgb(0 0 0/.5);transition:transform .25s var(--ease)}
.range.tier-range::-moz-range-thumb{background:#e8f0ff;border:3px solid var(--tier);box-shadow:0 0 0 6px color-mix(in srgb,var(--tier) 22%,transparent),0 4px 14px rgb(0 0 0/.5)}
.range.tier-range:hover::-webkit-slider-thumb,.range.tier-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 9px color-mix(in srgb,var(--tier) 28%,transparent),0 4px 14px rgb(0 0 0/.5)}
.range.tier-range:focus-visible::-webkit-slider-thumb{outline:2px solid var(--tier);outline-offset:4px}
@media (prefers-reduced-motion:reduce){.tier-root{transition:none}}
`;

/** price that counts to its new value instead of jumping */
function Price({ value }: { value: number }) {
  return <>{uah.format(Math.round(useTween(value, 600)))}</>;
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("year");
  const [stop, setStop] = useState(7);
  const gb = STOPS[stop];
  const rec = planFor(gb);
  const recPlan = PLANS[rec];
  const fillPct = (stop / (STOPS.length - 1)) * 100;
  const sizeText = size(gb);
  const unitAt = sizeText.lastIndexOf(" ");

  return (
    <HomeSection
      id="pricing"
      label="Тарифи"
      color="blue"
      title={
        <>
          <G tone="fresh">Прості</G> тарифи.
        </>
      }
      lead="Шифрування на пристрої в кожному. Рік на 20% вигідніший."
    >
      {/* same flex column as HomeSection's content box, so layout is unchanged; carries the active tier colour */}
      <div className="tier-root flex w-full flex-col items-center" style={{ ["--tier" as string]: TIER_COLOR[rec] }}>
      <style dangerouslySetInnerHTML={{ __html: TIER_CSS }} />
      <div data-reveal className="card w-full p-6 text-left md:px-7 md:py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <label htmlFor="storage" className="text-[15px] text-body">
              Скільки місця потрібно?
            </label>
            <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-fg">
              {sizeText.slice(0, unitAt)} <span className="text-[color:var(--tier)]">{sizeText.slice(unitAt + 1)}</span>
            </span>
          </div>
          <p className="flex items-baseline gap-2 whitespace-nowrap" aria-live="polite">
            <span className="text-[13px] text-faint">Тобі підійде</span>
            <span className="text-[20px] font-semibold text-[color:var(--tier)]">{recPlan.name}</span>
            <span className="text-[20px] font-semibold tabular-nums text-fg">
              {recPlan.price[billing] > 0 && rec === 2 ? "від " : ""}
              <Price value={recPlan.price[billing]} /> ₴{recPlan.price[billing] > 0 ? "/міс" : ""}
            </span>
          </p>
        </div>

        <div className="relative mt-5">
          <input
            id="storage"
            type="range"
            min={0}
            max={STOPS.length - 1}
            step={1}
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            aria-valuetext={`${size(gb)}, тариф ${recPlan.name}`}
            className="range tier-range w-full"
            style={{ ["--p" as string]: `${fillPct}%`, ["--fill" as string]: TRACK_FILL }}
          />
          {/* plan limits on the scale */}
          <div className="relative mt-2 h-7">
            {PLANS.map((p, i) => {
              const at = TICK_AT[i];
              const passed = stop >= TICK_STOP[i];
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setStop(STOPS.indexOf(p.limit))}
                  className={`absolute top-0 flex flex-col whitespace-nowrap rounded-md px-1 text-[12px] leading-none transition-colors duration-[400ms] motion-reduce:transition-none ${
                    i === 0 ? "items-start" : i === PLANS.length - 1 ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"
                  } ${passed ? "" : "text-faint hover:text-fg"}`}
                  style={{ left: `${at}%`, color: passed ? TIER_COLOR[i] : undefined }}
                >
                  <span aria-hidden="true" className="mb-1 h-2 w-px bg-current" />
                  {p.name} до {p.storage}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div data-reveal role="group" aria-label="Період оплати" className="card mt-6 inline-flex rounded-full p-1">
        {(
          [
            ["month", "Щомісяця"],
            ["year", "Щороку"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={billing === id}
            onClick={() => setBilling(id)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium text-body transition-colors duration-300 aria-pressed:bg-blue aria-pressed:text-white"
          >
            {label}
            {id === "year" && (
              <span
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none ${
                  billing === "year" ? "bg-white/20 text-white" : "bg-green/12 text-green"
                }`}
              >
                −20%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
        {PLANS.map((p, i) => {
          const price = p.price[billing];
          const hot = i === rec;
          return (
            <article
              key={p.name}
              data-reveal
              style={{ ["--d" as string]: `${i * 100}ms`, ["--c" as string]: TIER_COLOR[i] }}
              className={`card flex flex-col items-center px-7 py-8 text-center transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease)] motion-reduce:transition-none sm:px-10 ${
                hot
                  ? "border-[color:var(--c)] shadow-[0_24px_64px_rgb(0_0_0/0.45),0_0_44px_color-mix(in_srgb,var(--c)_26%,transparent)] lg:-translate-y-3"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <h3 className="text-title font-semibold text-[color:var(--c)]">{p.name}</h3>
                {hot && (
                  <span
                    key={gb}
                    className="animate-[quote-in_0.4s_var(--ease)_both] rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)] px-3 py-1.5 text-[12px] font-semibold leading-none text-[color:var(--c)]"
                  >
                    Під {size(gb)}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[15px] text-body">{p.blurb}</p>

              <div className="mt-6 flex items-start justify-center">
                <span className="text-[clamp(48px,4.4vw,72px)] font-semibold leading-none tracking-[-0.055em] tabular-nums text-fg">
                  <Price value={price} />
                </span>
                <span className="ml-1.5 mt-2 text-[22px] text-body">₴</span>
              </div>
              <p className="mt-3 min-h-[44px] text-[14px] text-grey">
                {p.unit}
                {billing === "year" && price > 0 && <span className="block">{uah.format(price * 12)} ₴ раз на рік</span>}
              </p>

              <div className="mt-5">
                <Tag color={p.color}>{p.storage} сховища</Tag>
              </div>

              <ul className="mt-6 flex w-full flex-col gap-3 text-left sm:mx-auto sm:max-w-[260px]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-body">
                    <CheckCircle size={20} weight="fill" aria-hidden="true" className={`shrink-0 ${ACCENT[p.color].text}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto w-full pt-8">
                <Button href={`/signup?plan=${p.name.toLowerCase()}`} variant={hot ? "primary" : "secondary"} className="w-full">
                  {p.cta}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </HomeSection>
  );
}
