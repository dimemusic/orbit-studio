"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { G } from "../ui/Bits";
import { Counter } from "../ui/Counter";
import { useInView, useIntro } from "../ui/hooks";
import { Section } from "../ui/Section";

// Fictional figures for the concept. One dashboard panel: KPIs + area, bars, donut (custom SVG).
const nf1 = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const KPIS: { to: number; decimals: number; suffix: string; label: string; delta: string; color: string; spark: number[] }[] = [
  { to: 12400, decimals: 0, suffix: "+", label: "студій і продакшенів", delta: "+34% за рік", color: "var(--blue)", spark: [4, 5, 5, 6, 7, 7, 8, 9, 11, 12] },
  { to: 3.8, decimals: 1, suffix: " ПБ", label: "файлів під шифруванням", delta: "+2,7 ПБ за рік", color: "var(--green)", spark: [1.1, 1.5, 1.6, 1.9, 2.1, 2.4, 2.6, 2.9, 3.5, 3.8] },
  { to: 1.4, decimals: 1, suffix: " с", label: "середня синхронізація", delta: "−0,6 с за рік", color: "var(--cyan)", spark: [2.4, 2.2, 2.3, 2, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4] },
  { to: 99.95, decimals: 2, suffix: "%", label: "доступність за рік", delta: "SLA 99,9%", color: "var(--violet)", spark: [99.9, 99.97, 99.93, 99.98, 99.96, 99.94, 99.99, 99.95, 99.97, 99.95] },
];

// hairlines between KPI cells for 1 / 2 / 4 columns
const KPI_BORDER = ["", "border-t sm:border-t-0 sm:border-l", "border-t lg:border-t-0 lg:border-l", "border-t sm:border-l lg:border-t-0"];

const MONTHS = ["лис", "гру", "січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов"];
const ENCRYPTED = [1.1, 1.3, 1.5, 1.6, 1.9, 2.1, 2.4, 2.6, 2.9, 3.2, 3.5, 3.8];

const REGIONS: [string, number][] = [
  ["Київ", 0.9],
  ["Варшава", 1.1],
  ["Франкфурт", 1.2],
  ["Лісабон", 1.6],
  ["Нью-Йорк", 2.1],
  ["Сінгапур", 2.6],
];

// fixed categorical order, validated for CVD + normal-vision adjacency on the dark surface
const TYPES: { label: string; pct: number; color: string }[] = [
  { label: "Макети .psd .fig", pct: 38, color: "#3d8bff" },
  { label: "Експорти", pct: 12, color: "#34d399" },
  { label: "Відео", pct: 27, color: "#8b5cf6" },
  { label: "3D-сцени", pct: 17, color: "#22d3ee" },
  { label: "Інше", pct: 6, color: "#5b616c" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.2);

  return (
    <Section
      id="stats"
      eyebrow={{ label: "Огляд за рік", color: "blue" }}
      title={
        <>
          Рік роботи на <G tone="ice">одній панелі.</G>
        </>
      }
      lead="Більше файлів, швидший синк, нуль прочитаних байтів."
    >
      <div ref={ref} data-reveal className="card w-full text-left">
        {/* window bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-8">
          <p className="text-[15px] font-medium text-fg">Огляд</p>
          <p className="text-[13px] text-grey">Листопад 2025 – жовтень 2026</p>
        </div>

        {/* KPIs */}
        <dl className="grid grid-cols-1 border-b border-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k, i) => (
            <div
              key={k.label}
              className={`flex items-end justify-between gap-4 border-white/[0.07] px-5 py-6 sm:px-8 ${KPI_BORDER[i]}`}
            >
              <div className="min-w-0">
                <dt className="text-[13px] text-grey">{k.label}</dt>
                <dd className="mt-2 text-[clamp(30px,2.8vw,44px)] font-semibold leading-none tracking-[-0.045em] text-fg">
                  <Counter to={k.to} decimals={k.decimals} suffix={k.suffix} />
                </dd>
                <dd className="mt-2.5 flex items-center gap-1 text-[12px] text-body">
                  <ArrowUpRight size={13} weight="bold" aria-hidden="true" className="text-green" />
                  {k.delta}
                </dd>
              </div>
              <Sparkline data={k.spark} color={k.color} on={seen} delay={i * 120} />
            </div>
          ))}
        </dl>

        <AreaChart on={seen} />

        <div className="grid grid-cols-1 border-t border-white/[0.07] lg:grid-cols-[7fr_5fr]">
          <Bars on={seen} />
          <Donut on={seen} />
        </div>
      </div>
      <p className="legible mt-8 text-[13px] text-grey">Цифри вигадані для концепту.</p>
    </Section>
  );
}

