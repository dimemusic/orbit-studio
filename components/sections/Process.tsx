"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { PROCESS } from "@/lib/content";
import { CmsScene } from "../process/CmsScene";
import { CodeScene } from "../process/CodeScene";
import { DesignScene } from "../process/DesignScene";
import { LaunchScene } from "../process/LaunchScene";
import { homeNum } from "../home";
import { Eyebrow, G, IconTile, Tag } from "../ui/Bits";
import { useReducedMotion } from "../ui/hooks";
import { Icon } from "../ui/icons";

/** the four live scenes, one per step after the brief */
const STEPS = PROCESS.steps.slice(1);
const SCENES: ComponentType<{ t: number }>[] = [DesignScene, CodeScene, CmsScene, LaunchScene];
const N = SCENES.length;
const STAGE_W = 1000;
const STAGE_H = 640;
/** a scene plays over the first 85% of its scroll segment, then holds its final frame */
const PLAY = 0.85;

/**
 * Process as a scroll-driven film: the section pins to the screen and scrolling plays four full-screen scenes —
 * design (Figma-like), code typed live with a building preview, the CMS being filled and published,
 * and the launch (site assembles, gets packed, ships to the client, goes live).
 * The mock UIs live on a fixed 1000×640 stage scaled to fit. Reduced motion: every scene shown finished, no pinning.
 */
export function Process() {
  const reduced = useReducedMotion();
  const pin = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = pin.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const v = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      setP((prev) => (Math.abs(prev - v) > 0.0008 || v === 0 || v === 1 ? v : prev));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
    };
  }, [reduced]);

  const f = p * N;
  const active = Math.min(N - 1, Math.floor(f));
  const tOf = (i: number) => (i < active ? 1 : i > active ? 0 : Math.min(1, (f - i) / PLAY));

  const header = (
    <div className="plate flex flex-col items-start">
      <Eyebrow color="violet">
        <span className="tabular-nums">{homeNum("process")} · </span>
        {PROCESS.label}
      </Eyebrow>
      <h2 id="process-title" className="legible mt-4 text-[clamp(30px,3.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.045em]">
        {PROCESS.title[0]} <G tone="ice">{PROCESS.title[1]}</G>
      </h2>
      <p className="legible mt-3 text-[15px] text-body">{PROCESS.lead}</p>
    </div>
  );

  if (reduced) {
    return (
      <section id="process" aria-labelledby="process-title" className="w-full px-gutter py-[clamp(96px,12vh,160px)]">
        {header}
        <ol className="mt-12 flex flex-col gap-16">
          {STEPS.map((s, i) => {
            const Scene = SCENES[i];
            return (
              <li key={s.n} className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.42fr)_1fr]">
                <StepText s={s} i={i} />
                <Stage>
                  <Scene t={1} />
                </Stage>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 text-[15px] font-medium text-body">{PROCESS.total}</p>
      </section>
    );
  }

  return (
    <section id="process" aria-labelledby="process-title" className="relative w-full">
      <div ref={pin} className="relative" style={{ height: `${N * 135 + 40}vh` }}>
        <div className="sticky top-0 flex h-[100dvh] flex-col gap-[clamp(16px,3vh,32px)] overflow-hidden px-gutter pb-[clamp(16px,4vh,48px)] pt-[clamp(88px,12vh,120px)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            {header}
            {/* scene tabs */}
            <ol className="flex gap-2" aria-label="Етапи">
              {STEPS.map((s, i) => (
                <li key={s.n} className="flex flex-col gap-2">
                  <span className={`text-[12px] font-semibold transition-colors duration-300 ${i === active ? "text-fg" : "text-faint"}`}>{s.title}</span>
                  <span className="block h-[3px] w-[clamp(56px,7vw,110px)] overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full origin-left rounded-full bg-gradient-to-r from-[#5aa2ff] to-violet" style={{ transform: `scaleX(${tOf(i)})` }} />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-6 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] lg:content-normal lg:gap-10">
            <div className="relative hidden lg:block">
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  aria-hidden={i !== active}
                  className="absolute inset-0 flex flex-col justify-center transition-[opacity,transform] duration-500 ease-[var(--ease)]"
                  style={{ opacity: i === active ? 1 : 0, transform: `translateY(${i === active ? 0 : i < active ? -24 : 24}px)`, visibility: i === active ? "visible" : "hidden" }}
                >
                  <StepText s={s} i={i} />
                </div>
              ))}
            </div>
            {/* phones / tablets: compact caption */}
            <p className="text-[15px] text-body lg:hidden">
              <span className="font-semibold text-fg">{STEPS[active].title}</span> · {STEPS[active].days}
            </p>
            <Stage>
              {SCENES.map((Scene, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease)]"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: `scale(${i === active ? 1 : 0.96}) translateY(${i === active ? 0 : i < active ? -16 : 16}px)`,
                    visibility: Math.abs(i - active) > 1 ? "hidden" : "visible",
                  }}
                >
                  {Math.abs(i - active) <= 1 && <Scene t={tOf(i)} />}
                </div>
              ))}
            </Stage>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepText({ s, i }: { s: (typeof STEPS)[number]; i: number }) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-3">
        <IconTile color="violet">
          <Icon name={s.icon} />
        </IconTile>
        <span className="text-[14px] tabular-nums text-grey">
          {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-6 text-[clamp(36px,3.8vw,64px)] font-semibold leading-[0.98] tracking-[-0.05em]">{s.title}</h3>
      <p className="mt-4 max-w-[34ch] text-[17px] leading-relaxed text-body">{s.text}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Tag color="cyan">{s.days}</Tag>
        {i === N - 1 && <span className="text-[14px] font-medium text-body">{PROCESS.total}</span>}
      </div>
    </div>
  );
}

/** fixed-size 1000×640 stage, scaled to fit its box (keeps every mock pixel-consistent on any screen) */
function Stage({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setK(Math.min(r.width / STAGE_W, (r.height || r.width * (STAGE_H / STAGE_W)) / STAGE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} aria-hidden="true" className="relative min-h-0 w-full flex-1 self-start [aspect-ratio:1000/640] lg:self-stretch lg:aspect-auto lg:h-full">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${k})`, visibility: k ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}
