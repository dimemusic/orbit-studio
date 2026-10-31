"use client";

import { useEffect, useRef, useState } from "react";
import { G } from "../ui/Bits";
import { CmsStage } from "../build/Cms";
import { CodeStage } from "../build/Code";
import { DesignStage } from "../build/Design";
import { LaunchStage } from "../build/Launch";
import { ProductAt, ProductFrame } from "../build/Product";
import { beatsOf, blur, CYCLE, HAND, HOLD, INTRO, MB, setMB, STAGE_SEC, STAGE_START, stageAt, TOTAL, useB } from "../build/shared";
import { StageBox, StageLayer } from "../build/Stage";
import { ease, expo, seg, smooth } from "../build/util";

/**
 * «Як ми працюємо»: a ~15s film that loops while the section is in view; the stages live in components/build/.
 * No app windows: a grid draws on the page background, our own tool panels fly in around the product.
 * The product (the mock site) is one object through the film (build/Product.tsx): artboard → code preview → phone →
 * browser, reshaping between stages while the tools of one stage whip out and the next ones whip in over the same
 * window, and the big H1 rolls from one stage title to the next: no empty beat anywhere.
 * The held final frame is the payoff: the site is live and its first visitor, request and order arrive.
 * The mock UI lives on a fixed 1200×620 stage scaled to fit. Reduced motion: the finished final frame at once.
 */
export function Build() {
  const { BUILD } = useB();
  const ref = useRef<HTMLElement>(null);
  // `time` runs 0..CYCLE in a loop: the film (0..TOTAL), then the final frame is held for HOLD seconds
  const [time, setTime] = useState(0);
  const [lap, setLap] = useState(0);

  // loop while the section is on screen; pause (and resume from the same spot) when it is not
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setMB(window.devicePixelRatio <= 1.5 && (navigator.hardwareConcurrency ?? 8) > 4);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // the finished payoff frame (all events in, the visitor's cursor gone, before the lap's exit whip)
      setTime(INTRO + TOTAL + HOLD - 0.45);
      return;
    }
    let raf = 0;
    let last = 0;
    let acc = 0;
    let laps = 0;
    let on = false;
    const tick = (now: number) => {
      if (last) acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (acc >= CYCLE) {
        acc -= CYCLE;
        laps++;
        setLap(laps);
      }
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

  const t = Math.min(Math.max(0, time - INTRO), TOTAL);
  // the film layer fades in as the title card leaves
  const film = smooth(seg(time, INTRO - 0.25, INTRO + 0.2));
  /** 0 → 1 over the last 0.4s of the hold: the launch stage whips out before the next lap */
  const fin = seg(time, CYCLE - 0.4, CYCLE);
  /** seconds into the held final frame (0..HOLD): the finale runs on it */
  const hold = Math.min(HOLD, Math.max(0, time - INTRO - TOTAL));
  const cur = stageAt(t);
  const st = BUILD.stages[cur];
  // the grid draws only on the first lap
  const gridH = lap ? 1 : ease(seg(time, 0, 0.7));
  const gridV = lap ? 1 : ease(seg(time, 0.15, 0.85));

  return (
    <section
      ref={ref}
      id="process"
      data-boot
      aria-labelledby="build-title"
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      {/* grid drawn on the page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, #000 22%, #000 80%, transparent), linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 22%, #000 80%, transparent), linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <div
          className="absolute inset-0 [background-image:linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:100%_80px]"
          style={{ clipPath: `inset(0 ${(1 - gridH) * 100}% 0 0)` }}
        />
        <div
          className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:80px_100%]"
          style={{ clipPath: `inset(0 0 ${(1 - gridV) * 100}% 0)` }}
        />
      </div>

      <IntroCard time={time} />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col" style={film < 1 ? { opacity: film } : undefined}>
      <div className="relative z-[1] flex flex-col items-center px-gutter pt-28 text-center">
        <h2 id="build-title" className="sr-only">
          {BUILD.label}: {BUILD.stages.map((s) => s.title.join(" ")).join(" ")}
        </h2>
        <Title t={t} fin={fin} />
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
          aria-hidden="true"
        >
          {BUILD.stages.map((s, i) => (
            <span key={s.id} className="flex items-center gap-2.5">
              <span
                className={`text-[13px] font-semibold transition-colors duration-300 ${i === cur ? "text-fg" : "text-faint"}`}
              >
                {s.step}
              </span>
              <span className="block h-[3px] w-[clamp(40px,5vw,72px)] overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full origin-left rounded-full"
                  style={{
                    background: s.color,
                    transform: `scaleX(${seg(t, STAGE_START[i], STAGE_START[i] + STAGE_SEC[i])})`,
                  }}
                />
              </span>
            </span>
          ))}
        </div>
      </div>

      <StageBox cur={cur}>
        <Stages t={t} fin={fin} hold={hold} />
      </StageBox>

      {/* phones only: what this stage means for the client, fills the space under the stage */}
      <div className="relative z-[1] mx-auto mb-10 mt-4 flex w-full max-w-[40rem] flex-col gap-5 px-gutter lg:hidden">
        <p key={cur} className="build-note legible min-h-[4.5em] text-[16px] leading-relaxed text-body">
          <span className="font-semibold tabular-nums" style={{ color: st.color }}>
            0{cur + 1} / 0{BUILD.stages.length}
          </span>{" "}
          {st.note}
        </p>
      </div>
      </div>
    </section>
  );
}