function Sparkline({ data, color, on, delay }: { data: number[]; color: string; on: boolean; delay: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(" ");
  return (
    <svg aria-hidden="true" viewBox="0 0 100 32" preserveAspectRatio="none" className="h-9 w-24 shrink-0 overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={on ? 0 : 1}
        style={{ transition: `stroke-dashoffset 1.4s var(--ease) ${400 + delay}ms` }}
      />
    </svg>
  );
}

/* ---------- area: encrypted storage by month, crosshair + tooltip ---------- */

const W = 600;
const H = 220;
const MAXV = 4;
const px = (i: number) => (i / (ENCRYPTED.length - 1)) * W;
const py = (v: number) => H - (v / MAXV) * (H - 16);

function AreaChart({ on }: { on: boolean }) {
  const [hot, setHot] = useState<number | null>(null);
  const line = ENCRYPTED.map((v, i) => `${i ? "L" : "M"}${px(i)} ${py(v)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHot(Math.max(0, Math.min(ENCRYPTED.length - 1, Math.round(((e.clientX - r.left) / r.width) * (ENCRYPTED.length - 1)))));
  };
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const d = e.key === "ArrowLeft" ? -1 : 1;
    setHot((h) => Math.max(0, Math.min(ENCRYPTED.length - 1, (h ?? ENCRYPTED.length - 1) + d)));
  };
  const i = hot ?? ENCRYPTED.length - 1;
  const left = (i / (ENCRYPTED.length - 1)) * 100;
  const top = (py(ENCRYPTED[i]) / H) * 100;
  const prev = i > 0 ? ENCRYPTED[i] - ENCRYPTED[i - 1] : null;

  return (
    <div className="px-5 pb-6 pt-6 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-medium text-fg">Файли під шифруванням, ПБ</h3>
        <p className="text-[13px] text-grey">Наведи або гортай стрілками</p>
      </div>

      <div className="mt-6 flex gap-3">
        {/* y axis */}
        <div aria-hidden="true" className="relative w-6 shrink-0 text-right text-[12px] tabular-nums text-grey">
          {[4, 3, 2, 1, 0].map((v) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${(py(v) / H) * 100}%` }}>
              {v}
            </span>
          ))}
          <span className="invisible block h-[clamp(180px,22vw,280px)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div
            tabIndex={0}
            role="img"
            aria-label={`Файли під шифруванням: від ${nf1.format(ENCRYPTED[0])} ПБ у листопаді 2025 до ${nf1.format(ENCRYPTED[11])} ПБ у жовтні 2026`}
            onPointerMove={pick}
            onPointerLeave={() => setHot(null)}
            onKeyDown={keys}
            onBlur={() => setHot(null)}
            className="relative h-[clamp(180px,22vw,280px)] cursor-crosshair rounded-md"
          >
            <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <defs>
                <linearGradient id="enc-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--blue)" stopOpacity="0.32" />
                  <stop offset="1" stopColor="var(--blue)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[1, 2, 3, 4].map((v) => (
                <line key={v} x1="0" x2={W} y1={py(v)} y2={py(v)} stroke="#fff" strokeOpacity="0.06" vectorEffect="non-scaling-stroke" />
              ))}
              <line x1="0" x2={W} y1={H} y2={H} stroke="#fff" strokeOpacity="0.16" vectorEffect="non-scaling-stroke" />
              <path d={area} fill="url(#enc-fill)" style={{ opacity: on ? 1 : 0, transition: "opacity 1s var(--ease) 1.1s" }} />
              <path
                d={line}
                fill="none"
                stroke="var(--blue)"
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={on ? 0 : 1}
                style={{ transition: "stroke-dashoffset 1.8s var(--ease) 0.3s" }}
              />
            </svg>

            {/* crosshair + point + tooltip (HTML so nothing stretches) */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 w-px bg-white/25 transition-opacity duration-200 ${hot === null ? "opacity-0" : "opacity-100"}`}
              style={{ left: `${left}%` }}
            />
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue ring-2 ring-[#090c14] transition-opacity duration-500 ${
                on ? "opacity-100" : "opacity-0"
              }`}
              style={{ left: `${left}%`, top: `${top}%`, transitionDelay: on && hot === null ? "1.8s" : "0s" }}
            />
            <div
              aria-live="polite"
              className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border border-white/[0.1] bg-[#0b0f19]/95 px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,.5)] transition-opacity duration-200 ${
                hot === null ? "opacity-0" : "opacity-100"
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(${left > 70 ? "calc(-100% - 14px)" : "14px"}, -110%)`,
              }}
            >
              <p className="text-[12px] text-grey">{MONTHS[i]} {i < 2 ? 2025 : 2026}</p>
              <p className="text-[15px] font-semibold tabular-nums text-fg">{nf1.format(ENCRYPTED[i])} ПБ</p>
              {prev !== null && <p className="text-[12px] tabular-nums text-body">+{nf1.format(prev)} ПБ за місяць</p>}
            </div>
          </div>
          <div aria-hidden="true" className="mt-3 grid grid-cols-12 text-center text-[12px] text-grey">
            {MONTHS.map((m, k) => (
              <span key={m} className={`transition-colors ${k === hot ? "text-fg" : ""} ${k % 2 ? "max-sm:invisible" : ""}`}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Файли під шифруванням за місяцями, ПБ</caption>
        <tbody>
          {MONTHS.map((m, k) => (
            <tr key={m}>
              <th scope="row">{m}</th>
              <td>{nf1.format(ENCRYPTED[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- bars: median sync time by region ---------- */

function Bars({ on }: { on: boolean }) {
  const [hot, setHot] = useState<number | null>(null);
  const intro = useIntro(on, 1800);
  const max = 3;
  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-medium text-fg">Синхронізація за регіонами</h3>
        <p className="text-[13px] text-grey">медіана, секунди</p>
      </div>
      <ul className="mt-6 flex flex-col gap-1" onPointerLeave={() => setHot(null)}>
        {REGIONS.map(([name, v], k) => (
          <li
            key={name}
            tabIndex={0}
            onPointerEnter={() => setHot(k)}
            onFocus={() => setHot(k)}
            onBlur={() => setHot(null)}
            className="grid cursor-default grid-cols-[84px_1fr_44px] items-center gap-3 rounded-md px-1 py-1.5 transition-colors hover:bg-white/[0.03]"
          >
            <span className={`text-[13px] transition-colors ${hot === k ? "text-fg" : "text-body"}`}>{name}</span>
            <span className="h-3 overflow-hidden rounded-r-[4px] bg-white/[0.04]">
              <span
                className="block h-full origin-left rounded-r-[4px] bg-cyan"
                style={{
                  width: `${(v / max) * 100}%`,
                  transform: `scaleX(${on ? 1 : 0})`,
                  opacity: hot === null || hot === k ? 1 : 0.35,
                  transition: `transform 1s var(--ease) ${intro ? 300 + k * 90 : 0}ms, opacity .25s`,
                }}
              />
            </span>
            <span className="text-right text-[13px] tabular-nums text-fg">{nf1.format(v)} с</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- donut: storage by file type ---------- */

const DR = 60;
const DC = 2 * Math.PI * DR;
const GAP = 3; // surface gap between segments

function Donut({ on }: { on: boolean }) {
  const [hot, setHot] = useState<number | null>(null);
  let acc = 0;
  const segs = TYPES.map((t) => {
    const start = acc;
    acc += (t.pct / 100) * DC;
    return { ...t, start, len: (t.pct / 100) * DC };
  });
  const cur = hot === null ? null : TYPES[hot];

  return (
    <div className="border-t border-white/[0.07] px-5 py-6 sm:px-8 lg:border-l lg:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-medium text-fg">Сховище за типом файлів</h3>
        <p className="text-[13px] text-grey">частка від 3,8 ПБ</p>
      </div>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <div className="relative size-[168px] shrink-0">
          <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden="true" onPointerLeave={() => setHot(null)}>
            {segs.map((s, k) => (
              <circle
                key={s.label}
                cx="80"
                cy="80"
                r={DR}
                fill="none"
                stroke={s.color}
                strokeWidth={hot === k ? 22 : 18}
                strokeDasharray={`${on ? Math.max(0, s.len - GAP) : 0} ${DC}`}
                strokeDashoffset={-s.start}
                opacity={hot === null || hot === k ? 1 : 0.3}
                onPointerEnter={() => setHot(k)}
                className="cursor-pointer"
                style={{ transition: `stroke-dasharray 1s var(--ease) ${400 + k * 140}ms, stroke-width .25s, opacity .25s` }}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div key={hot ?? "all"} className="animate-[quote-in_0.35s_var(--ease)_both]">
              <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-fg">{cur ? `${cur.pct}%` : "3,8 ПБ"}</p>
              <p className="mt-1.5 max-w-[11ch] text-[12px] leading-tight text-grey">{cur ? cur.label : "усього"}</p>
            </div>
          </div>
        </div>
        <ul className="flex w-full flex-1 flex-col gap-0.5" onPointerLeave={() => setHot(null)}>
          {TYPES.map((t, k) => (
            <li key={t.label}>
              <button
                type="button"
                onPointerEnter={() => setHot(k)}
                onFocus={() => setHot(k)}
                onBlur={() => setHot(null)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-[13px] transition-[background-color,opacity] duration-200 hover:bg-white/[0.04] ${
                  hot === null || hot === k ? "opacity-100" : "opacity-50"
                }`}
              >
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: t.color }} />
                <span className="flex-1 text-body">{t.label}</span>
                <span className="tabular-nums text-fg">{t.pct}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
