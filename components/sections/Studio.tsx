"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { setMB } from "../build/shared";
import { CYCLE, HOLD, seg, stepAt, SH, SW, TOTAL, useStudio } from "../studio/engine";
import { Scene } from "../studio/Scene";
import { G } from "../ui/Bits";

/**
 * «Як ми працюємо», film v3 («Студія в одному вікні»): the studio's glass workspace. A project sidebar lists the six
 * steps (brief, design, development, admin, launch, support; the active one explains what the client gets) while app
 * windows open one after another and hand the client's site on: chat → brief → Figma → editor + preview → admin with
 * the phone → browser + analytics → support. Plays while ≥45% in view, loops; reduced motion shows the finished frame.
 */
export function Studio() {
  const S = useStudio();
  const ref = useRef<HTMLElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setMB(window.devicePixelRatio <= 1.5 && (navigator.hardwareConcurrency ?? 8) > 4);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTime(TOTAL + HOLD * 0.6);
      return;
    }
    let raf = 0;
    let last = 0;
    let acc = 0;
    let on = false;
    const tick = (now: number) => {
      if (last) acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (acc >= CYCLE) acc -= CYCLE;
      setTime(acc);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        const vis = e.intersectionRatio >= 0.45;
        if (vis && !on) {
          on = true;
          last = 0;
          raf = requestAnimationFrame(tick);
        } else if (!vis && on) {
          on = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: [0, 0.45] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const t = Math.min(time, TOTAL + HOLD);
  /** the lap fades out over its last 0.45s and the next one fades in over its first 0.35s */
  const fin = Math.max(seg(time, CYCLE - 0.45, CYCLE), 1 - seg(time, 0, 0.35));
  const cur = stepAt(Math.min(t, TOTAL - 0.01));
  const st = S.steps[cur];

  return (
    <section ref={ref} id="process" data-boot aria-labelledby="studio-title" className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden pt-28">
      <div className="relative z-[1] flex flex-col items-center px-gutter text-center">
        <h2 id="studio-title" className="legible text-mega font-semibold">
          {S.label.split(" ").slice(0, -1).join(" ")} <G tone="teal">{S.label.split(" ").slice(-1)[0]}.</G>
        </h2>
        <p className="legible mt-5 max-w-[64ch] text-lead text-body">
          <span className="font-semibold text-fg">{S.title.join(" ")}</span> {S.lead}
        </p>
        <ol className="sr-only">
          {S.steps.map((s) => (
            <li key={s.id}>
              {s.name}: {s.get}
            </li>
          ))}
        </ol>
      </div>

      <FilmBox>
        <Scene t={t} fin={fin} />
      </FilmBox>

      {/* phones: the sidebar is cropped away, so the active step and what the client gets are told here */}
      <div className="relative z-[1] mx-auto mb-10 mt-2 w-full max-w-[40rem] px-gutter lg:hidden" aria-hidden="true">
        <p key={cur} className="build-note legible text-[16px] leading-relaxed text-body">
          <span className="font-semibold" style={{ color: st.color }}>
            {st.name}.
          </span>{" "}
          {st.get}
        </p>
      </div>
    </section>
  );
}

/** the phone crop: the workspace without the sidebar */
const CROP = { x: 270, w: SW - 270 };

/** measures the box, scales the 1200 × 620 stage to fit; mounts the heavy scene only once the visitor shows signs of life */
function FilmBox({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0, mobile: false });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 63.99rem)");
    const measure = () => {
      const r = el.getBoundingClientRect();
      setFit({ w: r.width, h: r.height, mobile: mq.matches });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    if (awake) return;
    const el = box.current;
    const wake = () => setAwake(true);
    if (el && el.getBoundingClientRect().top < window.innerHeight) return wake();
    const evs = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true, once: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake));
  }, [awake]);

  const k = fit.mobile ? fit.w / CROP.w : Math.min(fit.w / SW, fit.h / SH);
  const ready = awake && fit.w > 0 && (fit.mobile || fit.h > 0);
  return (
    <div
      ref={box}
      aria-hidden="true"
      className="relative z-[1] mx-gutter mb-12 mt-8 max-lg:mb-4 max-lg:overflow-hidden lg:h-[max(26rem,min(calc(100dvh-19rem),calc((100vw-2*clamp(24px,5.5vw,80px))*0.5167)))]"
      style={fit.mobile && fit.w ? { height: SH * k } : undefined}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: SW,
          height: SH,
          transform: `translate(-50%, -50%) translateX(${fit.mobile ? ((SW / 2 - (CROP.x + CROP.w / 2)) * k).toFixed(1) : 0}px) scale(${k.toFixed(4)})`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {ready && children}
      </div>
    </div>
  );
}
