"use client";

import { CheckCircle, ImageSquare, Plus } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ADMIN } from "@/lib/content";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { useReducedMotion } from "../ui/hooks";

type Step = { n: string; title: string; text: string; Demo: (p: { active: boolean }) => ReactNode };

const STEPS: Step[] = [
  { ...ADMIN.steps[0], Demo: PriceStep },
  { ...ADMIN.steps[1], Demo: PhotoStep },
  { ...ADMIN.steps[2], Demo: ProductStep },
];

/**
 * 05 Admin demo: horizontal stepper (01 · 02 · 03 + progress line), ONE mock CMS card below.
 * Once the section is in view the steps play 01 → 02 → 03 on their own and stop on the last one.
 * Tapping a step jumps there and the autoplay continues from it.
 */
export function AdminDemo() {
  return (
    <HomeSection
      id="admin"
      label={ADMIN.label}
      color="cyan"
      title={
        <>
          {ADMIN.title[0]} <G tone="calm">{ADMIN.title[1]}</G>
        </>
      }
      lead={ADMIN.lead}
    >
      <AutoSteps />
    </HomeSection>
  );
}

// each step: rest, then the line flows on to the next node and that step opens when it arrives
const DWELL = 4200;
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

/* ---------- mock CMS ---------- */

/**
 * Phase counter for a once-per-show demo: 0 → 1 → … at the given times (ms) after `active` turns on.
 * Reduced motion: final phase immediately.
 */
function usePhases(active: boolean, at: number[]) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(at.length);
      return;
    }
    const ids = at.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => ids.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return phase;
}

/** types `text` out while `on` (one character every 55 ms); full text once `done` */
function useTyped(text: string, on: boolean, done: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (done) {
      setN(text.length);
      return;
    }
    if (!on) {
      setN(0);
      return;
    }
    const id = window.setInterval(() => setN((k) => (k >= text.length ? k : k + 1)), 55);
    return () => window.clearInterval(id);
  }, [text, on, done]);
  return text.slice(0, n);
}

// demo photos: gradients in the palette (no real images in the mock)
const PHOTO_A = "radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 45%, #3b2306)";
const PHOTO_B = "radial-gradient(circle at 60% 40%, #bbf7d0, #34d399 45%, #06281b)";

