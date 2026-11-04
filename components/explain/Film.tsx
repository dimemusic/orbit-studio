"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FilmScene } from "@/lib/content";
import { blur, setMB, SH, SW } from "../build/shared";
import { ease, expo, seg, smooth } from "../build/util";
import { G } from "../ui/Bits";

/**
 * Explainer film player for the service pages (the same craft as the home «Як ми працюємо» film, slower on purpose:
 * the visitor must have time to read what the type of site is). Each lap: a title card («Що таке сайт-візитівка?»),
 * the scenes one after another with their titles rolling, then the final frame is held. Chapter steps are real buttons
 * that jump to a scene; a note under the stage says in words what the scene shows.
 * The scene art is a fixed 1200×620 stage scaled to fit; under 64rem it is cropped to the current scene's focus rect
 * (interpolated during the hand-over). Plays at ≥ 45% in view, pauses off screen, loops; reduced motion: final frame.
 */
export type Rect = { x: number; y: number; w: number; h: number };
export type Timing = { intro: number; sec: number[]; hold: number; focus: Rect[] };
export type StageProps = { t: number; hold: number; fin: number; mobile: boolean };

const starts = (sec: number[]) => sec.map((_, i) => sec.slice(0, i).reduce((a, b) => a + b, 0));

export function ExplainFilm({
  id,
  intro,
  label,
  scenes,
  timing,
  Stage,
}: {
  id: string;
  intro: string[];
  label: string;
  scenes: FilmScene[];
  timing: Timing;
  Stage: (p: StageProps) => ReactNode;
}) {
  const START = starts(timing.sec);
  const TOTAL = timing.sec.reduce((a, b) => a + b, 0);
  const CYCLE = timing.intro + TOTAL + timing.hold;
  const ref = useRef<HTMLElement>(null);
  const acc = useRef(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setMB(window.devicePixelRatio <= 1.5 && (navigator.hardwareConcurrency ?? 8) > 4);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      acc.current = timing.intro + TOTAL + timing.hold - 0.6;
      setTime(acc.current);
      return;
    }
    let raf = 0;
    let last = 0;
    let on = false;
    const tick = (now: number) => {
      if (last) acc.current += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (acc.current >= CYCLE) acc.current -= CYCLE;
      setTime(acc.current);
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
  }, [CYCLE, TOTAL, timing.intro, timing.hold]);

  const t = Math.min(Math.max(0, time - timing.intro), TOTAL);
  const film = smooth(seg(time, timing.intro - 0.3, timing.intro + 0.25));
  const fin = seg(time, CYCLE - 0.5, CYCLE);
  const hold = Math.min(timing.hold, Math.max(0, time - timing.intro - TOTAL));
  let cur = 0;
  while (cur < scenes.length - 1 && t >= START[cur + 1]) cur++;
  const sc = scenes[cur];
  // jump to a chapter (a little before its start, so its entrance plays)
  const jump = (i: number) => {
    acc.current = timing.intro + Math.max(0, START[i] - 0.35);
    setTime(acc.current);
  };

  return (
    <section ref={ref} id={id} data-boot aria-labelledby={`${id}-title`} className="relative flex w-full flex-col overflow-hidden pb-12 pt-24">
      <h2 id={`${id}-title`} className="sr-only">
        {label}
      </h2>
      <div className="relative">
        <Intro time={time} words={intro} at={timing.intro} />
        <div className="relative flex flex-col" style={film < 1 ? { opacity: film } : undefined}>
          <div className="flex flex-col items-center px-gutter text-center">
            <Titles t={t} fin={fin} scenes={scenes} start={START} sec={timing.sec} />
            <ol className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {scenes.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === cur ? "step" : undefined}
                    className="flex items-center gap-3 rounded-full py-2 text-sm font-semibold transition-colors"
                  >
                    <span className={i === cur ? "text-fg" : "text-faint hover:text-body"}>{s.step}</span>
                    <span aria-hidden="true" className="block h-1 w-12 overflow-hidden rounded-full bg-white/10 lg:w-16">
                      <span
                        className="block h-full origin-left rounded-full"
                        style={{ background: s.color, transform: `scaleX(${seg(t, START[i], START[i] + timing.sec[i])})` }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <FilmBox focus={timing.focus} start={START} t={t}>
            {(mobile) => <Stage t={t} hold={hold} fin={fin} mobile={mobile} />}
          </FilmBox>

          {/* what the scene shows, in words: the visitor reads it while the scene plays */}
          <p key={cur} aria-live="polite" className="build-note legible mx-auto mt-6 min-h-16 max-w-[40rem] px-gutter text-center text-lead text-body">
            <span className="font-semibold tabular-nums" style={{ color: sc.color }}>
              0{cur + 1} / 0{scenes.length}
            </span>{" "}
            {sc.note}
          </p>
        </div>
      </div>
    </section>
  );
}

