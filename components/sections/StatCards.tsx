"use client";

import { Lock } from "@phosphor-icons/react/dist/ssr";
import { memo, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { COUNT, MAP, PINS } from "@/lib/worldDots";
import { useReducedMotion } from "../ui/hooks";

const nf = new Intl.NumberFormat("uk-UA");

/**
 * Three stat cards for «Proof»: a live scene on top (map · orbit · year), the number and its meaning below.
 * One IntersectionObserver sets the data-in ATTRIBUTE on the row once; every scene animates from `[[data-in]_&]:` styles.
 * Reduced motion shows the final states and runs no loops.
 */
export function StatCards() {
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const show = () => {
      el.setAttribute("data-in", "");
      setStarted(true);
    };
    if (reduced) {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        show();
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div ref={row} className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        color="#3d8bff"
        scene={<MapScene />}
        number={
          <>
            <CountUp to={12400} run={started} reduced={reduced} />
            <em className="not-italic text-[color:var(--c)]">+</em>
          </>
        }
        label="студій і продакшенів у 13 країнах"
      />
      <StatCard
        color="#4fe3c1"
        scene={<OrbitScene reduced={reduced} />}
        number={
          <>
            3,8 <em className="not-italic text-[color:var(--c)]">ПБ</em>
          </>
        }
        label="файлів під шифруванням, ключ лише в тебе"
      />
      <StatCard
        color="#a78bfa"
        scene={<YearScene />}
        number={
          <>
            99,95<em className="not-italic text-[color:var(--c)]">%</em>
          </>
        }
        label="доступність за рік: 4 години простою на 365 днів"
      />
    </div>
  );
}

function StatCard({ color, scene, number, label }: { color: string; scene: ReactNode; number: ReactNode; label: string }) {
  return (
    <div className="card flex min-w-0 flex-col overflow-hidden text-left" style={{ ["--c" as string]: color }}>
      <div className="relative h-[200px] border-b border-white/[0.07] [background:radial-gradient(70%_80%_at_50%_60%,color-mix(in_srgb,var(--c)_10%,transparent),transparent_70%)]">
        {scene}
      </div>
      <div className="px-7 pb-7 pt-6">
        <p className="text-[44px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-fg">{number}</p>
        <p className="mt-2.5 text-[14px] text-body">{label}</p>
      </div>
    </div>
  );
}

/** counts 0 → `to` once `run` flips (1.4 s, easeOutCubic) */
function CountUp({ to, run, reduced }: { to: number; run: boolean; reduced: boolean }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!run || reduced) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      // rAF timestamps can be a few ms older than performance.now(): never let t go negative
      const k = Math.min(1, Math.max(0, now - start) / 1400);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduced, to]);
  return <>{nf.format(v)}</>;
}

/* ---------- 1 · dotted world map, lit pins = cities where studios work ---------- */

const DOT = "absolute size-[2.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.12]";
const pct = (x: number, max: number) => `${(x / max) * 100}%`;

const Dots = memo(function Dots() {
  return (
    <>
      {MAP.pts.map(([x, y], i) => (
        <i key={i} className={DOT} style={{ left: pct(x, MAP.w), top: pct(y, MAP.h) }} />
      ))}
    </>
  );
});

function MapScene() {
  const [tip, setTip] = useState<number | null>(null);
  const pin = tip === null ? null : PINS[tip];

  return (
    <div
      role="img"
      aria-label="Мапа студій"
      onPointerLeave={() => setTip(null)}
      className="absolute left-1/2 top-1/2 aspect-[71/34] w-[min(calc(100%-56px),317px)] -translate-x-1/2 -translate-y-1/2"
    >
      <Dots />
      {PINS.map(([name, x, y], k) => (
        <b
          key={name}
          onPointerEnter={() => setTip(k)}
          style={{ left: pct(x, MAP.w), top: pct(y, MAP.h), transitionDelay: `${200 + k * 70}ms` }}
          className={`absolute size-1.5 -translate-x-1/2 -translate-y-1/2 scale-0 cursor-default rounded-full bg-[#3d8bff] shadow-[0_0_10px_#3d8bff] transition-[scale] duration-500 ease-[var(--ease)] before:absolute before:-inset-1.5 before:content-[''] hover:bg-[#9cc4ff] motion-reduce:scale-100 motion-reduce:transition-none [[data-in]_&]:scale-100 ${
            k % 3 === 0
              ? "after:absolute after:-inset-[5px] after:rounded-full after:border after:border-[#3d8bff] after:content-[''] [[data-in]_&]:after:animate-[ping_2.4s_ease-out_infinite] motion-reduce:after:animate-none"
              : ""
          }`}
        />
      ))}
      <Tip show={pin !== null} left={pin ? pct(pin[1], MAP.w) : "50%"} top={pin ? pct(pin[2], MAP.h) : "50%"}>
        {pin && (
          <>
            {pin[0]} <span className="text-body">· {nf.format(COUNT[pin[0]])} студій</span>
          </>
        )}
      </Tip>
    </div>
  );
}