/** Window chrome + sidebar + editor + live site preview. Shared by all three steps. */
function CmsWindow({ section, editor, site, saved }: { section: number; editor: ReactNode; site: ReactNode; saved: boolean }) {
  return (
    <figure aria-label="Демо адмінки: клієнт змінює ціну, фото й товари сам" className="w-full">
      <div className="flex h-11 items-center border-b border-hairline px-4">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto text-[13px] text-grey">{ADMIN.window}</span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[180px_minmax(0,1fr)_280px]">
        <aside className="hidden border-r border-hairline p-4 lg:block">
          <ul className="space-y-0.5">
            {ADMIN.sidebar.map((p, i) => (
              <li key={p} className={`rounded-lg px-2 py-1.5 text-[14px] ${i === section ? "bg-white/[0.06] text-fg" : "text-grey"}`}>
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-h-[280px] p-5 sm:p-7">
          {editor}
          {/* toast: slides up once published; always in the flow so nothing jumps */}
          <p
            className={`mt-4 flex w-fit items-center gap-2 rounded-full bg-green/12 px-3 py-1.5 text-[13px] font-medium text-green transition-[transform,visibility] duration-500 ease-[var(--ease)] ${
              saved ? "visible translate-y-0" : "invisible translate-y-3"
            }`}
          >
            <CheckCircle size={15} weight="fill" aria-hidden="true" />
            {ADMIN.saved}
          </p>
        </div>

        <div className="border-t border-hairline p-5 md:border-l md:border-t-0">
          <p className="flex items-center gap-2 text-[12px] text-grey">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${saved ? "bg-green" : "bg-white/20"} transition-colors duration-500`} />
            {ADMIN.preview}
          </p>
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">{site}</div>
        </div>
      </div>
    </figure>
  );
}

const FIELD = "flex h-11 items-center rounded-xl border px-3.5 text-[15px] transition-colors duration-300";
const LABEL = "text-[12px] text-grey";

function PublishButton({ pressed, done }: { pressed: boolean; done: boolean }) {
  return (
    <span
      className={`mt-5 inline-flex h-10 items-center rounded-full px-5 text-[14px] font-semibold transition-[transform,background-color] duration-300 ${
        done ? "bg-green/15 text-green" : "btn-primary"
      } ${pressed && !done ? "scale-95" : ""}`}
    >
      {ADMIN.publish}
    </span>
  );
}

function SiteCard({ name, price, photo, fresh }: { name: string; price: string; photo: string; fresh?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg p-1.5 ${fresh ? "animate-[quote-in_0.6s_var(--ease)_both] bg-white/[0.04]" : ""}`}>
      <span aria-hidden="true" className="size-9 shrink-0 rounded-md transition-[background] duration-700" style={{ background: photo }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-fg">{name}</span>
        <span key={price} className="block animate-[quote-in_0.5s_var(--ease)_both] text-[12px] font-medium text-cyan">
          {price}
        </span>
      </span>
    </div>
  );
}

const [P1, P2, P3] = ADMIN.products;

function PriceStep({ active }: { active: boolean }) {
  // 0 rest · 1 field focused, typing · 2 publish pressed · 3 published
  const phase = usePhases(active, [700, 2200, 2600]);
  const typed = useTyped(ADMIN.newPrice, phase >= 1, phase >= 2);
  const editing = phase >= 1;
  const saved = phase >= 3;
  return (
    <CmsWindow
      section={0}
      saved={saved}
      editor={
        <div>
          <p className={LABEL}>Назва</p>
          <p className={`${FIELD} mt-1.5 border-white/10 text-fg`}>{P1}</p>
          <p className={`${LABEL} mt-4`}>Ціна</p>
          <p className={`${FIELD} mt-1.5 ${editing && !saved ? "border-blue" : "border-white/10"} text-fg`}>
            {editing ? typed : ADMIN.oldPrice}
            {editing && !saved && <span aria-hidden="true" className="caret ml-px inline-block h-5 w-px bg-blue" />}
          </p>
          <PublishButton pressed={phase >= 2} done={saved} />
        </div>
      }
      site={
        <div className="space-y-1">
          <SiteCard name={P1} price={saved ? ADMIN.newPrice : ADMIN.oldPrice} photo={PHOTO_A} />
          <SiteCard name={P2} price={ADMIN.oldPrice} photo={PHOTO_B} />
        </div>
      }
    />
  );
}

function PhotoStep({ active }: { active: boolean }) {
  // 0 rest · 1 new photo dragged in · 2 publish pressed · 3 published
  const phase = usePhases(active, [900, 2000, 2400]);
  const dropped = phase >= 1;
  const saved = phase >= 3;
  return (
    <CmsWindow
      section={0}
      saved={saved}
      editor={
        <div>
          <p className={LABEL}>Фото · {P1}</p>
          <div className="mt-1.5 flex items-center gap-4">
            <span
              aria-hidden="true"
              className={`relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border transition-colors duration-500 ${
                dropped ? "border-white/10" : "border-dashed border-blue/60"
              }`}
            >
              <span className="absolute inset-0 transition-opacity duration-700" style={{ background: PHOTO_A, opacity: dropped ? 0 : 1 }} />
              <span
                className={`absolute inset-0 transition-transform duration-700 ease-[var(--ease)] ${dropped ? "translate-y-0" : "-translate-y-full"}`}
                style={{ background: PHOTO_B }}
              />
            </span>
            <span className="text-[14px] text-body">
              <ImageSquare size={18} weight="light" className="mb-1 text-grey" aria-hidden="true" />
              {dropped ? "nove-foto.jpg" : "Перетягніть фото сюди"}
            </span>
          </div>
          <PublishButton pressed={phase >= 2} done={saved} />
        </div>
      }
      site={
        <div className="space-y-1">
          <SiteCard name={P1} price={ADMIN.oldPrice} photo={saved ? PHOTO_B : PHOTO_A} />
          <SiteCard name={P2} price={ADMIN.oldPrice} photo={PHOTO_B} />
        </div>
      }
    />
  );
}

function ProductStep({ active }: { active: boolean }) {
  // 0 rest · 1 «add» clicked, name typing · 2 price filled · 3 publish pressed · 4 published
  const phase = usePhases(active, [600, 1900, 2500, 2900]);
  const name = useTyped(P3, phase >= 1, phase >= 2);
  const saved = phase >= 4;
  return (
    <CmsWindow
      section={0}
      saved={saved}
      editor={
        <div>
          <span
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors duration-300 ${
              phase >= 1 ? "border-blue/60 text-fg" : "border-white/15 text-body"
            }`}
          >
            <Plus size={13} aria-hidden="true" /> {ADMIN.newProduct}
          </span>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className={LABEL}>Назва</p>
              <p className={`${FIELD} mt-1.5 ${phase >= 1 && phase < 2 ? "border-blue" : "border-white/10"} text-fg`}>
                {name}
                {phase === 1 && <span aria-hidden="true" className="caret ml-px inline-block h-5 w-px bg-blue" />}
              </p>
            </div>
            <div>
              <p className={LABEL}>Ціна</p>
              <p className={`${FIELD} mt-1.5 border-white/10 text-fg`}>{phase >= 2 ? ADMIN.oldPrice : ""}</p>
            </div>
          </div>
          <PublishButton pressed={phase >= 3} done={saved} />
        </div>
      }
      site={
        <div className="space-y-1">
          <SiteCard name={P1} price={ADMIN.oldPrice} photo={PHOTO_A} />
          <SiteCard name={P2} price={ADMIN.oldPrice} photo={PHOTO_B} />
          {saved && <SiteCard name={P3} price={ADMIN.oldPrice} photo="radial-gradient(circle at 40% 35%, #fbcfe8, #f472b6 45%, #2a0718)" fresh />}
        </div>
      }
    />
  );
}
