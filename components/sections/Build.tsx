"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowsOut,
  ArrowsOutLineVertical,
  CaretDown,
  ChartLineUp,
  ChatCircleDots,
  Check,
  CheckCircle,
  Cursor,
  Drop,
  EnvelopeSimple,
  FrameCorners,
  GraduationCap,
  Hand,
  Image as ImageIcon,
  LinkSimple,
  ListBullets,
  Lock,
  PenNib,
  Rows,
  ShieldCheck,
  Square,
  SquaresFour,
  TextAa,
  TextAlignLeft,
  TextB,
  TextItalic,
  TextT,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import {
  Fragment,
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BUILD } from "@/lib/content";
import { G } from "../ui/Bits";
import { along, Caret, ease, expo, seg, smooth, Typed, typed } from "../process/util";

/**
 * «Як ми працюємо»: a ~12s film that plays once by itself when the section comes into view.
 * No app windows: a grid draws on the page background, our own tool panels fly in around the artboard,
 * then it whips to live code, the CMS, and the launch. Everything that moves carries motion blur;
 * stages change with a blurred whip; the big centred H1 changes per stage, letter by letter.
 * The mock UI lives on a fixed 1200×620 stage scaled to fit. Reduced motion: final frame at once.
 */
/** each stage's inner timeline is 3 beats; this is how many real seconds each one gets.
 *  Design (the craft) and the panel (the client's benefit) get more time, code and launch read at a glance. */
const BEATS = 3;
const STAGE_SEC = [5.0, 3.2, 4.0, 3.4];
const STAGE_START = STAGE_SEC.map((_, i) =>
  STAGE_SEC.slice(0, i).reduce((a, b) => a + b, 0),
);
const TOTAL = STAGE_SEC.reduce((a, b) => a + b, 0);
/** the final frame is held this long, then the film starts again */
const HOLD = 5;
/** each lap opens with a title card in the middle of the screen («Що ми робимо?»), then the film starts */
const INTRO = 1.3;
const CYCLE = INTRO + TOTAL + HOLD;
const stageAt = (t: number) => {
  let i = 0;
  while (i < STAGE_SEC.length - 1 && t >= STAGE_START[i + 1]) i++;
  return i;
};
const SW = 1200;
const SH = 620;

/**
 * Motion blur budget. Blur only on big moving things (stage whips, title letters, panels with px ≥ BIG_BLUR);
 * small pieces move with translate + opacity only. Off entirely on dense / weak devices (DPR > 1.5 or ≤ 4 cores),
 * where a filter per frame on a scaled stage costs more than it shows. Set once on mount (see Build).
 */
let MB = true;
const BIG_BLUR = 10;
const blur = (px: number) => (MB && px > 0.05 ? `blur(${px.toFixed(2)}px)` : undefined);

/** motion-blur style for an element that flies in: k = 0 (start) → 1 (settled) */
const fly = (
  k: number,
  dx = 0,
  dy = 0,
  px = 14,
  extra = "",
): CSSProperties => ({
  // settled elements get no transform / filter / will-change, so the browser rasterises them sharp at the final scale
  transform: k < 1 ? `translate(${((1 - k) * dx).toFixed(1)}px, ${((1 - k) * dy).toFixed(1)}px) ${extra}` : extra || undefined,
  filter: k < 0.999 && px >= BIG_BLUR ? blur((1 - k) * px) : undefined,
  opacity: Math.min(1, k * 1.6),
  willChange: k < 1 ? (MB && px >= BIG_BLUR ? "transform, filter, opacity" : "transform, opacity") : undefined,
});

export function Build() {
  const ref = useRef<HTMLElement>(null);
  // `time` runs 0..CYCLE in a loop: the film (0..TOTAL), then the final frame is held for HOLD seconds
  const [time, setTime] = useState(0);
  const [lap, setLap] = useState(0);

  // loop while the section is on screen; pause (and resume from the same spot) when it is not
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    MB = window.devicePixelRatio <= 1.5 && (navigator.hardwareConcurrency ?? 8) > 4;
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
      <header className="relative z-[1] flex flex-col items-center px-gutter pt-[clamp(88px,12vh,128px)] text-center">
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
        <p className="mt-3 text-[14px] text-body" aria-live="polite">
          {st.step} · {st.days}
          {t >= TOTAL - 0.4 && (
            <span className="text-grey"> · {BUILD.replayNote}</span>
          )}
        </p>
      </header>

      <StageBox>
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
            <div
              key={s.id}
              className="absolute inset-0"
              style={
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
            </div>
          );
        })}
      </StageBox>
      </div>
    </section>
  );
}

