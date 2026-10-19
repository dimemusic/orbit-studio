"use client";

import { CheckCircle, FileImage } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { useReducedMotion } from "../ui/hooks";
import { LineageDemo } from "./Features";
import { SearchPanel } from "./Search";

type Step = { n: string; title: string; text: string; Demo: (p: { active: boolean }) => ReactNode };

const STEPS: Step[] = [
  { n: "01", title: "Завантаж", text: "Файли до 500 ГБ вантажаться блоками й не губляться при обриві.", Demo: UploadStep },
  { n: "02", title: "Пов'яжи", text: "Кожен експорт пам'ятає свій макет і версію.", Demo: LinkStep },
  { n: "03", title: "Знайди", text: "Опиши файл словами, і він знайдеться за секунду.", Demo: SearchStep },
];

/**
 * Core home section: horizontal stepper (01 · 02 · 03 + progress line), ONE demo card below.
 * No scroll-jacking: once the section is in view the steps play 01 → 02 → 03 on their own
 * and stop on the last one. Tapping a step jumps there and the autoplay continues from it.
 */
export function HowItWorks() {
  return (
    <HomeSection
      id="how"
      label="Як це працює"
      color="cyan"
      title={
        <>
          Три кроки. <G tone="calm">Нуль хаосу.</G>
        </>
      }
      lead="Завантаж, пов'яжи, знайди. Решту зробить Cloud Sphere."
      more={{ href: "/features", label: "Детальніше про можливості" }}
    >
      <AutoSteps />
    </HomeSection>
  );
}

// each step: rest, then the line flows on to the next node and that step opens when it arrives
const DWELL = 2800;
const FLOW = 1200;

function AutoSteps() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);
  const [run, setRun] = useState(0); // bumps on a tap to restart the timeline from that step
  const reduced = useReducedMotion();
  const last = STEPS.length - 1;

  const setFill = (v: number) => {
    if (fill.current) fill.current.style.transform = `scaleX(${v / last})`;
  };

  // starts as soon as the stepper comes on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      // replay from 01 next time
      from.current = 0;
      setStep(0);
      setFill(0);
      return;
    }
    if (reduced) {
      setFill(from.current);
      return;
    }
    const start = performance.now();
    const seg = DWELL + FLOW;
    let raf = 0;
    let shown = from.current;
    const tick = (now: number) => {
      // rAF timestamps can be a few ms older than performance.now(): never let t go negative
      const t = Math.max(0, now - start);
      const cur = from.current + Math.floor(t / seg);
      if (cur >= last) {
        setFill(last);
        if (shown !== last) setStep(last);
        return;
      }
      const w = t % seg;
      const k = w < DWELL ? 0 : (w - DWELL) / FLOW;
      const e = k * k * (3 - 2 * k);
      setFill(cur + e);
      if (cur !== shown) {
        shown = cur;
        setStep(cur);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, run]);

  const pick = (i: number) => {
    from.current = i;
    setStep(i);
    setFill(i);
    setRun((r) => r + 1);
  };

  return (
    <div ref={root} className="w-full">
      <Steps step={step} playing={inView} onPick={pick} fillRef={fill} />
    </div>
  );
}