/**
 * The stages on screen right now. During a hand-over two are: the outgoing one is drawn UNDER the product (its tools
 * must not slide across it) and fades early with a small drift, the incoming one arrives above it (selections,
 * cursors and toasts sit on the product).
 */
function Stages({ t, fin, hold }: { t: number; fin: number; hold: number }) {
  const { BUILD } = useB();
  const layers = BUILD.stages.map((s, i) => {
    const start = STAGE_START[i];
    const len = STAGE_SEC[i];
    const last = i === BUILD.stages.length - 1;
    // a stage is on screen through its hand-over windows: the next one arrives while it leaves
    if (t < start - HAND.before - 0.02 || (!last && t > start + len + HAND.after + 0.02)) return null;
    // first stage of a lap: its tools fly in by themselves; later stages arrive with the hand-over
    const enter = i === 0 ? expo(seg(t, start - 0.08, start + 0.7)) : expo(seg(t, start - HAND.before, start + HAND.after));
    // leaving: fades early and drifts a little (accelerating), so the two stages barely overlap on screen
    const exitK = last ? fin : seg(t, start + len - HAND.before, start + len + HAND.after * 0.6);
    const gone = smooth(Math.min(1, exitK * 1.5));
    const drift = exitK * exitK;
    const layer = (
      <StageLayer
        key={s.id}
        i={i}
        whip={
          // only while the whip runs: a permanent will-change / 3D transform freezes the raster and the stage turns soft when scaled up
          enter < 0.999 || exitK > 0
            ? {
                transform: `translate(${((1 - enter) * 150 - drift * 110).toFixed(1)}px, 0) scale(${(1 - (1 - enter) * 0.03 - drift * 0.03).toFixed(4)})`,
                filter: blur((1 - enter) * 12 + gone * 12),
                opacity: Math.min(1, enter * 1.25) * (1 - gone),
                willChange: MB ? "transform, filter, opacity" : "transform, opacity",
              }
            : undefined
        }
      >
        {/* phones: this stage's product inside its cropped layer */}
        <ProductAt i={i} t={t} hold={hold} />
        {i === 0 && <DesignStage s={beatsOf(t, 0)} />}
        {i === 1 && <CodeStage s={beatsOf(t, 1)} />}
        {i === 2 && <CmsStage s={beatsOf(t, 2)} />}
        {i === 3 && <LaunchStage s={beatsOf(t, 3)} hold={hold} />}
      </StageLayer>
    );
    return { layer, leaving: !last && exitK > 0 };
  });
  const on = layers.filter((l): l is NonNullable<typeof l> => !!l);
  return (
    <>
      {on.filter((l) => l.leaving).map((l) => l.layer)}
      {/* desktop: the one product */}
      <ProductFrame t={t} fin={fin} hold={hold} />
      {on.filter((l) => !l.leaving).map((l) => l.layer)}
    </>
  );
}

/** title card before every lap: words rise out of a blur in the middle of the screen, then lift away */
function IntroCard({ time }: { time: number }) {
  const { BUILD } = useB();
  if (time >= INTRO + 0.05) return null;
  const out = seg(time, INTRO - 0.45, INTRO) ** 2;
  const words = BUILD.intro;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] grid place-items-center px-gutter">
      <p className="text-center text-mega font-semibold">
        {words.map((w, i) => {
          const k = expo(seg(time, 0.08 + i * 0.1, 0.7 + i * 0.1));
          const moving = k < 0.999 || out > 0;
          const word = i === words.length - 1 ? <G tone="teal">{w}</G> : w;
          return (
            <span key={i} className="inline-block" style={moving ? { transform: `translateY(${((1 - k) * 0.35 - out * 0.25).toFixed(3)}em)`, filter: `blur(${((1 - k) * 12 + out * 14).toFixed(1)}px)`, opacity: Math.min(1, k * 1.4) * (1 - out) } : undefined}>
              {word}
              {i < words.length - 1 && "\u00a0"}
            </span>
          );
        })}
      </p>
    </div>
  );
}

/**
 * Stage titles roll: at each hand-over the outgoing title's letters lift away while the next title's letters rise in
 * underneath (same cell, overlapping by ~0.3s), so the line is never empty. The last title leaves with the lap.
 */
function Title({ t, fin }: { t: number; fin: number }) {
  const { BUILD } = useB();
  const n = BUILD.stages.length;
  const cur = stageAt(t);
  const shown = [cur - 1, cur, cur + 1]
    .filter((i) => i >= 0 && i < n)
    .map((i) => {
      const start = STAGE_START[i];
      const end = start + STAGE_SEC[i];
      const inAt = i === 0 ? start + 0.15 : start - 0.14;
      const outK = i === n - 1 ? fin : seg(t, end - 0.3, end + 0.12);
      return { i, inAt, outK };
    })
    .filter(({ inAt, outK }) => t >= inAt && outK < 1);
  return (
    <p aria-hidden="true" className="mt-5 grid min-h-[1.1em] justify-items-center text-mega font-semibold">
      {shown.map(({ i, inAt, outK }) => {
        const st = BUILD.stages[i];
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
                          ? {
                              transform: `translateY(${((1 - k) * 0.42 - o * 0.42).toFixed(3)}em)`,
                              filter: blur((1 - k) * 12 + o * 12),
                              opacity: Math.min(1, k * 1.5) * (1 - o),
                            }
                          : undefined
                      }
                    >
                      {ch === " " ? "\u00a0" : ch}
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
