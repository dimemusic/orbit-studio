"use client";

import { useEffect, useRef, useState } from "react";
import { G } from "../ui/Bits";
import { CmsStage } from "../build/Cms";
import { CodeStage } from "../build/Code";
import { DesignStage } from "../build/Design";
import { LaunchStage } from "../build/Launch";
import { BEATS, blur, CYCLE, INTRO, MB, setMB, STAGE_SEC, STAGE_START, stageAt, TOTAL, useB } from "../build/shared";
import { StageBox, StageLayer } from "../build/Stage";
import { ease, expo, seg, smooth } from "../build/util";

/**
 * «Як ми працюємо»: a ~14s film that loops while the section is in view; the stages live in components/build/.
 * No app windows: a grid draws on the page background, our own tool panels fly in around the artboard,
 * then it whips to live code, the CMS, and the launch. Everything that moves carries motion blur;
 * stages change with a blurred whip; the big centred H1 changes per stage, letter by letter.
 * The mock UI lives on a fixed 1200×620 stage scaled to fit. Reduced motion: final frame at once.
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
      setTime(INTRO + TOTAL);
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
  const cur = stageAt(t);
  const st = BUILD.stages[cur];
  // the grid draws only on the first lap
  const gridH = lap ? 1 : ease(seg(time, 0, 0.7));
  const gridV = lap ? 1 : ease(seg(time, 0.15, 0.85));

  return (
    <section
      ref={ref}
      id="process"
      aria-labelledby="build-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col overflow-hidden md:h-[100dvh]"
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
      <div className="relative z-[1] flex flex-col items-center px-gutter pt-[clamp(88px,12vh,128px)] text-center">
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
        {BUILD.stages.map((s, i) => {
          const start = STAGE_START[i];
          const len = STAGE_SEC[i];
          if (
            t < start - 0.15 ||
            (i < BUILD.stages.length - 1 && t > start + len + 0.05)
          )
            return null;
          // first lap: design is simply there; next laps: it whips in like the other stages
          const enter = expo(seg(t, start - 0.08, start + 0.7));
          const exitK =
            i === BUILD.stages.length - 1
              ? fin
              : seg(t, start + len - 0.32, start + len);
          const exit = exitK * exitK * exitK;
          const s0 = (Math.max(0, t - start) / len) * BEATS;
          return (
            <StageLayer
              key={s.id}
              i={i}
              whip={
                // only while the whip runs: a permanent will-change / 3D transform freezes the raster and the stage turns soft when scaled up
                enter < 0.999 || exit > 0
                  ? {
                      transform: `translate(${((1 - enter) * 200 - exit * 220).toFixed(1)}px, 0) scale(${(1 - (1 - enter) * 0.03 - exit * 0.03).toFixed(4)})`,
                      filter: blur((1 - enter) * 12 + exit * 14),
                      opacity: Math.min(1, enter * 1.25) * (1 - exit),
                      willChange: MB ? "transform, filter, opacity" : "transform, opacity",
                    }
                  : undefined
              }
            >
              {i === 0 && <DesignStage s={s0} />}
              {i === 1 && <CodeStage s={s0} />}
              {i === 2 && <CmsStage s={s0} />}
              {i === 3 && <LaunchStage s={s0} />}
            </StageLayer>
          );
        })}
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

/** stage title, letter by letter with blur in and blur out */
function Title({ t, fin }: { t: number; fin: number }) {
  const { BUILD } = useB();
  const i = stageAt(t);
  const st = BUILD.stages[i];
  const end = STAGE_START[i] + STAGE_SEC[i];
  const start = STAGE_START[i] + (i === 0 ? 0.15 : 0.04);
  const out = i === BUILD.stages.length - 1 ? fin ** 2 : seg(t, end - 0.3, end) ** 2;
  const words = st.title;
  let n = 0;
  return (
    <p
      aria-hidden="true"
      className="mt-5 min-h-[1.1em] text-mega font-semibold"
    >
      {words.map((w, wi) => (
        <span
          key={wi}
          className="inline-block whitespace-nowrap"
          style={{ color: wi === words.length - 1 ? st.color : undefined }}
        >
          {Array.from(w).map((ch, ci) => {
            const k = expo(seg(t, start + n * 0.022, start + 0.62 + n * 0.022));
            n++;
            return (
              <span
                key={ci}
                className="inline-block"
                style={
                  k < 0.999 || out > 0
                    ? {
                        transform: `translate(${(-out * 40).toFixed(1)}px, ${((1 - k) * 0.35).toFixed(3)}em)`,
                        filter: blur((1 - k) * 12 + out * 14),
                        opacity: Math.min(1, k * 1.5) * (1 - out),
                      }
                    : undefined
                }
              >
                {ch === " " ? "\u00a0" : ch}
              </span>
            );
          })}
          {wi < words.length - 1 && (
            <span className="inline-block w-[0.26em]" />
          )}
        </span>
      ))}
    </p>
  );
}
