"use client";

import { DeviceMobile, DeviceTablet, Laptop, WifiSlash } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACCENT, type Accent } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { useIntro, useOnScreen, useReducedMotion, useStarted } from "../ui/hooks";
import { Section } from "../ui/Section";

/*
  Bento (lg, 4 columns):
    [ graph 2×2 ][ comments ][ sync 1×2 ]
    [          ][  500 ГБ  ][          ]
    [ versions 2×1         ][ lineage 2×1 ]
*/
export function Features() {
  return (
    <Section
      id="features"
      tall
      eyebrow={{ label: "Шість можливостей", color: "violet" }}
      title={
        <>
          Сховище, яке <G tone="mind">розуміє</G> твою роботу.
        </>
      }
      lead="Cloud Sphere знає, що з чого зроблено, хто правив і де фінал."
    >
      <div className="grid w-full grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <Bento
          className="sm:col-span-2 lg:row-span-2"
          tilt
          title="Граф зв'язків"
          text="Відкрий файл і побач усе, що з ним пов'язано."
          tags={[["Автоматично", "blue"]]}
          d={0}
        >
          <GraphDemo />
        </Bento>
        <Bento title="Правки на макеті" text="Мітка клієнта прив'язана до потрібної версії." tags={[["Без акаунта", "violet"]]} d={90}>
          <CommentsDemo />
        </Bento>
        <Bento
          className="lg:row-span-2"
          title="Синк між пристроями"
          text="Працюй офлайн, зміни доїдуть самі."
          tags={[
            ["macOS", "green"],
            ["Windows", "green"],
            ["iPad", "green"],
          ]}
          d={180}
        >
          <SyncDemo />
        </Bento>
        <Bento className="sm:col-span-2 lg:col-span-1" title="Файли до 500 ГБ" text="Відео у 8K і важкі сцени без архівів." d={140}>
          <BigUploadDemo />
        </Bento>
        <Bento className="sm:col-span-2" title="Кожна версія на місці" text="Наведи на стрічку, щоб прогорнути історію." d={0}>
          <VersionsDemo />
        </Bento>
        <Bento className="sm:col-span-2" title="Експорт пам'ятає джерело" text="Кожен PNG чи PDF знає свій макет і версію." d={90}>
          <LineageDemo />
        </Bento>
      </div>
    </Section>
  );
}