/** the scaled stage; under 64rem it is cropped to the current scene's focus rect, gliding between scenes */
function FilmBox({ focus, start, t, children }: { focus: Rect[]; start: number[]; t: number; children: (mobile: boolean) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ mobile: false, w: 0, vh: 800 });
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 63.99rem)");
    const measure = () => setFit({ mobile: mq.matches, w: el.getBoundingClientRect().width, vh: window.innerHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);
  // heavy art mounts only once the visitor shows signs of life or the box is already on screen
  useEffect(() => {
    if (awake) return;
    const el = box.current;
    const wake = () => setAwake(true);
    if (el && el.getBoundingClientRect().top < window.innerHeight) return wake();
    const evs = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true, once: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake));
  }, [awake]);

  // focus rect now: around each scene boundary (-0.5s .. +0.4s) it glides from the previous scene's rect to this one's
  let i = 0;
  while (i < focus.length - 1 && t >= start[i + 1] - 0.5) i++;
  const g = i > 0 ? smooth(seg(t, start[i] - 0.5, start[i] + 0.4)) : 1;
  const a = focus[Math.max(0, i - 1)];
  const b = focus[i];
  const r = { x: a.x + (b.x - a.x) * g, y: a.y + (b.y - a.y) * g, w: a.w + (b.w - a.w) * g, h: a.h + (b.h - a.h) * g };
  // desktop: as wide as the box, but never taller than the window minus the titles above it (the whole film stays in view)
  const k = Math.min(fit.w / SW, Math.max(0.45, (fit.vh - 320) / SH));
  const c = fit.mobile ? Math.min(fit.w / r.w, (fit.vh * 0.58) / r.h) : k;
  const height = fit.mobile ? r.h * c : SH * k;
  const tx = fit.mobile ? (fit.w - r.w * c) / 2 - r.x * c : (fit.w - SW * k) / 2;
  const ty = fit.mobile ? -r.y * c : 0;
  const ready = awake && fit.w > 0;
  return (
    <div ref={box} aria-hidden="true" className="relative mx-gutter mt-8 overflow-hidden" style={{ height: fit.w ? height : undefined, aspectRatio: fit.w ? undefined : `${SW} / ${SH}` }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: SW, height: SH, transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${c.toFixed(4)})`, visibility: ready ? "visible" : "hidden" }}
      >
        {ready && children(fit.mobile)}
      </div>
    </div>
  );
}

/** title card before every lap: words rise out of a blur in the middle, then lift away */
function Intro({ time, words, at }: { time: number; words: string[]; at: number }) {
  if (time >= at + 0.05) return null;
  const out = seg(time, at - 0.5, at) ** 2;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[2] grid h-[min(100%,32rem)] place-items-center px-gutter">
      <p className="text-center text-mega font-semibold">
        {words.map((w, i) => {
          const k = expo(seg(time, 0.1 + i * 0.12, 0.8 + i * 0.12));
          const moving = k < 0.999 || out > 0;
          return (
            <span
              key={i}
              className="inline-block"
              style={moving ? { transform: `translateY(${((1 - k) * 0.35 - out * 0.25).toFixed(3)}em)`, filter: `blur(${((1 - k) * 12 + out * 14).toFixed(1)}px)`, opacity: Math.min(1, k * 1.4) * (1 - out) } : undefined}
            >
              {i === words.length - 1 ? <G tone="violet">{w}</G> : w}
              {i < words.length - 1 && " "}
            </span>
          );
        })}
      </p>
    </div>
  );
}

/** scene titles roll: the outgoing letters lift away while the next title rises in the same cell */
function Titles({ t, fin, scenes, start, sec }: { t: number; fin: number; scenes: FilmScene[]; start: number[]; sec: number[] }) {
  const n = scenes.length;
  let cur = 0;
  while (cur < n - 1 && t >= start[cur + 1]) cur++;
  const shown = [cur - 1, cur, cur + 1]
    .filter((i) => i >= 0 && i < n)
    .map((i) => {
      const end = start[i] + sec[i];
      const inAt = i === 0 ? start[i] + 0.15 : start[i] - 0.14;
      const outK = i === n - 1 ? fin : seg(t, end - 0.3, end + 0.12);
      return { i, inAt, outK };
    })
    .filter(({ inAt, outK }) => t >= inAt && outK < 1);
  return (
    <p aria-hidden="true" className="grid min-h-[1.1em] justify-items-center text-mega font-semibold">
      {shown.map(({ i, inAt, outK }) => {
        const st = scenes[i];
        let c = 0;
        return (
          <span key={st.id} className="col-start-1 row-start-1">
            {st.title.map((w, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap" style={{ color: wi === st.title.length - 1 ? st.color : undefined }}>
                {Array.from(w).map((ch, ci) => {
                  const k = expo(seg(t, inAt + c * 0.02, inAt + 0.6 + c * 0.02));
                  const o = ease(Math.min(1, Math.max(0, outK * 1.35 - c * 0.012)));
                  c++;
                  return (
                    <span
                      key={ci}
                      className="inline-block"
                      style={
                        k < 0.999 || o > 0
                          ? { transform: `translateY(${((1 - k) * 0.42 - o * 0.42).toFixed(3)}em)`, filter: blur((1 - k) * 12 + o * 12), opacity: Math.min(1, k * 1.5) * (1 - o) }
                          : undefined
                      }
                    >
                      {ch === " " ? " " : ch}
                    </span>
                  );
                })}
                {wi < st.title.length - 1 && <span className="inline-block w-[0.26em]" />}
              </span>
            ))}
          </span>
        );
      })}
    </p>
  );
}