function Steps({
  step,
  playing,
  onPick,
  fillRef,
}: {
  step: number;
  playing: boolean;
  onPick: (i: number) => void;
  fillRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div className="w-full">
      <div className="plate">
        {/* progress line between the first and last node */}
        <span aria-hidden="true" className="absolute left-[16.667%] right-[16.667%] top-[22px] h-px bg-white/10">
          <span
            ref={fillRef}
            className="block h-full origin-left bg-gradient-to-r from-[#5aa2ff] via-violet to-[#e83fa8]"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
        <ol className="relative grid grid-cols-3">
          {STEPS.map((s, i) => {
            const on = i === step;
            const done = i < step;
            return (
              <li key={s.n} className="flex justify-center">
                <button
                  type="button"
                  aria-current={on ? "step" : undefined}
                  onClick={() => onPick(i)}
                  className="group flex flex-col items-center gap-3 rounded-2xl px-2 pb-1"
                >
                  <span
                    className={`relative grid size-11 place-items-center rounded-full border bg-bg text-[14px] font-semibold tabular-nums transition-colors duration-500 ${
                      on ? "border-blue/70 text-fg" : done ? "border-white/25 text-body" : "border-white/10 text-faint group-hover:text-body"
                    }`}
                  >
                    {s.n}
                  </span>
                  <span
                    className={`legible text-[clamp(17px,1.4vw,20px)] font-semibold tracking-[-0.02em] transition-colors duration-500 ${
                      on ? "text-fg" : "text-faint group-hover:text-body"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p key={step} aria-live="polite" className="legible mt-4 animate-[quote-in_0.4s_var(--ease)_both] text-[16px] text-body">
          {STEPS[Math.min(Math.max(step, 0), STEPS.length - 1)].text}
        </p>
      </div>

      {/* ONE demo card; panes share a grid cell and cross-fade inside it (the card itself never fades) */}
      <div className="card mt-8 grid overflow-hidden text-left [grid-template-areas:'stage']">
        {STEPS.map((s, i) => {
          const on = i === step;
          return (
            <div
              key={s.n}
              inert={!on}
              aria-hidden={!on}
              className={`transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:stage] ${
                on ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <s.Demo active={on && playing} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- one demo per step ---------- */

type Fact = { value: string; label: string };

/** Demo on the left, a facts column on the right (stacked under the demo on mobile). */
function Pane({ label, facts, active, children }: { label: string; facts: Fact[]; active: boolean; children: ReactNode }) {
  return (
    <div className="grid h-full p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex flex-col md:pr-10">
        <p className="text-[13px] text-grey">{label}</p>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-[520px]">{children}</div>
        </div>
      </div>
      <ul className="flex flex-col justify-center gap-6 border-t border-white/[0.06] pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
        {facts.map((f, i) => (
          <li
            key={f.value}
            className={`transition-[opacity,transform] duration-500 ease-[var(--ease)] motion-reduce:transition-none ${
              active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: active ? `${300 + i * 140}ms` : "0ms" }}
          >
            <p className="text-[26px] font-semibold leading-none tabular-nums text-fg">{f.value}</p>
            <p className="mt-2 text-[13px] text-grey">{f.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const UPLOAD_FACTS: Fact[] = [
  { value: "64 МБ", label: "блок: обрив зачіпає лише його" },
  { value: "0 МБ", label: "втрачено, якщо зник інтернет" },
  { value: "AES-256", label: "шифрування ще на твоєму пристрої" },
];

const LINK_FACTS: Fact[] = [
  { value: "3", label: "експорти пам'ятають своє джерело" },
  { value: "v7", label: "актуальна версія, решта в історії" },
  { value: "1 клік", label: "від банера до його макета" },
];

function UploadStep({ active }: { active: boolean }) {
  return (
    <Pane label="Блоки по 64 МБ, продовження з місця обриву" facts={UPLOAD_FACTS} active={active}>
      <UploadDemo active={active} />
    </Pane>
  );
}

function LinkStep({ active }: { active: boolean }) {
  return (
    <Pane label="Експорт пам'ятає джерело: наведи на файл" facts={LINK_FACTS} active={active}>
      <LineageDemo active={active} />
    </Pane>
  );
}

function SearchStep({ active }: { active: boolean }) {
  return <SearchPanel active={active} bare />;
}

/** Upload split into 38 chunks of 64 MB; runs once when its step is shown. */
function UploadDemo({ active }: { active: boolean }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPct(100);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 2600);
      setPct(100 * (1 - Math.pow(1 - t, 2.2)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  const done = pct >= 100;
  const chunks = Math.round((pct / 100) * 38);

  return (
    <div className="h-[124px]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue/12 text-blue">
          <FileImage size={18} weight="light" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] text-fg">kv_master.psd</span>
          <span className="block text-[12px] text-grey">2,4 ГБ</span>
        </span>
        <span className={`text-[14px] font-medium tabular-nums ${done ? "text-green" : "text-blue"}`}>{Math.round(pct)}%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full origin-left rounded-full transition-colors duration-500 ${done ? "bg-green" : "bg-blue"}`}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      {/* 38 chunks of 64 MB */}
      <div aria-hidden="true" className="mt-3 flex gap-[3px]">
        {Array.from({ length: 38 }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-[2px] transition-colors duration-300 ${i < chunks ? "bg-blue/70" : "bg-white/[0.07]"}`} />
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-grey">
        {done ? (
          <>
            <CheckCircle size={15} weight="fill" className="text-green" aria-hidden="true" />
            <span className="animate-[quote-in_0.5s_var(--ease)_both]">Завантажено й зашифровано</span>
          </>
        ) : (
          <span className="tabular-nums">Блок {chunks} з 38</span>
        )}
      </p>
    </div>
  );
}