function Bento({
  className = "",
  title,
  text,
  tags = [],
  tilt,
  d,
  children,
}: {
  className?: string;
  title: string;
  text: string;
  tags?: [string, Accent][];
  tilt?: boolean;
  d: number;
  children: ReactNode;
}) {
  return (
    <div data-reveal style={{ ["--d" as string]: `${d}ms` }} className={className}>
      <article data-tilt={tilt || undefined} className="card group flex h-full flex-col p-5 text-left sm:p-7">
        <div className="flex flex-1 flex-col justify-center">{children}</div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <h3 className="text-title font-semibold">{title}</h3>
            <p className="mt-1.5 max-w-[34ch] text-[15px] text-body">{text}</p>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(([t, c]) => (
                <Tag key={t} color={c}>
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

/* ---------- graph: hover a file, its neighbours light up ---------- */

type GNode = { id: string; label: string; x: number; y: number; color: Accent | "grey" };
const NODES: GNode[] = [
  { id: "c", label: "kv_master.psd", x: 50, y: 50, color: "blue" },
  { id: "v6", label: "kv_v6.psd", x: 23, y: 24, color: "grey" },
  { id: "v7", label: "kv_v7.psd", x: 76, y: 20, color: "violet" },
  { id: "png", label: "banner.png", x: 84, y: 58, color: "cyan" },
  { id: "pdf", label: "poster.pdf", x: 67, y: 85, color: "cyan" },
  { id: "mp4", label: "teaser.mp4", x: 29, y: 82, color: "violet" },
  { id: "notes", label: "правки клієнта", x: 14, y: 56, color: "green" },
  { id: "brief", label: "brief.pdf", x: 48, y: 10, color: "grey" },
];
const EDGES: [string, string][] = [
  ["c", "v6"],
  ["c", "v7"],
  ["v6", "v7"],
  ["c", "png"],
  ["c", "pdf"],
  ["c", "mp4"],
  ["notes", "v6"],
  ["notes", "c"],
  ["brief", "c"],
  ["v7", "png"],
  ["pdf", "png"],
];
const NODE_HEX: Record<GNode["color"], string> = {
  blue: "var(--blue)",
  cyan: "var(--cyan)",
  violet: "var(--violet-soft)",
  green: "var(--green)",
  grey: "#9aa3b2",
};
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function GraphDemo({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useStarted(ref, active, 0.3);
  const intro = useIntro(seen, 1300);
  const [hot, setHot] = useState<string | null>(null);
  const near = new Set<string>();
  if (hot) for (const [a, b] of EDGES) if (a === hot) near.add(b);
  else if (b === hot) near.add(a);
  const hotNode = hot ? byId[hot] : null;

  return (
    <div>
      <div ref={ref} className="relative mx-auto aspect-[4/3] w-full max-w-[620px] lg:aspect-[13/10]" onPointerLeave={() => setHot(null)}>
        <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {EDGES.map(([a, b], i) => {
            const A = byId[a];
            const B = byId[b];
            const lit = hot !== null && (a === hot || b === hot);
            return (
              <line
                key={a + b}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={lit ? NODE_HEX[byId[hot!].color] : "#9cc4ff"}
                strokeOpacity={hot === null ? 0.28 : lit ? 0.95 : 0.07}
                strokeWidth={lit ? 1.6 : 1}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={seen ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset 1.2s var(--ease) ${i * 70}ms, stroke-opacity .35s, stroke .35s, stroke-width .35s`,
                }}
              />
            );
          })}
        </svg>
        {NODES.map((n, i) => {
          const dim = hot !== null && hot !== n.id && !near.has(n.id);
          const big = n.id === "c";
          return (
            <button
              key={n.id}
              type="button"
              onPointerEnter={() => setHot(n.id)}
              onFocus={() => setHot(n.id)}
              onBlur={() => setHot(null)}
              aria-label={`${n.label}: зв'язків ${EDGES.filter((e) => e.includes(n.id)).length}`}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-lg p-1.5 transition-[opacity,transform] duration-500 ease-[var(--ease)]"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                opacity: seen ? (dim ? 0.25 : 1) : 0,
                transitionDelay: intro ? `${300 + i * 60}ms` : "0ms",
              }}
            >
              <span
                className={`block rounded-full transition-transform duration-300 ${big ? "size-4" : "size-2.5"} ${hot === n.id ? "scale-150" : ""}`}
                style={{ background: NODE_HEX[n.color], boxShadow: `0 0 0 4px rgb(5 7 13 / 0.9)` }}
              />
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] leading-tight transition-colors ${
                  hot === n.id ? "bg-white/[0.1] text-fg" : big ? "text-fg" : "text-body"
                }`}
              >
                {n.label}
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-2 min-h-[20px] text-[13px] text-grey">
        {hotNode ? (
          <>
            <span className="text-fg">{hotNode.label}</span> пов&apos;язаний з {near.size}{" "}
            {near.size === 1 ? "файлом" : "файлами"}
          </>
        ) : (
          "Наведи на файл, щоб побачити його зв'язки"
        )}
      </p>
    </div>
  );
}

/* ---------- comments: pins pop in on hover ---------- */

const PINS = [
  { x: 28, y: 30, n: 1 },
  { x: 70, y: 46, n: 2 },
  { x: 42, y: 76, n: 3 },
];

export function CommentsDemo() {
  // pins pop in on hover / focus; touch screens (no hover) show them all the time
  const show =
    "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100";
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-xl border border-white/[0.08]">
      {/* artboard */}
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice">
        <rect width="160" height="120" fill="#0b0f1a" />
        <circle cx="48" cy="42" r="22" fill="var(--violet)" fillOpacity="0.28" />
        <rect x="84" y="28" width="52" height="6" rx="3" fill="#fff" fillOpacity="0.5" />
        <rect x="84" y="40" width="38" height="4" rx="2" fill="#fff" fillOpacity="0.22" />
        <rect x="84" y="48" width="44" height="4" rx="2" fill="#fff" fillOpacity="0.22" />
        <rect x="24" y="84" width="112" height="16" rx="8" fill="var(--blue)" fillOpacity="0.3" />
      </svg>
      {PINS.map((p, i) => (
        <span
          key={p.n}
          aria-hidden="true"
          className={`absolute grid size-6 -translate-x-1/2 -translate-y-full place-items-center rounded-full rounded-bl-none bg-violet text-[11px] font-semibold text-white transition-[transform,opacity] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${show}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, transitionDelay: `${i * 90}ms`, transformOrigin: "bottom left" }}
        >
          {p.n}
        </span>
      ))}
      <span
        aria-hidden="true"
        className={`absolute left-[33%] top-[8%] whitespace-nowrap rounded-lg bg-[#141a29] px-2.5 py-1.5 text-[12px] text-fg shadow-[0_8px_24px_rgba(0,0,0,.5)] transition-[transform,opacity] delay-300 duration-300 ${show}`}
        style={{ transformOrigin: "top left" }}
      >
        Логотип трохи більше
      </span>
      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-[12px] text-body">3 правки · v7</span>
    </div>
  );
}

/* ---------- sync: dots travel between devices while on screen ---------- */

const DEVICES = [
  { x: 50, y: 16, label: "MacBook", Icon: Laptop },
  { x: 18, y: 78, label: "iPad", Icon: DeviceTablet },
  { x: 82, y: 78, label: "iPhone", Icon: DeviceMobile },
];
// viewBox 100 × 140: device centres scaled to it
const SYNC_PATHS = [
  { d: "M50 22 C 30 40, 20 70, 18 109", color: "var(--blue)" },
  { d: "M50 22 C 70 40, 80 70, 82 109", color: "var(--cyan)" },
  { d: "M18 109 C 40 124, 60 124, 82 109", color: "var(--green)" },
];

export function SyncDemo({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  const reduced = useReducedMotion();
  const run = on && !reduced && active;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative aspect-[5/7] w-full max-w-[230px]">
        <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 140">
          {SYNC_PATHS.map((p, i) => (
            <g key={i}>
              <path d={p.d} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="2 3" />
              {run &&
                [0, 1].map((k) => (
                  <circle key={k} r="1.8" fill={p.color}>
                    <animateMotion
                      dur="2.6s"
                      begin={`${i * 0.7 + k * 1.3}s`}
                      repeatCount="indefinite"
                      path={p.d}
                      keyPoints={i === 2 ? "1;0" : "0;1"}
                      keyTimes="0;1"
                      calcMode="linear"
                    />
                  </circle>
                ))}
            </g>
          ))}
        </svg>
        {DEVICES.map(({ x, y, label, Icon }) => (
          <span
            key={label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="grid size-12 place-items-center rounded-2xl border border-white/[0.1] bg-[#0a0e18] text-green transition-colors duration-300 group-hover:border-green/40">
              <Icon size={22} weight="light" />
            </span>
            <span className="text-[12px] text-body">{label}</span>
          </span>
        ))}
      </div>
      <div className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-[13px]">
        <span className="flex items-center gap-2 text-body">
          <WifiSlash size={16} weight="light" className="text-grey" aria-hidden="true" />
          Офлайн-зміни
        </span>
        <span className="tabular-nums text-green">доїхали за 1,4 с</span>
      </div>
    </div>
  );
}

/* ---------- 500 GB: resumable upload with speed + ETA ---------- */

const TOTAL = 186;
const FROM = 168.4;
const nf1 = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function BigUploadDemo({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useStarted(ref, active, 0.5);
  const [state, setState] = useState({ done: FROM, speed: 1.2 });

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState({ done: TOTAL, speed: 0 });
      return;
    }
    const id = window.setInterval(() => {
      setState((s) => {
        const speed = Math.max(0.9, Math.min(1.4, s.speed + (Math.random() - 0.5) * 0.12));
        const done = Math.min(TOTAL, s.done + speed * 0.1);
        if (done >= TOTAL) window.clearInterval(id);
        return { done, speed };
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [seen]);

  const finished = state.done >= TOTAL;
  const eta = Math.ceil((TOTAL - state.done) / Math.max(state.speed, 0.1));
  const pct = (state.done / TOTAL) * 100;

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[14px] text-fg">teaser_8k.mov</span>
        <span className="text-[12px] text-grey">докачка після обриву</span>
      </div>
      <p className="mt-3 text-[clamp(28px,2.6vw,38px)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
        {nf1.format(state.done)}
        <span className="text-[0.55em] font-medium tracking-[-0.02em] text-grey"> / {TOTAL} ГБ</span>
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full origin-left rounded-full transition-colors duration-500 ${finished ? "bg-green" : "bg-violet"}`}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[13px] tabular-nums">
        {finished ? (
          <span className="animate-[quote-in_0.5s_var(--ease)_both] text-green">Готово, ціле й зашифроване</span>
        ) : (
          <>
            <span className="text-violet-soft">{nf1.format(state.speed)} ГБ/с</span>
            <span className="text-body">
              ще 0:{String(eta).padStart(2, "0")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- versions: hover the strip to scrub v1 … v7 ---------- */

const VERSIONS = [
  { who: "Марта", when: "пн 10:12", note: "Перший ескіз", hue: 228, cx: 30, r: 10, bars: 1, accent: 0.15 },
  { who: "Марта", when: "пн 16:40", note: "Нова композиція", hue: 224, cx: 40, r: 13, bars: 1, accent: 0.2 },
  { who: "Олег", when: "вт 11:05", note: "Шрифт заголовка", hue: 220, cx: 44, r: 15, bars: 2, accent: 0.25 },
  { who: "Клієнт", when: "вт 18:22", note: "3 правки на макеті", hue: 262, cx: 46, r: 17, bars: 2, accent: 0.3 },
  { who: "Марта", when: "ср 09:48", note: "Правки клієнта внесено", hue: 214, cx: 50, r: 18, bars: 3, accent: 0.35 },
  { who: "Олег", when: "ср 15:30", note: "Колір пляшки", hue: 200, cx: 52, r: 19, bars: 3, accent: 0.42 },
  { who: "Марта", when: "чт 12:02", note: "Фінал, погоджено", hue: 192, cx: 54, r: 20, bars: 3, accent: 0.5 },
];

function Artwork({ v, className = "" }: { v: (typeof VERSIONS)[number]; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="100" fill={`hsl(${v.hue} 45% 11%)`} />
      <circle cx={v.cx * 1.6} cy="48" r={v.r * 1.6} fill={`hsl(${v.hue} 90% 62% / ${v.accent})`} />
      {Array.from({ length: v.bars }, (_, i) => (
        <rect key={i} x="96" y={30 + i * 12} width={i === 0 ? 46 : 32} height={i === 0 ? 7 : 4} rx="2" fill="#fff" fillOpacity={i === 0 ? 0.6 : 0.25} />
      ))}
    </svg>
  );
}

export function VersionsDemo() {
  const [cur, setCur] = useState(VERSIONS.length - 1);
  const v = VERSIONS[cur];
  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.floor(((e.clientX - r.left) / r.width) * VERSIONS.length);
    setCur(Math.max(0, Math.min(VERSIONS.length - 1, i)));
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] sm:w-[44%]">
        <Artwork v={v} className="block aspect-[16/10] w-full transition-[filter] duration-300" />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-fg">v{cur + 1}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div aria-live="polite" key={cur} className="animate-[quote-in_0.35s_var(--ease)_both]">
          <p className="text-[15px] font-medium text-fg">{v.note}</p>
          <p className="mt-0.5 text-[13px] text-grey">
            {v.who}, {v.when}
          </p>
        </div>
        <div role="group" aria-label="Версії файлу" className="flex gap-1.5" onPointerMove={scrub}>
          {VERSIONS.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Версія ${i + 1}: ${item.note}`}
              aria-pressed={i === cur}
              onClick={() => setCur(i)}
              onFocus={() => setCur(i)}
              className={`relative flex-1 overflow-hidden rounded-md border transition-[border-color,transform] duration-200 ${
                i === cur ? "-translate-y-1 border-blue" : "border-white/[0.08] hover:border-white/25"
              }`}
            >
              <Artwork v={item} className="block aspect-[4/5] w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[11px] tabular-nums text-body">v{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- export lineage: a small tree that draws itself ---------- */

const EXPORTS: { name: string; spec: string; color: Accent }[] = [
  { name: "banner.png", spec: "1080×1350", color: "cyan" },
  { name: "poster.pdf", spec: "A2, CMYK", color: "blue" },
  { name: "teaser.mp4", spec: "4K, 30 с", color: "violet" },
];
const Y = [16.67, 50, 83.33];

export function LineageDemo({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useStarted(ref, active, 0.5);
  const intro = useIntro(seen, 1800);
  const [hot, setHot] = useState<number | null>(null);

  return (
    <div ref={ref} className="grid h-[168px] grid-cols-[auto_minmax(40px,1fr)_auto] items-center">
      <div
        className={`rounded-xl border px-3.5 py-3 transition-[border-color,opacity] duration-500 ${
          hot !== null ? "border-blue/50" : "border-white/[0.1]"
        } ${seen ? "opacity-100" : "opacity-0"}`}
      >
        <p className="text-[14px] font-medium text-fg">kv_master.psd</p>
        <p className="mt-0.5 text-[12px] text-grey">джерело, v7</p>
      </div>
      {/* explicit height: without it the svg takes its square viewBox ratio and spills out of the card */}
      <svg aria-hidden="true" className="block h-[168px] w-full self-stretch overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Y.map((y, i) => (
          <path
            key={y}
            d={`M0 50 C 50 50, 50 ${y}, 100 ${y}`}
            fill="none"
            stroke={hot === i ? `var(--${EXPORTS[i].color === "violet" ? "violet-soft" : EXPORTS[i].color})` : "#9cc4ff"}
            strokeOpacity={hot === null ? 0.45 : hot === i ? 1 : 0.12}
            strokeWidth={hot === i ? 2 : 1.25}
            vectorEffect="non-scaling-stroke"
            // draw-in via clip-path: dasharray + pathLength breaks with non-scaling-stroke in Chrome (shows dashes)
            style={{
              clipPath: seen ? "inset(-10% -10% -10% 0)" : "inset(-10% 100% -10% 0)",
              transition: `clip-path 0.9s var(--ease) ${300 + i * 180}ms, stroke-opacity .3s, stroke-width .3s`,
            }}
          />
        ))}
      </svg>
      <ul className="grid h-full grid-rows-3 items-center">
        {EXPORTS.map((x, i) => (
          <li
            key={x.name}
            tabIndex={0}
            onPointerEnter={() => setHot(i)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(i)}
            onBlur={() => setHot(null)}
            className={`flex cursor-default items-center gap-2 justify-self-start rounded-full px-3 py-1.5 text-[13px] transition-[opacity,transform,background-color] duration-500 ease-[var(--ease)] ${
              ACCENT[x.color].tint
            } ${seen ? "opacity-100" : "translate-x-2 opacity-0"} ${hot === i ? "brightness-125" : ""}`}
            style={{ transitionDelay: intro ? `${900 + i * 180}ms` : "0ms" }}
          >
            <span className={`font-medium ${ACCENT[x.color].text}`}>{x.name}</span>
            <span className="hidden text-grey sm:inline">{x.spec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