function Tip({ show, left, top, children }: { show: boolean; left: number | string; top: number | string; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      style={{ left, top, transform: "translate(-50%, calc(-100% - 10px))" }}
      className={`pointer-events-none absolute z-[3] whitespace-nowrap rounded-lg border border-white/[0.12] bg-[#0f131d] px-[9px] py-1 text-[12px] text-fg transition-opacity duration-150 motion-reduce:transition-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/* ---------- 2 · encrypted files orbit a glowing lock sphere ---------- */

const FILES: [string, string, string][] = [
  [".psd", "kv_master", "#a78bfa"],
  [".mp4", "teaser", "#ff7ab6"],
  [".pdf", "poster", "#3d8bff"],
  [".png", "banner", "#5ee0ff"],
  [".fig", "ui_kit", "#4fe3c1"],
];

function OrbitScene({ reduced }: { reduced: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLDivElement | null)[]>([]);

  // one rAF loop writes transforms straight to the chips (no re-render); it runs only while the card is on screen
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const place = (t: number) => {
      const R = Math.min(110, el.clientWidth * 0.4);
      chips.current.forEach((d, i) => {
        if (!d) return;
        const a = t * 0.00035 + (i / FILES.length) * Math.PI * 2;
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * R * 0.38;
        const z = Math.sin(a);
        d.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${0.78 + z * 0.22})`;
        d.style.opacity = String(0.35 + (z + 1) * 0.32);
        d.style.zIndex = z > 0 ? "2" : "0";
      });
    };
    place(0);
    if (reduced) return;

    let raf = 0;
    const tick = (now: number) => {
      place(now);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={scene} aria-hidden="true" className="absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-[84px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4fe3c1]/[0.14]" />
      <div className="absolute left-1/2 top-1/2 z-[1] -ml-8 -mt-8 grid size-16 place-items-center rounded-full [background:radial-gradient(circle_at_35%_30%,#b9fff0,#4fe3c1_35%,#0f6b5b_80%)] shadow-[0_0_40px_rgb(79_227_193/0.45),0_0_90px_rgb(79_227_193/0.2)]">
        <Lock size={24} weight="bold" className="text-[#063b33]" />
      </div>
      {FILES.map(([ext, name, color], i) => (
        <div
          key={ext}
          ref={(n) => {
            chips.current[i] = n;
          }}
          className="absolute left-1/2 top-1/2 whitespace-nowrap rounded-[7px] border border-white/10 bg-[rgb(15_19_29/0.92)] px-2 py-1 text-[11px] font-medium text-fg will-change-[transform,opacity]"
        >
          <span style={{ color }}>{ext}</span> {name}
        </div>
      ))}
    </div>
  );
}

/* ---------- 3 · uptime: one square per day for a year, amber = a day with downtime ---------- */

const TODAY = new Date(2026, 9, 17);
const DAYS = 365;
const COLS = 37;
const DOWNTIME: Record<number, string> = { 41: "2 год 10 хв", 188: "1 год 30 хв", 297: "20 хв" };

const CELL =
  "aspect-square cursor-default rounded-[1.5px] bg-white/[0.06] transition-[background-color] duration-[400ms] ease-[var(--ease)] hover:outline hover:outline-1 hover:outline-white/60 motion-reduce:transition-none";
const CELL_OK = "[[data-in]_&]:bg-[rgb(79_227_193/var(--a))]";
const CELL_BAD = "[[data-in]_&]:bg-[#ffb27a]";
const CELL_NOW =
  "[[data-in]_&]:bg-[#4fe3c1] [[data-in]_&]:shadow-[0_0_8px_#4fe3c1] [[data-in]_&]:animate-pulse motion-reduce:animate-none";

const tipText = (i: number) => {
  if (i === DAYS - 1) return "Сьогодні · усе працює";
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() - (DAYS - 1) + i);
  const date = d.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  return DOWNTIME[i] ? `${date} · ${DOWNTIME[i]} простою` : `${date} · без простою`;
};

const Cells = memo(function Cells() {
  return (
    <>
      {Array.from({ length: DAYS }, (_, i) => (
        <span
          key={i}
          data-i={i}
          className={`${CELL} ${i === DAYS - 1 ? CELL_NOW : DOWNTIME[i] ? CELL_BAD : CELL_OK}`}
          style={{
            ["--a" as string]: (0.22 + ((i * 37) % 10) / 30).toFixed(2),
            transitionDelay: `${((i % COLS) + Math.floor(i / COLS)) * 20}ms`, // diagonal wave
          }}
        />
      ))}
    </>
  );
});

function YearScene() {
  const scene = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);

  const over = (e: PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
    const box = scene.current;
    if (!cell || !box) return;
    const r = cell.getBoundingClientRect();
    const p = box.getBoundingClientRect();
    setTip({ i: Number(cell.dataset.i), x: r.left - p.left + r.width / 2, y: r.top - p.top });
  };

  return (
    <div ref={scene} className="absolute inset-0">
      <div
        role="img"
        aria-label="Доступність за останні 365 днів"
        onPointerOver={over}
        onPointerLeave={() => setTip(null)}
        className="absolute inset-x-6 bottom-14 top-7 grid content-center gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        <Cells />
      </div>
      <Tip show={tip !== null} left={tip?.x ?? 0} top={tip?.y ?? 0}>
        {tip ? tipText(tip.i) : ""}
      </Tip>
      <div aria-hidden="true" className="absolute inset-x-6 bottom-5 flex gap-4 text-[12px] text-body">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-[2px] bg-[rgb(79_227_193/0.7)]" />
          працювало
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-[2px] bg-[#ffb27a]" />
          простій
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-[2px] bg-[#4fe3c1] shadow-[0_0_6px_#4fe3c1]" />
          сьогодні
        </span>
      </div>
    </div>
  );
}