/** title card before every lap: words rise out of a blur in the middle of the screen, then lift away */
function IntroCard({ time }: { time: number }) {
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
                {ch}
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

/** fixed 1200×620 stage, scaled to the space under the header */
function StageBox({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setK(Math.min(r.width / SW, r.height / SH));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={box}
      aria-hidden="true"
      className="relative z-[1] mx-gutter mb-[clamp(16px,4vh,40px)] mt-[clamp(16px,3vh,32px)] min-h-[240px] flex-1"
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: SW,
          height: SH,
          transform: `translate(-50%, -50%) scale(${k})`,
          visibility: k ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
});
const INK = "#1a1714";

/** neutral abstract "product shot" for the mock site (no image files); v picks the palette */
const VIS = [
  ["#efede9", "#d6d2ca"],
  ["#e9ecf0", "#c8ced7"],
  ["#f1ebe5", "#d9cbbf"],
];
/** static artwork: memoised, it re-rendered every animation frame with the stage */
const Visual = memo(function Visual({ v = 0 }: { v?: number }) {
  const [a, b] = VIS[v % VIS.length];
  const id = `vis${v % VIS.length}`;
  return (
    <svg
      viewBox="0 0 432 180"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${id}obj`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a3a3f" />
          <stop offset="1" stopColor="#0f0f12" />
        </linearGradient>
        <radialGradient id={`${id}ball`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#a9a39a" />
        </radialGradient>
      </defs>
      <rect width="432" height="180" fill={`url(#${id}bg)`} />
      <circle cx="110" cy="40" r="90" fill="#fff" opacity="0.35" />
      <ellipse cx="292" cy="156" rx="110" ry="14" fill="#000" opacity="0.1" />
      <g transform="rotate(-9 290 90)">
        <rect
          x="226"
          y="34"
          width="128"
          height="104"
          rx="24"
          fill={`url(#${id}obj)`}
        />
        <rect
          x="240"
          y="46"
          width="100"
          height="7"
          rx="3.5"
          fill="#fff"
          opacity="0.14"
        />
      </g>
      <circle cx="368" cy="126" r="24" fill={`url(#${id}ball)`} />
    </svg>
  );
});

/* ---------------- 1 · Design ---------------- */
const D = BUILD.design;
const AB = { x: 360, y: 20, w: 480, h: 560 };
/** element rects inside the artboard: assembled AND selected from the same numbers, so the selection always fits */
type Rc = { x: number; y: number; w: number; h: number };
const R = {
  img: { x: 24, y: 60, w: 432, h: 150 },
  title: { x: 24, y: 262, w: 420, h: 48 },
  btn: { x: 24, y: 360, w: 150, h: 46 },
  plans: { x: 24, y: 428, w: 432, h: 74 },
};
const PLAN_W = (R.plans.w - 20) / 3;
const SWATCHES = ["#e8492a", "#a78bfa", "#22d3ee", INK];
const TOOLS = [Cursor, FrameCorners, Square, TextT, PenNib, Hand];
/** two sidebars, exactly as tall as the artboard and 40px from it on both sides */
const LS = { x: 60, y: 20, w: 260, h: 560 };
const RS = { x: 880, y: 20, w: 260, h: 560 };
/** component tiles (left sidebar, bottom section): the sources the button and cards fly out of */
const tile = (i: number) => ({
  x: LS.x + 16 + (i % 2) * 118,
  y: LS.y + 438 + Math.floor(i / 2) * 48,
  w: 110,
  h: 40,
});
/** hairline between sidebar sections */
const Hr = ({ y }: { y: number }) => <i className="absolute inset-x-0 h-px bg-white/[0.07]" style={{ top: y }} />;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const label = "text-[11px] font-semibold uppercase tracking-[0.1em] text-grey";
const cell = "flex h-[34px] items-center gap-2 rounded-lg bg-white/[0.05] px-2.5 text-[13px] tabular-nums text-body";

const VI = "#a78bfa"; // designer
const CY = "#22d3ee"; // copywriter
const GR = "#34d399"; // client
/** swatch centres in the Fill panel */
const swatch = (i: number) => ({ x: RS.x + 32 + i * 42 + 4, y: RS.y + 478 + 6 });
/** where a hand holds an element it drags */
const grab = (r: Rc) => ({ x: r.x + r.w * 0.55, y: r.y + r.h * 0.62 });

function DesignStage({ s }: { s: number }) {
  // a team in one file: the designer, the copywriter and the client work at the same time, each with their own cursor and selection colour
  const pan = (i: number) => expo(seg(s, 0.02 + i * 0.04, 0.55 + i * 0.04));
  const frame = smooth(seg(s, 0.4, 0.95));
  const nav = expo(seg(s, 0.9, 1.2));
  const img = expo(seg(s, 1.02, 1.4));
  const badge = expo(seg(s, 1.25, 1.5));
  const signup = expo(seg(s, 1.3, 1.62));
  const title = seg(s, 1.46, 1.84);
  const sub = expo(seg(s, 1.78, 2.04));
  const btnFly = smooth(seg(s, 1.85, 2.12));
  const more = expo(seg(s, 2.0, 2.25));
  const pick = seg(s, 2.24, 2.5);
  const planFly = (k: number) => smooth(seg(s, 2.22 + k * 0.03, 2.5 + k * 0.03));
  const comment = expo(seg(s, 2.32, 2.6));
  const hover = Math.min(3, Math.floor(pick * 4));
  const btnColor = s >= 2.5 ? SWATCHES[3] : pick > 0 ? SWATCHES[hover] : "#c9c5bd";

  const at = (r: Rc): Rc => ({ x: AB.x + r.x, y: AB.y + r.y, w: r.w, h: r.h });
  const glide = (list: Rc[], times: number[]) => {
    let i = 0;
    while (i < times.length - 1 && s >= times[i + 1]) i++;
    const g = i ? smooth(seg(s, times[i], times[i] + 0.12)) : 1;
    const from = list[Math.max(0, i - 1)];
    const to = list[i];
    return { i, r: { x: lerp(from.x, to.x, g), y: lerp(from.y, to.y, g), w: lerp(from.w, to.w, g), h: lerp(from.h, to.h, g) } };
  };
  // designer: frame → photo → button
  const V = glide([{ x: AB.x, y: AB.y, w: AB.w * frame, h: AB.h * frame }, at(R.img), at(R.btn)], [0.4, 1.02, 2.02]);
  // copywriter: title → plans
  const C = glide([at(R.title), at(R.plans)], [1.46, 2.34]);
  const selBox = V.r;
  const tool = s < 1.0 ? 1 : s < 1.4 ? 2 : 0;
  const rowV = [0, 1, 5][V.i];
  const rowC = s < 1.46 ? -1 : [3, 6][C.i];
  const titleOn = s > 1.46 && s < 2.34;
  const fillHex = V.i === 2 ? btnColor : V.i === 1 ? "#efede9" : "#f4f0e8";

  // a component instance flies from its tile in the components panel to its place on the artboard
  const flyRect = (k: number, src: Rc, dst: Rc): Rc => ({
    x: lerp(src.x, dst.x, k),
    y: lerp(src.y, dst.y, k) - Math.sin(Math.PI * k) * 40,
    w: lerp(src.w, dst.w, k),
    h: lerp(src.h, dst.h, k),
  });
  const ghost = (k: number, src: Rc, dst: Rc, children: ReactNode, cls: string, bg?: string) => {
    if (!(k > 0 && k < 1)) return null;
    const r = flyRect(k, src, dst);
    return (
      <div
        className={`pointer-events-none absolute z-10 ${cls}`}
        style={{
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          background: bg,
          boxShadow: `0 ${20 * Math.sin(Math.PI * k)}px 40px -12px rgb(0 0 0 / 0.6)`,
          willChange: "left, top, width, height",
        }}
      >
        {children}
      </div>
    );
  };
  const planDst = (k: number): Rc => ({ x: AB.x + R.plans.x + k * (PLAN_W + 10), y: AB.y + R.plans.y, w: PLAN_W, h: R.plans.h });

  // cursors: paths between actions, pinned to whatever they are dragging
  const btnHand = grab(flyRect(btnFly, tile(0), at(R.btn)));
  const vPin =
    s > 0.4 && s < 0.95
      ? { x: AB.x + AB.w * frame, y: AB.y + AB.h * frame }
      : s > 1.85 && s < 2.12
        ? btnHand
        : s > 2.24 && s < 2.5
          ? { x: lerp(swatch(0).x, swatch(3).x, pick), y: swatch(0).y }
          : null;
  const vPos =
    vPin ??
    along(s, [
      [0, 300, 660],
      [0.38, AB.x, AB.y],
      [0.95, AB.x + AB.w, AB.y + AB.h],
      [1.04, AB.x + 250, AB.y + 150],
      [1.4, AB.x + 300, AB.y + 196],
      [1.8, grab(tile(0)).x, grab(tile(0)).y],
      [2.12, grab(at(R.btn)).x, grab(at(R.btn)).y],
      [2.24, swatch(0).x, swatch(0).y],
      [2.5, swatch(3).x, swatch(3).y],
      [3, swatch(3).x + 34, swatch(3).y - 22],
    ]);
  const cPin = s > 2.22 && s < 2.5 ? grab(flyRect(planFly(0), tile(1), planDst(0))) : null;
  const cPos =
    cPin ??
    along(s, [
      [0, 1250, 330],
      [1.08, 1250, 330],
      [1.44, AB.x + R.title.x + 6, AB.y + R.title.y + 26],
      [1.5, AB.x + R.title.x + 6, AB.y + R.title.y + 26],
      [1.84, AB.x + 210, AB.y + R.title.y + R.title.h + 46],
      [2.18, grab(tile(1)).x, grab(tile(1)).y],
      [2.22, grab(tile(1)).x, grab(tile(1)).y],
      [2.5, grab(planDst(0)).x, grab(planDst(0)).y],
      [3, grab(planDst(1)).x + 20, grab(planDst(1)).y - 46],
    ]);
  const pinAt = { x: AB.x + 318, y: AB.y + R.btn.y + 4 };
  const gPos = along(s, [
    [0, 760, 700],
    [1.92, 760, 700],
    [2.3, pinAt.x + 6, pinAt.y + 8],
    [2.36, pinAt.x + 6, pinAt.y + 8],
    [3, pinAt.x + 60, pinAt.y + 70],
  ]);

  return (
    <>
      {/* left sidebar: tools · pages · layers · components, one panel with hairline sections (Figma-like) */}
      <div className="tool overflow-hidden" style={{ ...box(LS.x, LS.y, LS.w, LS.h), ...fly(pan(0), -160, 0) }}>
        <div className="absolute inset-x-4" style={{ top: 16, ...fly(pan(1), -20, 0, 4) }}>
          <p className={`${label} flex h-5 items-center justify-between`}>
            {D.pagesLabel}
            <span className="flex -space-x-1.5">
              {[VI, CY, GR].map((c, i) => (
                <span
                  key={c}
                  className="grid size-5 place-items-center rounded-full border-2 border-[#0a0d15] text-[9px] font-bold normal-case tracking-normal text-[#05070d]"
                  style={{ background: c }}
                >
                  {D.team[i].name[0]}
                </span>
              ))}
            </span>
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 text-[13px]">
            {D.pages.map((p, i) => (
              <li key={p} className={`flex h-[26px] items-center justify-between rounded-md px-2 ${i === 0 ? "bg-white/[0.06] text-fg" : "text-body"}`}>
                {p}
                {i === 0 && <span className="text-[11px] tabular-nums text-grey">1440</span>}
              </li>
            ))}
          </ul>
        </div>
        <Hr y={138} />
        <div className="absolute inset-x-4" style={{ top: 152, ...fly(pan(2), -20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.layersLabel}</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {D.layers.map((l, i) => {
              const at0 = [0.4, 1.02, 1.3, 1.46, 1.78, 1.85, 2.22][i];
              const on = expo(seg(s, at0, at0 + 0.25));
              const Ic = [FrameCorners, ImageIcon, Rows, TextT, TextAlignLeft, Square, SquaresFour][i];
              return (
                <li
                  key={l}
                  className={`flex h-[28px] items-center gap-2 rounded-md px-2 text-[13px] ${i === rowV || i === rowC ? "text-fg" : "text-body"}`}
                  style={{
                    ...fly(on, -12, 0, 4),
                    paddingLeft: i ? 24 : 8,
                    background: i === rowV ? "rgb(167 139 250 / 0.2)" : i === rowC ? "rgb(34 211 238 / 0.16)" : undefined,
                    transition: "background-color .3s",
                  }}
                >
                  <Ic size={13} className="shrink-0 text-grey" />
                  {l}
                </li>
              );
            })}
          </ul>
        </div>
        <Hr y={400} />
        <p className={`${label} absolute inset-x-4 flex h-4 items-center`} style={{ top: 414, ...fly(pan(3), -20, 0, 4) }}>
          {D.compLabel}
        </p>
        {D.comps.map((c, i) => {
          const r = tile(i);
          const hot = i === 0 && btnFly > 0 && btnFly < 1 ? VI : i === 1 && planFly(0) > 0 && planFly(2) < 1 ? CY : null;
          return (
            <div
              key={c}
              className="absolute flex items-center gap-2.5 rounded-lg border bg-white/[0.04] px-2.5 transition-colors duration-300"
              style={{ ...box(r.x - LS.x, r.y - LS.y, r.w, r.h), ...fly(pan(3), -20, 0, 4), borderColor: hot ?? "transparent" }}
            >
              <span className="grid w-7 shrink-0 place-items-center">
                {i === 0 && <span className="h-2.5 w-7 rounded-full bg-white/70" />}
                {i === 1 && <span className="h-4 w-6 rounded bg-white/25" />}
                {i === 2 && <span className="h-2.5 w-7 rounded border border-white/40" />}
                {i === 3 && <span className="h-2.5 w-5 rounded-full bg-violet-soft/70" />}
              </span>
              <span className="text-[12px] text-body">{c}</span>
            </div>
          );
        })}
      </div>

      {/* floating toolbar: bottom centre of the canvas, as in Figma */}
      <div
        className="tool z-20 flex items-center gap-1 p-1.5"
        style={{ ...box(SW / 2 - 112, AB.y + AB.h - 52, 224, 44), ...fly(pan(1), 0, 40, 8), borderRadius: 14 }}
      >
        {TOOLS.map((Ic, i) => (
          <span key={i} className={`grid size-8 place-items-center rounded-lg transition-colors duration-300 ${i === tool ? "bg-violet text-white" : "text-grey"}`}>
            <Ic size={16} />
          </span>
        ))}
      </div>

      {/* right sidebar: properties · auto layout · text · fill · effects */}
      <div className="tool overflow-hidden" style={{ ...box(RS.x, RS.y, RS.w, RS.h), ...fly(pan(0), 160, 0) }}>
        <div className="absolute inset-x-4" style={{ top: 16, ...fly(pan(1), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.props}</p>
          <div className="mt-[6px] grid grid-cols-2 gap-2">
            {(
              [
                ["X", selBox.x - AB.x],
                ["Y", selBox.y - AB.y],
                ["W", selBox.w],
                ["H", selBox.h],
              ] as const
            ).map(([k, v]) => (
              <span key={k} className={cell}>
                <span className="text-grey">{k}</span> {Math.round(v)}
              </span>
            ))}
          </div>
        </div>
        <Hr y={128} />
        <div className="absolute inset-x-4" style={{ top: 142, ...fly(pan(1), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.layout}</p>
          <div className="mt-[6px] grid grid-cols-[auto_1fr_1fr] gap-2">
            <span className="flex h-[34px] items-center gap-0.5 rounded-lg bg-white/[0.05] px-1">
              <span className="grid size-6 place-items-center rounded-md bg-violet text-white">
                <ArrowDown size={12} weight="bold" />
              </span>
              <span className="grid size-6 place-items-center rounded-md text-grey">
                <ArrowRight size={12} weight="bold" />
              </span>
            </span>
            <span className={cell}>
              <ArrowsOutLineVertical size={13} className="text-grey" /> 24
            </span>
            <span className={cell}>
              <ArrowsOut size={13} className="text-grey" /> 24
            </span>
          </div>
        </div>
        <Hr y={212} />
        <div className="absolute inset-x-4" style={{ top: 226, ...fly(pan(2), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.text}</p>
          <div className="mt-[6px] flex flex-col gap-2 transition-opacity duration-300" style={{ opacity: titleOn ? 1 : 0.55 }}>
            <span className={`${cell} justify-between text-fg`}>
              {D.font} <CaretDown size={12} className="text-grey" />
            </span>
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <span className={`${cell} justify-between`}>
                {D.weight} <CaretDown size={12} className="text-grey" />
              </span>
              <span className={`${cell} ${titleOn ? "text-fg ring-1 ring-cyan/60" : ""}`}>40</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className={cell}>
                <TextAa size={13} className="text-grey" /> 100%
              </span>
              <span className={cell}>
                <span className="text-grey">|A|</span> −4.5%
              </span>
            </div>
          </div>
        </div>
        <Hr y={380} />
        <div className="absolute inset-x-4" style={{ top: 394, ...fly(pan(3), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.fill}</p>
          <div className={`${cell} mt-[6px] uppercase`}>
            <span className="size-4 rounded border border-white/20" style={{ background: fillHex, transition: "background-color .25s" }} />
            {fillHex}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            {SWATCHES.map((c, i) => {
              const on = pick > 0 && i === (s >= 2.5 ? 3 : hover);
              return (
                <span
                  key={c}
                  className="size-8 rounded-full border border-white/15"
                  style={{
                    background: c,
                    boxShadow: on ? `0 0 0 2px #0a0d15, 0 0 0 4px ${c === INK ? "#f5f7fa" : c}` : "none",
                    transform: on ? "scale(1.08)" : undefined,
                    transition: "transform .2s, box-shadow .2s",
                  }}
                />
              );
            })}
          </div>
        </div>
        <Hr y={508} />
        <div className="absolute inset-x-4 flex h-[34px] items-center justify-between" style={{ top: 516, ...fly(pan(3), 20, 0, 4) }}>
          <span className={label}>{D.effects}</span>
          <span className="flex items-center gap-2 text-[13px] text-body">
            <Drop size={13} className="text-grey" /> {D.shadow}
          </span>
        </div>
      </div>

      {/* artboard: the site assembling itself (children use the same rects as the selection) */}
      <div
        className="overflow-hidden rounded-md bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)]"
        style={{
          ...box(AB.x, AB.y, AB.w, AB.h),
          clipPath: `inset(0 ${(1 - frame) * 100}% ${(1 - frame) * 100}% 0)`,
        }}
      >
        <div
          className="absolute inset-x-6 top-5 flex items-center justify-between"
          style={fly(nav, 0, -12, 6)}
        >
          <span className="text-[17px] font-semibold tracking-[-0.03em]">
            {BUILD.brand}
          </span>
          <span className="flex items-center gap-4 text-[12px] font-medium text-[#5c564c]">
            {D.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span className="rounded-full bg-[#1a1714] px-3 py-1.5 text-[11px] font-semibold text-[#f4f0e8]">
              {D.login}
            </span>
          </span>
        </div>
        <div
          className="absolute overflow-hidden rounded-xl"
          style={{
            ...box(R.img.x, R.img.y, R.img.w, R.img.h),
            clipPath: `inset(${((1 - img) * 100).toFixed(2)}% 0 0 0 round 12px)`,
            opacity: Math.min(1, img * 2),
          }}
        >
          <div
            className="absolute inset-0"
            style={{ transform: `scale(${(1.12 - img * 0.12).toFixed(4)})` }}
          >
            <Visual />
          </div>
          <span
            className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#1a1714]"
            style={fly(badge, -10, 0, 4)}
          >
            {D.badge}
          </span>
        </div>
        {/* email signup bar floating over the visual */}
        <div
          className="absolute flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-[0_12px_30px_-12px_rgb(40_30_20/0.45)]"
          style={{
            ...box(R.img.x + 16, R.img.y + R.img.h - 24, R.img.w - 32, 48),
            ...fly(signup, 0, 18, 8),
          }}
        >
          <EnvelopeSimple size={16} className="text-[#7a7368]" />
          <span className="flex-1 text-[13px] text-[#9a9287]">{D.email}</span>
          <span className="flex h-full items-center rounded-xl bg-[#1a1714] px-4 text-[12px] font-semibold text-[#f4f0e8]">
            {D.join}
          </span>
        </div>
        <p
          className="absolute flex items-center whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]"
          style={box(R.title.x, R.title.y, R.title.w, R.title.h)}
        >
          <Typed
            text={D.title}
            k={title}
            caret={s > 1.46 && s < 1.9}
            color="#1a1714"
          />
        </p>
        <p
          className="absolute text-[15px] text-[#5c564c]"
          style={{
            ...box(R.title.x, R.title.y + R.title.h + 8, R.title.w),
            ...fly(sub, 0, 10, 6),
          }}
        >
          {D.sub}
        </p>
        {btnFly >= 1 && (
          <span
            className="absolute grid place-items-center whitespace-nowrap rounded-full text-[15px] font-semibold text-white"
            style={{
              ...box(R.btn.x, R.btn.y, R.btn.w, R.btn.h),
              background: btnColor,
              transition: "background-color .25s",
            }}
          >
            {D.button}
          </span>
        )}
        <span
          className="absolute flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold"
          style={{
            ...box(R.btn.x + R.btn.w + 22, R.btn.y, undefined, R.btn.h),
            ...fly(more, -12, 0, 5),
          }}
        >
          {D.more} <ArrowRight size={14} />
        </span>
        {D.plans.map((p, k) =>
          planFly(k) >= 1 ? (
            <div
              key={p.name}
              className="absolute flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
              style={box(
                R.plans.x + k * (PLAN_W + 10),
                R.plans.y,
                PLAN_W,
                R.plans.h,
              )}
            >
              <PlanBody i={k} />
            </div>
          ) : null,
        )}
      </div>

      {/* instances in flight */}
      {ghost(
        btnFly,
        tile(0),
        at(R.btn),
        <span className="grid h-full place-items-center whitespace-nowrap text-[15px] font-semibold text-white">
          {D.button}
        </span>,
        "overflow-hidden rounded-full",
        "#c9c5bd",
      )}
      {D.plans.map((p, k) => (
        <Fragment key={p.name}>
          {ghost(
            planFly(k),
            tile(1),
            planDst(k),
            <PlanBody i={k} />,
            "flex items-center gap-2.5 overflow-hidden rounded-xl bg-white p-2 text-[#1a1714]",
          )}
        </Fragment>
      ))}

      {/* selections in each person's colour */}
      {s > 0.4 && <Sel r={V.r} color={VI} size />}
      {s > 1.46 && <Sel r={C.r} color={CY} k={expo(seg(s, 1.46, 1.6))} />}
      {/* client comment */}
      <div className="absolute flex items-start gap-2" style={{ ...box(pinAt.x, pinAt.y), ...fly(comment, 0, 10, 6) }}>
        <span className="grid size-7 shrink-0 place-items-center rounded-full rounded-bl-none text-[12px] font-bold text-[#05070d]" style={{ background: GR }}>
          {D.team[2].name[0]}
        </span>
        <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-[12px] font-medium text-[#1a1714] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]">{D.comment}</span>
      </div>
      {/* the team */}
      <Mate x={vPos.x} y={vPos.y} color={VI} name={D.team[0].name} k={expo(seg(s, 0, 0.3))} down={(s > 0.4 && s < 0.95) || (s > 1.85 && s < 2.12) || (s > 2.46 && s < 2.54)} />
      <Mate x={cPos.x} y={cPos.y} color={CY} name={D.team[1].name} k={expo(seg(s, 1.08, 1.3))} down={(s > 1.44 && s < 1.5) || (s > 2.22 && s < 2.5)} />
      <Mate x={gPos.x} y={gPos.y} color={GR} name={D.team[2].name} k={expo(seg(s, 1.92, 2.12))} down={s > 2.3 && s < 2.36} />
    </>
  );
}

/** a selection box in one person's colour */
function Sel({ r, color, size = false, k = 1 }: { r: Rc; color: string; size?: boolean; k?: number }) {
  return (
    <div className="pointer-events-none absolute border-[1.5px]" style={{ ...box(r.x - 2, r.y - 2, r.w + 4, r.h + 4), borderColor: color, opacity: k }}>
      {[
        [-5, -5],
        [r.w - 1, -5],
        [-5, r.h - 1],
        [r.w - 1, r.h - 1],
      ].map(([x, y], i) => (
        <i key={i} className="absolute size-2.5 border-[1.5px] bg-white" style={{ left: x, top: y, borderColor: color }} />
      ))}
      {size && (
        <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#05070d]" style={{ background: color }}>
          {Math.round(r.w)} × {Math.round(r.h)}
        </span>
      )}
    </div>
  );
}

/** a teammate's cursor, Figma multiplayer style: coloured arrow + name tag; (x, y) is the tip */
function Mate({ x, y, color, name, down = false, k = 1 }: { x: number; y: number; color: string; name: string; down?: boolean; k?: number }) {
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: x, top: y, opacity: k }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="absolute -left-[4px] -top-[2px] [filter:drop-shadow(0_2px_4px_rgb(0_0_0/0.45))]"
        style={{ transformOrigin: "4px 2px", transform: `scale(${down ? 0.88 : 1})`, transition: "transform .12s" }}
      >
        <path d="M4 2v17.2l4.1-3.9 2.9 6.6 2.9-1.25-2.85-6.45h5.9z" fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-[14px] top-[20px] whitespace-nowrap rounded-md rounded-tl-none px-2 py-0.5 text-[11px] font-semibold text-[#05070d] shadow-[0_4px_12px_-4px_rgb(0_0_0/0.5)]" style={{ background: color }}>
        {name}
      </span>
    </div>
  );
}

const PlanBody = memo(function PlanBody({ i }: { i: number }) {
  const p = D.plans[i];
  return (
    <>
      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
        <Visual v={i} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight">
          {p.name}
        </span>
        <span className="mt-1 block text-[12px] text-[#7a7368]">{p.price}</span>
      </span>
    </>
  );
});

/* ---------------- 2 · Code ---------------- */
const C = BUILD.code;
const KW = "#c792ea";
const TG = "#7fdbca";
const AT = "#addb67";
const STR = "#ecc48d";
const PU = "#8b919c";
const TX = "#d6deeb";
type Tok = [string, string];
const LINES: Tok[][] = [
  [
    ["export default function ", KW],
    ["Home", TG],
    ["() {", PU],
  ],
  [
    ["  return ", KW],
    ["(", PU],
  ],
  [
    ["    <", PU],
    ["Header", TG],
    [" logo", AT],
    ["=", PU],
    ['"Your product"', STR],
    [" />", PU],
  ],
  [
    ["    <", PU],
    ["Hero", TG],
    [">", PU],
  ],
  [
    ["      <", PU],
    ["h1", TG],
    [">", PU],
    [C.h1, TX],
    ["</", PU],
    ["h1", TG],
    [">", PU],
  ],
  [
    ["      <", PU],
    ["p", TG],
    [">", PU],
    [C.p, TX],
    ["</", PU],
    ["p", TG],
    [">", PU],
  ],
  [
    ["      <", PU],
    ["Button", TG],
    [">", PU],
    [C.btn, TX],
    ["</", PU],
    ["Button", TG],
    [">", PU],
  ],
  [
    ["      <", PU],
    ["Signup", TG],
    [" placeholder", AT],
    ["=", PU],
    ['"email"', STR],
    [" />", PU],
  ],
  [
    ["    </", PU],
    ["Hero", TG],
    [">", PU],
  ],
  [
    ["    <", PU],
    ["Plans", TG],
    [" items", AT],
    ["=", PU],
    ["{", PU],
    ["plans", TX],
    ["}", PU],
    [" />", PU],
  ],
  [["  );", PU]],
  [["}", PU]],
];
const LEN = LINES.map((l) => l.reduce((a, [x]) => a + x.length, 0));
const START = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
const CHARS = LEN.reduce((a, b) => a + b, 0);

function CodeStage({ s }: { s: number }) {
  const chars = Math.round(seg(s, 0.3, 1.95) * CHARS);
  const lineK = (i: number) =>
    Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const textOf = (line: number, tok: number) => {
    const before = LINES[line]
      .slice(0, tok)
      .reduce((a, [x]) => a + x.length, 0);
    return typed(
      LINES[line][tok][0],
      (chars - START[line] - before) / LINES[line][tok][0].length,
    );
  };
  const term = expo(seg(s, 1.9, 2.2));

  return (
    <>
      {/* code written straight on the background */}
      <div
        className="border-l-2 border-[#5aa2ff]/40 pl-6 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[18px] leading-[34px]"
        style={box(40, 20, 640)}
      >
        {LINES.map((line, i) => {
          let left = chars - START[i];
          const k = ease(Math.min(1, lineK(i) * 4));
          return (
            <div
              key={i}
              className="flex"
              style={{ opacity: chars > START[i] ? 1 : 0.15 }}
            >
              <span className="w-9 shrink-0 pr-4 text-right text-faint">
                {i + 1}
              </span>
              <span
                className="whitespace-pre"
                style={
                  // small: the typed line only fades in (no per-line blur)
                  chars > START[i] && k < 1
                    ? { opacity: 0.35 + 0.65 * k }
                    : undefined
                }
              >
                {line.map(([x, c], j) => {
                  const show = x.slice(
                    0,
                    Math.max(0, Math.min(x.length, left)),
                  );
                  left -= x.length;
                  return (
                    <span key={j} style={{ color: c }}>
                      {show}
                    </span>
                  );
                })}
                {i === cur && <Caret color="#5aa2ff" />}
              </span>
            </div>
          );
        })}
      </div>
      {/* terminal */}
      <div
        className="tool flex items-center gap-4 px-5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[15px]"
        style={{ ...box(40, 520, 640, 60), ...fly(term, 0, 40, 12) }}
      >
        <span className="text-green">~/your-product $</span>
        <span className="text-body">{typed(C.cmd, seg(s, 2.02, 2.2))}</span>
        <span
          className="ml-auto flex items-center gap-2 text-green"
          style={fly(expo(seg(s, 2.22, 2.45)), 20, 0, 8)}
        >
          <CheckCircle size={17} weight="fill" /> {C.ok}
        </span>
      </div>
      {/* live preview building as the code is written */}
      <div
        className="overflow-hidden rounded-xl bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]"
        style={{
          ...box(730, 20, 430, 560),
          ...fly(expo(seg(s, 0.06, 0.6)), 220, 0, 18),
        }}
      >
        <div className="flex h-8 items-center gap-1.5 bg-[#e6e0d4] px-3">
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <span className="ml-2 rounded bg-white/70 px-2 text-[11px] text-[#5c564c]">
            localhost:3000
          </span>
        </div>
        <div className="p-5">
          <div
            className="flex items-center justify-between"
            style={fly(expo(lineK(2)), 0, -16, 8)}
          >
            <span className="text-[15px] font-semibold tracking-[-0.03em]">
              {BUILD.brand}
            </span>
            <span className="flex items-center gap-3 text-[10px] font-medium text-[#5c564c]">
              {BUILD.design.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
              <span className="rounded-full bg-[#1a1714] px-2 py-1 text-[9px] font-semibold text-[#f4f0e8]">
                {BUILD.design.login}
              </span>
            </span>
          </div>
          <div
            className="relative mt-5 h-[104px] overflow-hidden rounded-xl"
            style={fly(expo(lineK(3)), 0, 16, 10)}
          >
            <Visual />
          </div>
          <div className="pt-3">
            <p className="min-h-[28px] text-[26px] font-semibold leading-none tracking-[-0.045em]">
              {textOf(4, 3)}
            </p>
            <p className="mt-1.5 min-h-[18px] text-[13px] text-[#5c564c]">
              {textOf(5, 3)}
            </p>
            <span
              className="mt-3 inline-grid h-9 min-w-[110px] place-items-center rounded-full bg-[#1a1714] px-5 text-[12px] font-semibold text-white"
              style={fly(expo(Math.min(1, lineK(6) * 2.5)), 0, 12, 8)}
            >
              {textOf(6, 3) || " "}
            </span>
          </div>
          <div
            className="mt-3 flex items-center gap-2 rounded-xl bg-white p-1 pl-3 shadow-[0_6px_16px_-10px_rgb(40_30_20/0.5)]"
            style={fly(expo(Math.min(1, lineK(7) * 2)), 0, 14, 8)}
          >
            <EnvelopeSimple size={13} className="text-[#7a7368]" />
            <span className="flex-1 text-[11px] text-[#9a9287]">
              {BUILD.design.email}
            </span>
            <span className="grid h-8 place-items-center rounded-lg bg-[#1a1714] px-2.5 text-[11px] font-semibold text-[#f4f0e8]">
              {BUILD.design.join}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                className="rounded-lg bg-white p-2"
                style={fly(
                  expo(seg(lineK(9), k * 0.2, k * 0.2 + 0.6)),
                  0,
                  30,
                  10,
                )}
              >
                <div className="relative h-16 overflow-hidden rounded-md">
                  <Visual v={k} />
                </div>
                <p className="mt-2 truncate text-[11px] font-semibold">
                  {BUILD.design.plans[k].name}
                </p>
                <p className="text-[10px] text-[#7a7368]">
                  {BUILD.design.plans[k].price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- 3 · CMS ---------------- */
const M = BUILD.cms;

/** one CMS input: label row, field with focus ring, optional hint under it */
function Field({
  label,
  right,
  focus,
  children,
  hint,
  className = "",
}: {
  label: string;
  right?: ReactNode;
  focus: number;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex items-center justify-between text-[12px] font-medium text-grey">
        {label}
        {right}
      </p>
      <div
        className="mt-1.5 flex h-10 items-center rounded-xl border bg-white/[0.035] text-[15px] text-fg"
        style={{
          borderColor: `color-mix(in srgb, #22d3ee ${(focus * 100).toFixed(0)}%, rgb(255 255 255 / 0.12))`,
          boxShadow: `0 0 0 ${(focus * 4).toFixed(2)}px rgb(34 211 238 / 0.12)`,
        }}
      >
        {children}
      </div>
      {hint}
    </div>
  );
}

/** text swap: the old label rolls up and out, the new one rolls in from below (no overlapping cross-fade) */
function Swap({ k, a, b }: { k: number; a: ReactNode; b: ReactNode }) {
  return (
    <span className="grid overflow-hidden">
      <span
        className="col-start-1 row-start-1 text-center"
        style={{
          transform: `translateY(${(-k * 110).toFixed(1)}%)`,
          opacity: 1 - k,
        }}
      >
        {a}
      </span>
      <span
        className="col-start-1 row-start-1 flex justify-center"
        style={{
          transform: `translateY(${((1 - k) * 110).toFixed(1)}%)`,
          opacity: k,
        }}
      >
        {b}
      </span>
    </span>
  );
}

function CmsStage({ s }: { s: number }) {
  const focusK = (a: number, b: number) =>
    smooth(seg(s, a, a + 0.08)) * (1 - smooth(seg(s, b, b + 0.08)));
  const fName = focusK(0.38, 0.98);
  const fPrice = focusK(0.98, 1.28);
  const fDesc = focusK(1.72, 2.05);
  const nameK = seg(s, 0.45, 0.92);
  const name = typed(M.nameVal, nameK);
  const priceK = seg(s, 1.03, 1.24);
  const up = seg(s, 1.3, 1.68);
  const photoK = expo(seg(s, 1.66, 1.9));
  const descK = seg(s, 1.76, 2.02);
  const stockK = expo(seg(s, 2.05, 2.28));
  const pressed = s > 2.2 && s < 2.3;
  const pubK = expo(seg(s, 2.3, 2.55));
  const pub = s > 2.3;
  const row = (i: number) =>
    fly(expo(seg(s, 0.1 + i * 0.045, 0.6 + i * 0.045)), -40, 0, 8);
  const LOG_AT = [1.0, 1.3, 1.7, 2.32];

  return (
    <>
      {/* the product form */}
      <div
        className="tool flex flex-col gap-2.5 p-5"
        style={{
          ...box(40, 20, 540, 560),
          ...fly(expo(seg(s, 0.02, 0.55)), -200, 0, 14),
        }}
      >
        <div className="flex items-start justify-between" style={row(0)}>
          <div>
            <p className="text-[12px] text-grey">{M.crumb}</p>
            <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-fg">
              {M.form}
            </p>
          </div>
          <span
            className="mt-1 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: `color-mix(in srgb, rgb(52 211 153 / 0.15) ${(pubK * 100).toFixed(0)}%, rgb(255 255 255 / 0.08))`,
              color: `color-mix(in srgb, #34d399 ${(pubK * 100).toFixed(0)}%, #c4cad4)`,
            }}
          >
            <Swap
              k={pubK}
              a={M.draft}
              b={
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green" />{" "}
                  {M.published}
                </span>
              }
            />
          </span>
        </div>

        <div style={row(1)}>
          <Field
            label={M.name}
            focus={fName}
            right={
              <span className="tabular-nums text-faint">
                {Array.from(name).length}/{M.max}
              </span>
            }
          >
            <span className="px-4">
              <Typed
                text={M.nameVal}
                k={nameK}
                caret={fName > 0.5}
                color="#22d3ee"
              />
            </span>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3" style={row(2)}>
          <Field label={M.price} focus={fPrice}>
            <span className="flex-1 px-4 tabular-nums">
              <Typed
                text={M.priceVal}
                k={priceK}
                caret={fPrice > 0.5}
                color="#22d3ee"
              />
            </span>
            <span className="grid h-full w-11 place-items-center border-l border-white/10 text-grey">
              {M.cur}
            </span>
          </Field>
          <Field label={M.cat} focus={0}>
            <span className="flex flex-1 items-center justify-between px-4">
              {M.catVal} <CaretDown size={13} className="text-grey" />
            </span>
          </Field>
        </div>

        {/* photo dropzone */}
        <div style={row(3)}>
          <p className="text-[12px] font-medium text-grey">{M.photo}</p>
          <div
            className="mt-1.5 flex h-[62px] items-center gap-3.5 rounded-xl border border-dashed px-3"
            style={{
              borderColor:
                up > 0 && up < 1
                  ? "rgb(34 211 238 / 0.6)"
                  : "rgb(255 255 255 / 0.16)",
              transition: "border-color .3s",
            }}
          >
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06]">
              <UploadSimple size={18} className="text-grey" />
              {/* a clean "photo" thumbnail: soft gradient + picture glyph (a cropped render looked chopped at this size) */}
              <span
                className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#f1eee8] to-[#cdc6ba] text-[#1a1714]"
                style={{
                  opacity: Math.max(up > 0 ? 0.35 : 0, photoK),
                  transform: `scale(${(1.15 - photoK * 0.15).toFixed(4)})`,
                }}
              >
                <ImageIcon size={22} weight="duotone" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              {up <= 0 ? (
                <p className="text-[13px] text-grey">{M.drop}</p>
              ) : (
                <>
                  <p className="flex items-center justify-between text-[13px] text-body">
                    <span className="flex items-center gap-1.5">
                      {photoK > 0.5 && (
                        <CheckCircle
                          size={14}
                          weight="fill"
                          className="text-green"
                        />
                      )}
                      {M.file}
                    </span>
                    <span className="tabular-nums text-grey">
                      {photoK > 0.5 ? M.size : `${Math.round(up * 100)}%`}
                    </span>
                  </p>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                      className="block h-full origin-left rounded-full bg-cyan"
                      style={{
                        transform: `scaleX(${up})`,
                        opacity: 1 - photoK * 0.6,
                      }}
                    />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* description with a small editor toolbar */}
        <div
          className="rounded-xl border bg-white/[0.035]"
          style={{
            ...row(4),
            borderColor: `color-mix(in srgb, #22d3ee ${(fDesc * 100).toFixed(0)}%, rgb(255 255 255 / 0.12))`,
            boxShadow: `0 0 0 ${(fDesc * 4).toFixed(2)}px rgb(34 211 238 / 0.12)`,
          }}
        >
          <div className="flex items-center gap-1 border-b border-white/[0.08] px-2 py-1.5 text-grey">
            {[TextB, TextItalic, LinkSimple, ListBullets].map((Ic, i) => (
              <span
                key={i}
                className="grid size-7 place-items-center rounded-md"
              >
                <Ic size={14} />
              </span>
            ))}
          </div>
          <p className="h-[36px] px-4 py-1.5 text-[14px] text-body">
            <Typed
              text={M.descVal}
              k={descK}
              caret={fDesc > 0.5}
              color="#22d3ee"
            />
          </p>
        </div>

        {/* availability */}
        <div
          className="flex h-12 items-center justify-between rounded-xl bg-white/[0.035] px-4"
          style={row(5)}
        >
          <span className="text-[14px] text-fg">{M.stock}</span>
          <span
            className="relative h-7 w-12 rounded-full"
            style={{
              background: `color-mix(in srgb, #34d399 ${(stockK * 100).toFixed(0)}%, rgb(255 255 255 / 0.15))`,
            }}
          >
            <span
              className="absolute left-1 top-1 size-5 rounded-full bg-white shadow"
              style={{ transform: `translateX(${(stockK * 20).toFixed(1)}px)` }}
            />
          </span>
        </div>

        {/* actions */}
        <div
          className="mt-auto flex items-center justify-end gap-3"
          style={row(6)}
        >
          <span className="rounded-full border border-white/15 px-5 py-3 text-[14px] font-semibold text-body">
            {M.save}
          </span>
          <span
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[14px] font-semibold text-white"
            style={{
              background: `color-mix(in srgb, #1f9d68 ${(pubK * 100).toFixed(0)}%, #3d8bff)`,
              transform: `scale(${pressed ? 0.95 : 1})`,
              transition: "transform .15s",
            }}
          >
            <Swap
              k={pubK}
              a={M.publish}
              b={
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" /> {M.published}
                </span>
              }
            />
          </span>
        </div>
      </div>

      {/* toast */}
      <div
        className="tool flex items-center gap-2 px-4 py-2.5 text-[14px] text-green"
        style={{
          ...box(604, 20),
          ...fly(expo(seg(s, 2.36, 2.66)), 0, -24, 10),
        }}
      >
        <CheckCircle size={16} weight="fill" /> {M.toast}
      </div>
      {/* change history: every edit is saved */}
      <div
        className="tool p-4"
        style={{
          ...box(604, 100, 200),
          ...fly(expo(seg(s, 0.2, 0.75)), 0, 30, 12),
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">
          {M.logLabel}
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {M.log.map((l, i) => {
            const k = expo(seg(s, LOG_AT[i], LOG_AT[i] + 0.3));
            return (
              <li
                key={l}
                className="flex items-start gap-2.5"
                style={fly(k, 0, 10, 5)}
              >
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${i === 3 ? "bg-green" : "bg-cyan"}`}
                />
                <span className="leading-tight">
                  <span className="block text-[13px] text-fg">{l}</span>
                  <span className="block text-[11px] text-grey">{M.now}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* iPhone: the live product page updates */}
      <IPhone
        style={{
          ...box(836, 20, 286, 560),
          ...fly(expo(seg(s, 0.04, 0.6)), 220, 0, 16),
        }}
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-[15px] font-semibold">{BUILD.brand}</span>
          <span
            className="flex items-center gap-1.5 text-[11px] font-semibold"
            style={{
              color: `color-mix(in srgb, #1f8f5f ${(pubK * 100).toFixed(0)}%, rgb(0 0 0 / 0.3))`,
            }}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {M.live}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative grid h-36 place-items-center overflow-hidden bg-[#ebe8e2]">
            <ImageIcon size={30} className="text-black/20" />
            <div
              className="absolute inset-0"
              style={{
                opacity: photoK,
                transform: `scale(${(1.12 - photoK * 0.12).toFixed(4)})`,
              }}
            >
              <Visual />
            </div>
            <span className="absolute left-3 top-3 flex gap-1.5">
              {M.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#1a1714]"
                >
                  {t}
                </span>
              ))}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="min-h-[22px] text-[18px] font-semibold leading-tight">
                {name || " "}
              </p>
              <span
                className="rounded-full bg-[#1f8f5f]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1f8f5f]"
                style={fly(stockK, 10, 0, 6)}
              >
                {M.stock}
              </span>
            </div>
            <p className="mt-1 text-[18px] font-semibold tabular-nums">
              {typed(M.priceVal, priceK)}
              {priceK > 0 && ` ${M.cur}`}
            </p>
            <p className="mt-2 min-h-[34px] text-[12px] leading-snug text-[#5c564c]">
              {typed(M.descVal, descK)}
            </p>
            <span className="mt-3 grid h-10 place-items-center rounded-full bg-[#1a1714] text-[13px] font-semibold text-white">
              {M.buy}
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 opacity-70">
          <div className="relative h-16 overflow-hidden rounded-xl">
            <Visual v={1} />
          </div>
          <div className="relative h-16 overflow-hidden rounded-xl">
            <Visual v={2} />
          </div>
        </div>
      </IPhone>
    </>
  );
}

/** iPhone-style device: titanium frame, side buttons, Dynamic Island, status bar, home indicator */
function IPhone({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div style={style}>
      <PhoneButtons />
      <div className="relative h-full rounded-[54px] bg-[linear-gradient(145deg,#4a4e57,#1d1f24_35%,#2b2e35_70%,#121317)] p-[3px] shadow-[0_50px_100px_-30px_rgb(0_0_0/0.95)]">
        <div className="relative h-full rounded-[51px] bg-black p-[9px]">
          <div className="relative h-full overflow-hidden rounded-[43px] bg-[#f4f0e8] text-[#1a1714]">
            <PhoneStatus />
            <div className="px-4 pt-2">{children}</div>
            {/* home indicator */}
            <i className="absolute bottom-2 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-[#1a1714]/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** iPhone side buttons: static, memoised */
const PhoneButtons = memo(function PhoneButtons() {
  return (
    <>
      <i className="absolute -left-[3px] top-[108px] h-7 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[156px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[216px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -right-[3px] top-[172px] h-[72px] w-[3px] rounded-r bg-[#3a3d44]" />
    </>
  );
});

/** iPhone status bar + Dynamic Island: static, memoised */
const PhoneStatus = memo(function PhoneStatus() {
  return (
    <>
            {/* status bar */}
            <div className="flex h-[46px] items-center justify-between px-7 pt-1 text-[13px] font-semibold">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="flex items-end gap-[2px]">
                  {[4, 6, 8, 10].map((h) => (
                    <i
                      key={h}
                      className="w-[3px] rounded-sm bg-[#1a1714]"
                      style={{ height: h }}
                    />
                  ))}
                </span>
                <span className="relative h-[11px] w-[22px] rounded-[3px] border border-[#1a1714]/50 p-[1.5px]">
                  <i className="block h-full w-4/5 rounded-[1.5px] bg-[#1a1714]" />
                </span>
              </span>
            </div>
            {/* Dynamic Island */}
            <i className="absolute left-1/2 top-[11px] h-[30px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
    </>
  );
});

/* ---------------- 4 · Launch ---------------- */
const L = BUILD.launch;
const BR = { x: 540, y: 20, w: 600, h: 560 };
const PIECES = [
  { x: 0, y: 40, w: 600, h: 50, dx: -420, dy: -120, c: "#e6e0d4" },
  { x: 24, y: 112, w: 552, h: 236, dx: 460, dy: -80, c: "#efe9de" },
  { x: 24, y: 364, w: 170, h: 172, dx: -480, dy: 160, c: "#efe9de" },
  { x: 215, y: 364, w: 170, h: 172, dx: 0, dy: 320, c: "#efe9de" },
  { x: 406, y: 364, w: 170, h: 172, dx: 480, dy: 160, c: "#efe9de" },
];
/** launch checklist: when each item finishes (beats), its colour and icon */
const DONE = [1.05, 1.4, 1.75, 2.1];
/** the checklist spans exactly the browser's height: 16px header + 20px gap + 4 rows of 120 with 14px gaps = 558 */
const ROW_H = 120;
const ROW_Y = BR.y + 36;
const CHECK = [
  { color: "#5aa2ff", icon: ShieldCheck },
  { color: "#a78bfa", icon: ChartLineUp },
  { color: "#22d3ee", icon: GraduationCap },
  { color: "#34d399", icon: ChatCircleDots },
];

function LaunchStage({ s }: { s: number }) {
  const shell = expo(seg(s, 0.03, 0.55));
  const url = typed(L.url, seg(s, 1.25, 1.65));
  const deploy = ease(seg(s, 1.6, 2.0));
  const sweep = seg(s, 2.0, 2.45);
  const online = expo(seg(s, 2.0, 2.35));
  const lift = ease(seg(s, 2.0, 2.4));
  return (
    <>
      {/* browser assembling */}
      <div
        className="overflow-hidden rounded-2xl border bg-[#f4f0e8]"
        style={{
          ...box(BR.x, BR.y, BR.w, BR.h),
          ...fly(
            shell,
            0,
            60,
            18,
            shell < 1 ? `scale(${0.9 + shell * 0.1})` : "",
          ),
          borderColor: `rgb(52 211 153 / ${0.15 + lift * 0.45})`,
          boxShadow: "0 50px 110px -30px rgb(0 0 0 / 0.95)",
        }}
      >
        <div className="flex h-10 items-center gap-2 bg-[#e6e0d4] px-4">
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <span className="ml-4 flex h-6 min-w-[220px] items-center gap-1.5 rounded-md bg-white/80 px-3 text-[13px] text-[#3f3a33]">
            <Lock
              size={12}
              weight="fill"
              className={s > 1.65 ? "text-[#1f8f5f]" : "text-black/25"}
            />
            {url}
            <Caret on={s > 1.25 && s < 1.7} color="#1a1714" />
          </span>
          {/* live status: a round ping on the dot, the pill itself stays still */}
          <span
            className="ml-auto flex items-center gap-2 rounded-full bg-[#1f8f5f]/12 px-3 py-1 text-[12px] font-semibold text-[#1f8f5f]"
            style={fly(online, 12, 0, 6)}
          >
            <span className="relative grid size-2 place-items-center">
              {online > 0.5 && <span className="absolute inset-0 animate-ping rounded-full bg-[#1f8f5f]/60" />}
              <span className="relative size-2 rounded-full bg-[#1f8f5f]" />
            </span>
            {L.online}
          </span>
        </div>
        {/* deploy progress under the address bar */}
        <span
          className="absolute left-0 top-10 z-[2] h-[3px] w-full origin-left bg-gradient-to-r from-[#5aa2ff] to-[#34d399]"
          style={{
            transform: `scaleX(${deploy})`,
            opacity: s < 2.4 ? 1 : 1 - seg(s, 2.4, 2.6),
          }}
        />
        {/* light sweep once it is live */}
        {sweep > 0 && sweep < 1 && (
          <span
            className="pointer-events-none absolute inset-y-0 z-[3] w-40 -skew-x-12"
            style={{
              left: `${-30 + sweep * 130}%`,
              // soft edges come from the gradient itself (was a blur(6px) filter on a moving layer)
              background:
                "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12) 25%, rgb(255 255 255 / 0.5) 50%, rgb(255 255 255 / 0.12) 75%, transparent)",
            }}
          />
        )}
        {PIECES.map((p, i) => {
          const k = expo(seg(s, 0.3 + i * 0.1, 0.95 + i * 0.1));
          return (
            <div
              key={i}
              className="absolute rounded-xl"
              style={{
                left: p.x,
                top: p.y,
                width: p.w,
                height: p.h,
                background: p.c,
                borderRadius: i === 0 ? 0 : 12,
                ...fly(
                  k,
                  p.dx,
                  p.dy,
                  22,
                  `rotate(${((1 - k) * (i % 2 ? 10 : -10)).toFixed(1)}deg)`,
                ),
              }}
            >
              {i === 0 && (
                <div className="flex h-full items-center justify-between px-6 text-[#1a1714]">
                  <span className="text-[18px] font-semibold tracking-[-0.03em]">
                    {BUILD.brand}
                  </span>
                  <span className="flex gap-4 text-[12px] font-medium text-[#5c564c]">
                    {BUILD.design.nav.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                </div>
              )}
              {i === 1 && (
                <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl p-7 text-[#1a1714]">
                  <div className="absolute inset-y-3 right-3 w-[270px] overflow-hidden rounded-lg">
                    <Visual />
                  </div>
                  <p className="relative text-[30px] font-semibold leading-none tracking-[-0.045em]">
                    {BUILD.design.title}
                  </p>
                  <p className="relative mt-2.5 text-[13px] text-[#5c564c]">
                    {BUILD.design.sub}
                  </p>
                  <span className="relative mt-5 inline-grid h-10 self-start place-items-center rounded-full bg-[#1a1714] px-5 text-[13px] font-semibold text-white">
                    {BUILD.design.button}
                  </span>
                </div>
              )}
              {i >= 2 && (
                <div className="flex h-full flex-col p-3">
                  <div className="relative h-[106px] shrink-0 overflow-hidden rounded-lg">
                    <Visual v={i - 2} />
                  </div>
                  <p className="mt-2.5 truncate text-[12px] font-semibold leading-tight text-[#1a1714]">
                    {BUILD.design.plans[i - 2].name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#7a7368]">
                    {BUILD.design.plans[i - 2].price}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* launch checklist: every item has its own icon and its own little motion */}
      <div
        className="flex items-center justify-between"
        style={{ ...box(40, BR.y, 430, 16), ...fly(expo(seg(s, 0.02, 0.5)), -40, 0, 8) }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{L.listLabel}</span>
        <span className="text-[13px] font-semibold tabular-nums text-fg">
          {DONE.filter((d) => s >= d).length}/{L.items.length}
        </span>
      </div>
      {L.items.map((it, i) => {
        const work = seg(s, DONE[i] - 0.5, DONE[i]);
        const done = expo(seg(s, DONE[i], DONE[i] + 0.3));
        const c = CHECK[i].color;
        const Ic = CHECK[i].icon;
        return (
          <div
            key={it.t}
            className="tool flex items-center gap-4 px-4"
            style={{
              ...box(40, ROW_Y + i * (ROW_H + 14), 430, ROW_H),
              ...fly(expo(seg(s, 0.06 + i * 0.07, 0.62 + i * 0.07)), -80, 0, 12),
            }}
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl"
              style={{
                background: `color-mix(in srgb, ${c} ${(12 + done * 10).toFixed(0)}%, transparent)`,
                color: c,
                transform: `scale(${(1 + Math.sin(Math.PI * done) * 0.12).toFixed(3)})`,
              }}
            >
              <Ic size={22} weight={done > 0.5 ? "fill" : "regular"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold leading-tight text-fg">{it.t}</p>
              <p className="mt-1 truncate text-[13px] leading-tight text-grey">{it.d}</p>
              {/* the item's own motion */}
              <div className="mt-2 flex h-3 items-center">
                {i === 0 && (
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: c, opacity: work > 0 ? 1 : 0 }}
                  >
                    <Lock size={11} weight="fill" /> {typed("https://", Math.min(1, work * 1.4))}
                  </span>
                )}
                {i === 1 && (
                  <svg
                    viewBox="0 0 120 12"
                    width="120"
                    height="12"
                    style={{ clipPath: `inset(0 ${((1 - work) * 100).toFixed(1)}% 0 0)` }}
                  >
                    <polyline
                      points="1,10 16,8 30,9 44,5 58,7 72,3 86,5 100,2 119,1"
                      fill="none"
                      stroke={c}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {i === 2 && (
                  <span className="block h-1.5 w-[160px] overflow-hidden rounded-full bg-white/[0.08]">
                    <span className="block h-full origin-left rounded-full" style={{ background: c, transform: `scaleX(${work})` }} />
                  </span>
                )}
                {i === 3 && (
                  <span className="flex items-center gap-1" style={{ opacity: work > 0 ? 1 : 0 }}>
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 rounded-full"
                        style={{
                          background: c,
                          transform: `translateY(${(done > 0.5 ? 0 : Math.sin(s * 18 - d * 1.2) * 2).toFixed(2)}px)`,
                          opacity: done > 0.5 ? 1 : 0.5 + 0.5 * Math.abs(Math.sin(s * 9 - d)),
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
            {/* status: progress ring, then a check */}
            <span className="relative grid size-8 shrink-0 place-items-center">
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${c} ${(work * 360).toFixed(1)}deg, rgb(255 255 255 / 0.1) 0deg)`,
                  WebkitMask: "radial-gradient(circle, transparent 58%, #000 60%)",
                  mask: "radial-gradient(circle, transparent 58%, #000 60%)",
                  opacity: 1 - done,
                }}
              />
              <span
                className="absolute inset-0 grid place-items-center rounded-full bg-green text-[#05070d]"
                style={{ transform: `scale(${done.toFixed(3)})`, opacity: done }}
              >
                <Check size={16} weight="bold" />
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
}
