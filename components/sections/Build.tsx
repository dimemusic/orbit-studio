"use client";

import { ArrowRight, CalendarBlank, CheckCircle, Cursor, FrameCorners, Hand, Image as ImageIcon, Lock, MagnifyingGlass, MapPin, PenNib, Square, TextT, UploadSimple, Users } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BUILD } from "@/lib/content";
import { homeNum } from "../home";
import { Eyebrow } from "../ui/Bits";
import { along, Caret, ease, expo, Pointer, seg, smooth, Typed, typed } from "../process/util";

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
const STAGE_START = STAGE_SEC.map((_, i) => STAGE_SEC.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = STAGE_SEC.reduce((a, b) => a + b, 0);
const stageAt = (t: number) => {
  let i = 0;
  while (i < STAGE_SEC.length - 1 && t >= STAGE_START[i + 1]) i++;
  return i;
};
const SW = 1200;
const SH = 620;

/** motion-blur style for an element that flies in: k = 0 (start) → 1 (settled) */
const fly = (k: number, dx = 0, dy = 0, px = 14, extra = ""): CSSProperties => ({
  transform: `translate3d(${((1 - k) * dx).toFixed(1)}px, ${((1 - k) * dy).toFixed(1)}px, 0) ${extra}`,
  filter: k < 1 ? `blur(${((1 - k) * px).toFixed(2)}px)` : undefined,
  opacity: Math.min(1, k * 1.6),
  willChange: k < 1 ? "transform, filter, opacity" : undefined,
});

export function Build() {
  const ref = useRef<HTMLElement>(null);
  const [t, setT] = useState(0);

  // play once when the section is in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(TOTAL);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const v = Math.min(TOTAL, (now - start) / 1000);
      setT(v);
      if (v < TOTAL) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const cur = stageAt(t);
  const st = BUILD.stages[cur];
  const gridH = ease(seg(t, 0, 0.7));
  const gridV = ease(seg(t, 0.15, 0.85));

  return (
    <section ref={ref} id="process" aria-labelledby="build-title" className="snap-section relative flex min-h-[100dvh] w-full flex-col overflow-hidden md:h-[100dvh]">
      {/* grid drawn on the page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 80%, transparent), linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 80%, transparent), linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)",
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

      <header className="relative z-[1] flex flex-col items-center px-gutter pt-[clamp(88px,12vh,128px)] text-center">
        <Eyebrow color="violet">
          <span className="tabular-nums">{homeNum("process")} · </span>
          {BUILD.label}
        </Eyebrow>
        <h2 id="build-title" className="sr-only">
          {BUILD.label}: {BUILD.stages.map((s) => s.title.join(" ")).join(" ")}
        </h2>
        <Title t={t} />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3" aria-hidden="true">
          {BUILD.stages.map((s, i) => (
            <span key={s.id} className="flex items-center gap-2.5">
              <span className={`text-[13px] font-semibold transition-colors duration-300 ${i === cur ? "text-fg" : "text-faint"}`}>{s.step}</span>
              <span className="block h-[3px] w-[clamp(40px,5vw,72px)] overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full origin-left rounded-full"
                  style={{ background: s.color, transform: `scaleX(${seg(t, STAGE_START[i], STAGE_START[i] + STAGE_SEC[i])})` }}
                />
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-[14px] text-body" aria-live="polite">
          {st.step} · {st.days}
          {t >= TOTAL - 0.4 && <span className="text-grey"> · {BUILD.replayNote}</span>}
        </p>
      </header>

      <StageBox>
        {BUILD.stages.map((s, i) => {
          const start = STAGE_START[i];
          const len = STAGE_SEC[i];
          if (t < start - 0.15 || (i < BUILD.stages.length - 1 && t > start + len + 0.05)) return null;
          const enter = i === 0 ? 1 : expo(seg(t, start - 0.08, start + 0.7));
          const exitK = i === BUILD.stages.length - 1 ? 0 : seg(t, start + len - 0.32, start + len);
          const exit = exitK * exitK * exitK;
          const s0 = (Math.max(0, t - start) / len) * BEATS;
          return (
            <div
              key={s.id}
              className="absolute inset-0"
              style={{
                transform: `translate3d(${((1 - enter) * 200 - exit * 220).toFixed(1)}px, 0, 0) scale(${(1 - (1 - enter) * 0.03 - exit * 0.03).toFixed(4)})`,
                filter: enter < 0.995 || exit > 0 ? `blur(${((1 - enter) * 12 + exit * 14).toFixed(1)}px)` : undefined,
                opacity: Math.min(1, enter * 1.25) * (1 - exit),
                willChange: "transform, filter, opacity",
              }}
            >
              {i === 0 && <DesignStage s={s0} />}
              {i === 1 && <CodeStage s={s0} />}
              {i === 2 && <CmsStage s={s0} />}
              {i === 3 && <LaunchStage s={s0} />}
            </div>
          );
        })}
      </StageBox>
    </section>
  );
}

/** stage title, letter by letter with blur in and blur out */
function Title({ t }: { t: number }) {
  const i = stageAt(t);
  const st = BUILD.stages[i];
  const end = STAGE_START[i] + STAGE_SEC[i];
  const start = STAGE_START[i] + (i === 0 ? 0.15 : 0.04);
  const out = i === BUILD.stages.length - 1 ? 0 : seg(t, end - 0.3, end) ** 2;
  const words = st.title;
  let n = 0;
  return (
    <p aria-hidden="true" className="mt-5 min-h-[1.1em] text-[clamp(44px,7.4vw,116px)] font-semibold leading-[1] tracking-[-0.05em]">
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" style={{ color: wi === words.length - 1 ? st.color : undefined }}>
          {Array.from(w).map((ch, ci) => {
            const k = expo(seg(t, start + n * 0.022, start + 0.62 + n * 0.022));
            n++;
            return (
              <span
                key={ci}
                className="inline-block"
                style={{
                  transform: `translate3d(${(-out * 40).toFixed(1)}px, ${((1 - k) * 0.35).toFixed(3)}em, 0)`,
                  filter: k < 1 || out > 0 ? `blur(${((1 - k) * 12 + out * 14).toFixed(1)}px)` : undefined,
                  opacity: Math.min(1, k * 1.5) * (1 - out),
                }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block w-[0.26em]" />}
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
    <div ref={box} aria-hidden="true" className="relative z-[1] mx-gutter mb-[clamp(16px,4vh,40px)] mt-[clamp(16px,3vh,32px)] min-h-[240px] flex-1">
      <div className="absolute left-1/2 top-1/2" style={{ width: SW, height: SH, transform: `translate(-50%, -50%) scale(${k})`, visibility: k ? "visible" : "hidden" }}>
        {children}
      </div>
    </div>
  );
}

/** pointer: follows its path (or a pinned point, e.g. the corner being dragged) through a soft spring,
 *  so it never jumps; it blurs with its real on-screen speed */
function BlurPointer({ s, path, down, pin }: { s: number; path: [number, number, number][]; down?: boolean; pin?: { x: number; y: number } | null }) {
  const target = pin ?? along(s, path);
  const st = useRef<{ x: number; y: number; at: number; v: number } | null>(null);
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  if (!st.current) st.current = { x: target.x, y: target.y, at: now, v: 0 };
  const cur = st.current;
  const dt = Math.min(0.1, Math.max(0, (now - cur.at) / 1000));
  const k = pin ? 1 - Math.exp(-dt / 0.03) : 1 - Math.exp(-dt / 0.07);
  const nx = cur.x + (target.x - cur.x) * k;
  const ny = cur.y + (target.y - cur.y) * k;
  const v = dt > 0 ? Math.hypot(nx - cur.x, ny - cur.y) / dt : cur.v; // px per second
  cur.x = nx;
  cur.y = ny;
  cur.at = now;
  cur.v = cur.v + (v - cur.v) * 0.35;
  const blur = Math.min(4, Math.max(0, (cur.v - 250) / 450));
  return (
    <div className="absolute inset-0" style={{ filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      <Pointer x={cur.x} y={cur.y} down={down} />
    </div>
  );
}

const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ position: "absolute", left: x, top: y, width: w, height: h });

/** illustrated mountain "photo" for the mock site (no image files); v picks a sky */
const SKIES = [
  ["#f7dfb8", "#eba67a"],
  ["#e3eaec", "#b5c8cf"],
  ["#f3d2bd", "#c98d7c"],
];
const TREES = Array.from({ length: 32 }, (_, i) => `M${i * 14} 180L${i * 14 + 7} ${150 + ((i * 7) % 11)}L${i * 14 + 14} 180Z`).join("");
function Mountains({ v = 0 }: { v?: number }) {
  const [a, b] = SKIES[v % SKIES.length];
  const id = `sky${v % SKIES.length}`;
  return (
    <svg viewBox="0 0 432 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="432" height="180" fill={`url(#${id})`} />
      <circle cx="312" cy="66" r="20" fill="#fff7e8" opacity="0.85" />
      <path d="M0 118L58 76L104 102L168 54L226 98L288 66L348 94L432 60V180H0Z" fill="#a8b5af" />
      <path d="M168 54L182 64.5L175 63L177 69L168 64L161 68L154 64.5Z" fill="#f4f1ea" opacity="0.9" />
      <path d="M0 140L48 112L98 130L160 96L222 128L282 104L340 132L398 108L432 118V180H0Z" fill="#6d8879" />
      <path d="M0 160L42 142L92 156L152 134L212 158L272 140L332 160L392 144L432 156V180H0Z" fill="#3d5848" />
      <path d={TREES} fill="#23372c" />
    </svg>
  );
}

/* ---------------- 1 · Design ---------------- */
const D = BUILD.design;
const AB = { x: 360, y: 20, w: 480, h: 560 };
/** element rects inside the artboard: drawn AND selected from the same numbers, so the selection always fits */
const R = {
  img: { x: 24, y: 64, w: 432, h: 168 },
  title: { x: 24, y: 286, w: 420, h: 50 },
  btn: { x: 24, y: 394, w: 150, h: 46 },
};
const SWATCHES = ["#e8492a", "#a78bfa", "#22d3ee", "#3d5a3a"];
const TOOLS = [Cursor, FrameCorners, Square, TextT, PenNib, Hand];

function DesignStage({ s }: { s: number }) {
  // panels arrive quickly, the drawing itself takes its time
  const tb = expo(seg(s, 0.06, 0.6));
  const ly = expo(seg(s, 0.14, 0.68));
  const pr = expo(seg(s, 0.1, 0.64));
  const frame = smooth(seg(s, 0.5, 1.05));
  const img = smooth(seg(s, 1.2, 1.5));
  const title = seg(s, 1.62, 2.0);
  const lines = expo(seg(s, 1.96, 2.22));
  const btn = smooth(seg(s, 2.1, 2.26));
  const pick = seg(s, 2.36, 2.56);
  const hover = Math.min(3, Math.floor(pick * 4));
  const btnColor = s >= 2.56 ? SWATCHES[3] : pick > 0 ? SWATCHES[hover] : "#c9c5bd";
  // the tool is picked just before each action; the selection moves to an element the moment it starts
  const tool = s < 1.12 ? 1 : s < 1.56 ? 2 : s < 2.04 ? 3 : s < 2.3 ? 2 : 0;
  const SEL_AT = [0.5, 1.2, 1.62, 2.1];
  const sel = s < 1.2 ? 0 : s < 1.62 ? 1 : s < 2.1 ? 2 : 3;
  type Rc = { x: number; y: number; w: number; h: number };
  const at = (r: Rc, k = 1): Rc => ({ x: AB.x + r.x, y: AB.y + r.y, w: r.w * k, h: r.h * k });
  const imgK = 0.04 + img * 0.96;
  const btnK = 0.08 + btn * 0.92;
  const rects: Rc[] = [{ x: AB.x, y: AB.y, w: AB.w * frame, h: AB.h * frame }, at(R.img, imgK), at(R.title), at(R.btn, btnK)];
  const finals: Rc[] = [{ ...AB }, at(R.img), at(R.title), at(R.btn)];
  // glide from the previous element's box to the new one (no jump)
  const g = sel ? smooth(seg(s, SEL_AT[sel], SEL_AT[sel] + 0.12)) : 1;
  const from = finals[Math.max(0, sel - 1)];
  const to = rects[sel];
  const selBox: Rc = { x: from.x + (to.x - from.x) * g, y: from.y + (to.y - from.y) * g, w: from.w + (to.w - from.w) * g, h: from.h + (to.h - from.h) * g };
  // between actions the pointer glides (ease in-out); while dragging it is pinned to the corner being drawn
  const path: [number, number, number][] = [
    [0.0, 640, 600],
    [0.455, AB.x + 2, AB.y + 2],
    [1.05, AB.x + AB.w, AB.y + AB.h],
    [1.2, AB.x + R.img.x + 2, AB.y + R.img.y + 2],
    [1.5, AB.x + R.img.x + R.img.w, AB.y + R.img.y + R.img.h],
    [1.6, AB.x + R.title.x + 4, AB.y + R.title.y + 26],
    // click to place the caret, then drift out of the way while the title is typed
    [1.78, AB.x + R.title.x + 150, AB.y + R.title.y + R.title.h + 44],
    [2.0, AB.x + R.title.x + 120, AB.y + R.title.y + R.title.h + 56],
    [2.1, AB.x + R.btn.x + 2, AB.y + R.btn.y + 2],
    [2.26, AB.x + R.btn.x + R.btn.w, AB.y + R.btn.y + R.btn.h],
    [2.36, 930, 444],
    [2.56, 930 + 3 * 48, 444],
    [3.0, 930 + 3 * 48, 444],
  ];
  const pin =
    s > 0.5 && s < 1.05
      ? { x: AB.x + AB.w * frame, y: AB.y + AB.h * frame }
      : s > 1.2 && s < 1.5
        ? { x: AB.x + R.img.x + R.img.w * imgK, y: AB.y + R.img.y + R.img.h * imgK }
        : s > 2.1 && s < 2.26
          ? { x: AB.x + R.btn.x + R.btn.w * btnK, y: AB.y + R.btn.y + R.btn.h * btnK }
          : s > 2.36 && s < 2.56
            ? { x: 930 + Math.min(3, pick * 4) * 48, y: 444 }
            : null;
  const down = (s > 0.5 && s < 1.05) || (s > 1.2 && s < 1.5) || (s > 2.1 && s < 2.26) || (s > 2.53 && s < 2.62);

  return (
    <>
      {/* toolbar */}
      <div className="tool flex flex-col gap-1 p-1.5" style={{ ...box(40, 160, 52), ...fly(tb, -180, 0) }}>
        {TOOLS.map((Ic, i) => (
          <span key={i} className={`grid size-10 place-items-center rounded-xl transition-colors duration-200 ${i === tool ? "bg-violet text-white" : "text-grey"}`}>
            <Ic size={18} />
          </span>
        ))}
      </div>
      {/* layers */}
      <div className="tool p-4" style={{ ...box(112, 160, 200), ...fly(ly, -200, 0) }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{D.layersLabel}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {D.layers.map((l, i) => {
            const on = [s > 0.5, s > 1.2, s > 1.62, s > 2.1][i];
            return (
              <li
                key={l}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] ${i === sel ? "bg-violet/20 text-fg" : "text-body"}`}
                style={{ ...fly(on ? 1 : 0, -20, 0, 6), paddingLeft: i ? 24 : 8, transition: "opacity .3s, transform .3s, filter .3s" }}
              >
                {[FrameCorners, ImageIcon, TextT, Square].map((Ic, k) => k === i && <Ic key={k} size={13} />)}
                {l}
              </li>
            );
          })}
        </ul>
      </div>
      {/* properties + palette */}
      <div className="tool p-4" style={{ ...box(900, 160, 260), ...fly(pr, 200, 0) }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{D.props}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] tabular-nums text-body">
          <span className="rounded-lg bg-white/[0.05] px-2.5 py-2">W {Math.round(selBox.w)}</span>
          <span className="rounded-lg bg-white/[0.05] px-2.5 py-2">H {Math.round(selBox.h)}</span>
        </div>
        <p className="mt-4 text-[12px] text-grey">{D.fill}</p>
        <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-white/[0.05] px-2.5 py-2 text-[13px] uppercase tabular-nums text-body">
          <span className="size-4 rounded" style={{ background: sel === 3 ? btnColor : sel === 2 ? "#1a1714" : "#efe9de" }} />
          {sel === 3 ? btnColor : sel === 2 ? "#1a1714" : "#efe9de"}
        </div>
        <div className="mt-4" style={fly(smooth(seg(s, 2.16, 2.34)), 0, 14, 8)}>
          <div className="h-20 rounded-lg" style={{ background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,${btnColor})` }} />
          <div className="mt-3 flex gap-3">
            {SWATCHES.map((c, i) => (
              <span
                key={c}
                className="size-9 rounded-full"
                style={{ background: c, boxShadow: pick > 0 && i === (s >= 2.56 ? 3 : hover) ? `0 0 0 2px #0a0d15, 0 0 0 4px ${c}` : "none" }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* artboard: the site being drawn (children use the same rects as the selection) */}
      <div className="overflow-hidden rounded-md bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)]" style={{ ...box(AB.x, AB.y, AB.w, AB.h), clipPath: `inset(0 ${(1 - frame) * 100}% ${(1 - frame) * 100}% 0)` }}>
        <div className="absolute inset-x-6 top-5 flex items-center justify-between">
          <span className="text-[17px] font-semibold tracking-[-0.03em]">{BUILD.brand}</span>
          <span className="flex items-center gap-4 text-[12px] font-medium text-[#5c564c]">
            {D.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span className="rounded-full bg-[#1a1714] px-3 py-1.5 text-[11px] font-semibold text-[#f4f0e8]">{D.login}</span>
          </span>
        </div>
        {s > 1.2 && (
          <div className="absolute overflow-hidden rounded-xl bg-[#e3d8c6]" style={box(R.img.x, R.img.y, R.img.w * imgK, R.img.h * imgK)}>
            <div className="absolute left-0 top-0" style={{ width: R.img.w, height: R.img.h, opacity: expo(seg(s, 1.28, 1.6)) }}>
              <Mountains />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#1a1714]" style={fly(expo(seg(s, 1.42, 1.7)), -10, 0, 4)}>
                <MapPin size={12} weight="fill" /> {D.place}
              </span>
            </div>
          </div>
        )}
        {/* booking bar floating over the photo */}
        <div
          className="absolute flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-[0_12px_30px_-12px_rgb(40_30_20/0.45)]"
          style={{ ...box(R.img.x + 16, R.img.y + R.img.h - 24, R.img.w - 32, 48), ...fly(expo(seg(s, 1.5, 1.85)), 0, 18, 8) }}
        >
          {D.book.map(([l, v], k) => (
            <span key={l} className={`flex flex-1 items-center gap-2 px-2.5 ${k ? "border-l border-black/10" : ""}`}>
              {[CalendarBlank, CalendarBlank, Users].map((Ic, j) => j === k && <Ic key={j} size={15} className="shrink-0 text-[#7a7368]" />)}
              <span className="leading-tight">
                <span className="block text-[10px] text-[#7a7368]">{l}</span>
                <span className="block whitespace-nowrap text-[12px] font-semibold">{v}</span>
              </span>
            </span>
          ))}
          <span className="flex h-full items-center gap-1.5 rounded-xl bg-[#1a1714] px-3.5 text-[12px] font-semibold text-[#f4f0e8]">
            <MagnifyingGlass size={13} weight="bold" /> {D.find}
          </span>
        </div>
        <p className="absolute flex items-center whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]" style={box(R.title.x, R.title.y, R.title.w, R.title.h)}>
          <Typed text={D.title} k={title} caret={s > 1.62 && s < 2.04} color="#1a1714" />
        </p>
        <p className="absolute text-[15px] text-[#5c564c]" style={{ ...box(R.title.x, R.title.y + R.title.h + 8, R.title.w), ...fly(lines, 0, 10, 6) }}>
          {D.sub}
        </p>
        <span className="absolute flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold text-[#1a1714]" style={{ ...box(R.btn.x + R.btn.w + 22, R.btn.y, undefined, R.btn.h), ...fly(expo(seg(s, 2.18, 2.45)), -12, 0, 5) }}>
          {D.more} <ArrowRight size={14} />
        </span>
        <div className="absolute grid grid-cols-3 gap-2.5" style={box(R.img.x, 470, R.img.w)}>
          {D.houses.map((h, k) => (
            <div key={h.name} className="flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06)]" style={fly(expo(seg(s, 1.98 + k * 0.07, 2.3 + k * 0.07)), 0, 16, 6)}>
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Mountains v={k} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold leading-tight">{h.name}</span>
                <span className="mt-0.5 block text-[11px] text-[#7a7368]">{h.price}</span>
              </span>
            </div>
          ))}
        </div>
        {s > 2.1 && (
          <span
            className="absolute grid place-items-center overflow-hidden whitespace-nowrap rounded-full text-[15px] font-semibold text-white"
            style={{ ...box(R.btn.x, R.btn.y, R.btn.w * btnK, R.btn.h * btnK), background: btnColor, transition: "background-color .18s" }}
          >
            <span style={{ opacity: smooth(seg(s, 2.2, 2.3)) }}>{D.button}</span>
          </span>
        )}
      </div>
      {/* selection + size label */}
      {s > 0.5 && (
        <div className="pointer-events-none border-[1.5px] border-violet" style={box(selBox.x - 2, selBox.y - 2, selBox.w + 4, selBox.h + 4)}>
          {[
            [-5, -5],
            [selBox.w - 1, -5],
            [-5, selBox.h - 1],
            [selBox.w - 1, selBox.h - 1],
          ].map(([x, y], i) => (
            <i key={i} className="absolute size-2.5 border-[1.5px] border-violet bg-white" style={{ left: x, top: y }} />
          ))}
          <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-violet px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {Math.round(selBox.w)} × {Math.round(selBox.h)}
          </span>
        </div>
      )}
      <BlurPointer s={s} path={path} down={down} pin={pin} />
    </>
  );
}

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
  [["export default function ", KW], ["Home", TG], ["() {", PU]],
  [["  return ", KW], ["(", PU]],
  [["    <", PU], ["Header", TG], [" logo", AT], ["=", PU], ['"Your site"', STR], [" />", PU]],
  [["    <", PU], ["Hero", TG], [">", PU]],
  [["      <", PU], ["h1", TG], [">", PU], [C.h1, TX], ["</", PU], ["h1", TG], [">", PU]],
  [["      <", PU], ["p", TG], [">", PU], [C.p, TX], ["</", PU], ["p", TG], [">", PU]],
  [["      <", PU], ["Button", TG], [">", PU], [C.btn, TX], ["</", PU], ["Button", TG], [">", PU]],
  [["      <", PU], ["Booking", TG], [" dates guests", AT], [" />", PU]],
  [["    </", PU], ["Hero", TG], [">", PU]],
  [["    <", PU], ["Houses", TG], [" items", AT], ["=", PU], ["{", PU], ["houses", TX], ["}", PU], [" />", PU]],
  [["  );", PU]],
  [["}", PU]],
];
const LEN = LINES.map((l) => l.reduce((a, [x]) => a + x.length, 0));
const START = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
const CHARS = LEN.reduce((a, b) => a + b, 0);

function CodeStage({ s }: { s: number }) {
  const chars = Math.round(seg(s, 0.3, 1.95) * CHARS);
  const lineK = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const textOf = (line: number, tok: number) => {
    const before = LINES[line].slice(0, tok).reduce((a, [x]) => a + x.length, 0);
    return typed(LINES[line][tok][0], (chars - START[line] - before) / LINES[line][tok][0].length);
  };
  const term = expo(seg(s, 1.9, 2.2));

  return (
    <>
      {/* code written straight on the background */}
      <div className="border-l-2 border-[#5aa2ff]/40 pl-6 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[18px] leading-[34px]" style={box(40, 20, 640)}>
        {LINES.map((line, i) => {
          let left = chars - START[i];
          const k = ease(Math.min(1, lineK(i) * 4));
          return (
            <div key={i} className="flex" style={{ opacity: chars > START[i] ? 1 : 0.15 }}>
              <span className="w-9 shrink-0 pr-4 text-right text-faint">{i + 1}</span>
              <span className="whitespace-pre" style={chars > START[i] && k < 1 ? { filter: `blur(${((1 - k) * 4).toFixed(1)}px)` } : undefined}>
                {line.map(([x, c], j) => {
                  const show = x.slice(0, Math.max(0, Math.min(x.length, left)));
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
      <div className="tool flex items-center gap-4 px-5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[15px]" style={{ ...box(40, 456, 640, 60), ...fly(term, 0, 40, 12) }}>
        <span className="text-green">~/your-site $</span>
        <span className="text-body">{typed(C.cmd, seg(s, 2.02, 2.2))}</span>
        <span className="ml-auto flex items-center gap-2 text-green" style={fly(expo(seg(s, 2.22, 2.45)), 20, 0, 8)}>
          <CheckCircle size={17} weight="fill" /> {C.ok}
        </span>
      </div>
      {/* live preview building as the code is written */}
      <div className="overflow-hidden rounded-xl bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]" style={{ ...box(730, 20, 430, 496), ...fly(expo(seg(s, 0.06, 0.6)), 220, 0, 18) }}>
        <div className="flex h-8 items-center gap-1.5 bg-[#e6e0d4] px-3">
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <span className="ml-2 rounded bg-white/70 px-2 text-[11px] text-[#5c564c]">localhost:3000</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between" style={fly(expo(lineK(2)), 0, -16, 8)}>
            <span className="text-[15px] font-semibold tracking-[-0.03em]">{BUILD.brand}</span>
            <span className="flex items-center gap-3 text-[10px] font-medium text-[#5c564c]">
              {BUILD.design.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
              <span className="rounded-full bg-[#1a1714] px-2 py-1 text-[9px] font-semibold text-[#f4f0e8]">{BUILD.design.login}</span>
            </span>
          </div>
          <div className="relative mt-4 h-[64px] overflow-hidden rounded-xl" style={fly(expo(lineK(3)), 0, 16, 10)}>
            <Mountains />
          </div>
          <div className="pt-3">
            <p className="min-h-[28px] text-[26px] font-semibold leading-none tracking-[-0.045em]">{textOf(4, 3)}</p>
            <p className="mt-1.5 min-h-[18px] text-[13px] text-[#5c564c]">{textOf(5, 3)}</p>
            <span className="mt-3 inline-grid h-9 min-w-[110px] place-items-center rounded-full bg-[#3d5a3a] px-5 text-[12px] font-semibold text-white" style={fly(expo(Math.min(1, lineK(6) * 2.5)), 0, 12, 8)}>
              {textOf(6, 3) || " "}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 rounded-xl bg-white p-1 shadow-[0_6px_16px_-10px_rgb(40_30_20/0.5)]" style={fly(expo(Math.min(1, lineK(7) * 2)), 0, 14, 8)}>
            {BUILD.design.book.map(([l, v], k) => (
              <span key={l} className={`flex-1 px-2 leading-tight ${k ? "border-l border-black/10" : ""}`}>
                <span className="block text-[9px] text-[#7a7368]">{l}</span>
                <span className="block whitespace-nowrap text-[11px] font-semibold">{v}</span>
              </span>
            ))}
            <span className="grid h-8 place-items-center rounded-lg bg-[#1a1714] px-2.5 text-[11px] font-semibold text-[#f4f0e8]">{BUILD.design.find}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((k) => (
              <div key={k} className="rounded-lg bg-white p-2" style={fly(expo(seg(lineK(9), k * 0.2, k * 0.2 + 0.6)), 0, 30, 10)}>
                <div className="relative h-14 overflow-hidden rounded-md">
                  <Mountains v={k} />
                </div>
                <p className="mt-2 truncate text-[11px] font-semibold">{BUILD.design.houses[k].name}</p>
                <p className="text-[10px] text-[#7a7368]">{BUILD.design.houses[k].price}</p>
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

function CmsStage({ s }: { s: number }) {
  const name = typed(M.nameVal, seg(s, 0.45, 1.05));
  const price = typed(M.priceVal, seg(s, 1.15, 1.4));
  const up = seg(s, 1.5, 1.9);
  const photo = s > 1.9;
  const stock = s > 2.05;
  const pressed = s > 2.2 && s < 2.35;
  const pub = s > 2.35;
  const card = (k: number) => fly(expo(seg(s, 0.06 + k * 0.07, 0.6 + k * 0.07)), -200, 0, 14);
  const photoK = expo(seg(s, 1.88, 2.1));
  const stockK = expo(seg(s, 2.05, 2.3));
  const path: [number, number, number][] = [
    [0, 620, 560],
    [0.38, 460, 82],
    [1.05, 460, 82],
    [1.14, 300, 192],
    [1.42, 300, 192],
    [1.5, 380, 300],
    [1.92, 380, 300],
    [2.03, 512, 426],
    [2.1, 512, 426],
    [2.2, 210, 532],
    [3, 230, 548],
  ];
  const down = (s > 0.4 && s < 0.46) || (s > 1.13 && s < 1.18) || (s > 1.48 && s < 1.53) || (s > 2.03 && s < 2.08) || pressed;
  const input = "mt-2 flex h-12 items-center rounded-xl border px-4 text-[17px] text-fg";

  return (
    <>
      <div className="tool p-5" style={{ ...box(60, 30, 480), ...card(0) }}>
        <p className="text-[13px] text-grey">{M.name}</p>
        <p className={`${input} transition-colors duration-300 ${s > 0.4 && s < 1.1 ? "border-cyan" : "border-white/15"}`}>
          <Typed text={M.nameVal} k={seg(s, 0.45, 1.05)} caret={s > 0.4 && s < 1.1} color="#22d3ee" />
        </p>
      </div>
      <div className="tool p-5" style={{ ...box(60, 150, 230), ...card(1) }}>
        <p className="text-[13px] text-grey">{M.price}</p>
        <p className={`${input} tabular-nums transition-colors duration-300 ${s > 1.12 && s < 1.45 ? "border-cyan" : "border-white/15"}`}>
          <Typed text={M.priceVal} k={seg(s, 1.15, 1.4)} caret={s > 1.12 && s < 1.45} color="#22d3ee" />
        </p>
      </div>
      <div className="tool flex items-center gap-4 p-5" style={{ ...box(60, 270, 480, 104), ...card(2) }}>
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06]">
          <ImageIcon size={24} className="text-grey" />
          <span className="absolute inset-0" style={{ opacity: photoK, transform: `scale(${1.15 - photoK * 0.15})` }}>
            <Mountains />
          </span>
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-2 text-[15px] text-body">
            {photo ? <CheckCircle size={16} weight="fill" className="text-green" /> : <UploadSimple size={16} />}
            {photo ? M.file : `${M.photo} · ${Math.round(up * 100)}%`}
          </p>
          <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <span className="block h-full rounded-full bg-cyan" style={{ width: `${up * 100}%` }} />
          </span>
        </div>
      </div>
      <div className="tool flex items-center justify-between px-5" style={{ ...box(60, 396, 480, 64), ...card(3) }}>
        <span className="text-[16px] text-fg">{M.stock}</span>
        <span className="relative h-7 w-12 rounded-full" style={{ background: `color-mix(in srgb, #34d399 ${(stockK * 100).toFixed(0)}%, rgb(255 255 255 / 0.15))` }}>
          <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow" style={{ transform: `translateX(${(stockK * 20).toFixed(1)}px)` }} />
        </span>
      </div>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-7 text-[16px] font-semibold text-white transition-colors duration-300 ${pub ? "bg-[#1f9d68]" : "bg-blue"}`}
        style={{ ...box(60, 500, undefined, 56), ...card(4), transform: `${card(4).transform} scale(${pressed ? 0.94 : 1})` }}
      >
        {pub && <CheckCircle size={18} weight="fill" />}
        {pub ? M.published : M.publish}
      </span>
      {/* toast */}
      <div className="tool flex items-center gap-2 px-4 py-2.5 text-[14px] text-green" style={{ ...box(580, 40), ...fly(expo(seg(s, 2.4, 2.7)), 0, -24, 10) }}>
        <CheckCircle size={16} weight="fill" /> {M.toast}
      </div>
      {/* availability calendar: the free dates light up when «Вільно» is on */}
      <div className="tool p-4" style={{ ...box(580, 150, 220), ...fly(expo(seg(s, 0.2, 0.75)), 0, 30, 12) }}>
        <p className="flex items-center justify-between text-[13px] font-semibold text-fg">
          {M.cal} <CalendarBlank size={15} className="text-grey" />
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] tabular-nums">
          {Array.from({ length: 28 }, (_, d) => {
            const day = d + 1;
            const booked = day >= 12 && day <= 14;
            const free = !booked && day % 7 >= 5;
            const k = free ? stockK : 0;
            return (
              <span
                key={d}
                className="grid h-6 place-items-center rounded-md"
                style={{
                  background: booked ? "rgb(255 255 255 / 0.14)" : `rgb(52 211 153 / ${(0.22 * k).toFixed(3)})`,
                  color: booked ? "#f5f7fa" : k > 0.5 ? "#34d399" : "#8b919c",
                }}
              >
                {day}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-grey">{M.calNote}</p>
      </div>
      {/* iPhone: the live site updates */}
      <IPhone style={{ ...box(830, 0, 290, 610), ...fly(expo(seg(s, 0.04, 0.6)), 220, 0, 16) }}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[15px] font-semibold">{BUILD.brand}</span>
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${pub ? "text-[#1f8f5f]" : "text-black/30"}`}>
            <span className={`size-1.5 rounded-full ${pub ? "bg-[#1f8f5f]" : "bg-black/25"}`} />
            {M.live}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative grid h-40 place-items-center overflow-hidden bg-[#ebe5da]">
            <ImageIcon size={30} className="text-black/20" />
            <div className="absolute inset-0" style={{ opacity: photoK, transform: `scale(${1.12 - photoK * 0.12})` }}>
              <Mountains />
            </div>
          </div>
          <div className="p-4">
            <p className="min-h-[22px] text-[17px] font-semibold leading-tight">{name || " "}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[18px] font-semibold tabular-nums">{price}</span>
              <span className="rounded-full bg-[#1f8f5f]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1f8f5f]" style={fly(stockK, 10, 0, 6)}>
                {M.stock}
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {M.amen.map((a) => (
                <span key={a} className="rounded-full bg-[#f1ece2] px-2 py-0.5 text-[10px] font-medium text-[#5c564c]">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 opacity-60">
          <div className="relative h-24 overflow-hidden rounded-xl">
            <Mountains v={1} />
          </div>
          <div className="relative h-24 overflow-hidden rounded-xl">
            <Mountains v={2} />
          </div>
        </div>
      </IPhone>
      <BlurPointer s={s} path={path} down={down} />
    </>
  );
}

/** iPhone-style device: titanium frame, side buttons, Dynamic Island, status bar, home indicator */
function IPhone({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return (
    <div style={style}>
      {/* side buttons */}
      <i className="absolute -left-[3px] top-[108px] h-7 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[156px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[216px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -right-[3px] top-[172px] h-[72px] w-[3px] rounded-r bg-[#3a3d44]" />
      <div className="relative h-full rounded-[54px] bg-[linear-gradient(145deg,#4a4e57,#1d1f24_35%,#2b2e35_70%,#121317)] p-[3px] shadow-[0_50px_100px_-30px_rgb(0_0_0/0.95)]">
        <div className="relative h-full rounded-[51px] bg-black p-[9px]">
          <div className="relative h-full overflow-hidden rounded-[43px] bg-[#f4f0e8] text-[#1a1714]">
            {/* status bar */}
            <div className="flex h-[46px] items-center justify-between px-7 pt-1 text-[13px] font-semibold">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="flex items-end gap-[2px]">
                  {[4, 6, 8, 10].map((h) => (
                    <i key={h} className="w-[3px] rounded-sm bg-[#1a1714]" style={{ height: h }} />
                  ))}
                </span>
                <span className="relative h-[11px] w-[22px] rounded-[3px] border border-[#1a1714]/50 p-[1.5px]">
                  <i className="block h-full w-4/5 rounded-[1.5px] bg-[#1a1714]" />
                </span>
              </span>
            </div>
            {/* Dynamic Island */}
            <i className="absolute left-1/2 top-[11px] h-[30px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
            <div className="px-4 pt-2">{children}</div>
            {/* home indicator */}
            <i className="absolute bottom-2 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-[#1a1714]/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 4 · Launch ---------------- */
const L = BUILD.launch;
const BR = { x: 300, y: 10, w: 600, h: 430 };
const PIECES = [
  { x: 0, y: 40, w: 600, h: 50, dx: -420, dy: -120, c: "#e6e0d4" },
  { x: 24, y: 110, w: 552, h: 160, dx: 460, dy: -80, c: "#efe9de" },
  { x: 24, y: 290, w: 170, h: 116, dx: -480, dy: 160, c: "#efe9de" },
  { x: 215, y: 290, w: 170, h: 116, dx: 0, dy: 320, c: "#efe9de" },
  { x: 406, y: 290, w: 170, h: 116, dx: 480, dy: 160, c: "#efe9de" },
];
function LaunchStage({ s }: { s: number }) {
  const shell = expo(seg(s, 0.03, 0.55));
  const url = typed(L.url, seg(s, 1.25, 1.65));
  const deploy = ease(seg(s, 1.6, 2.0));
  const sweep = seg(s, 2.0, 2.45);
  const online = expo(seg(s, 2.0, 2.35));
  const lift = ease(seg(s, 2.0, 2.4));
  const cx = BR.x + BR.w / 2;
  return (
    <>
      {/* browser assembling */}
      <div
        className="overflow-hidden rounded-2xl border bg-[#f4f0e8]"
        style={{
          ...box(BR.x, BR.y, BR.w, BR.h),
          ...fly(shell, 0, 60, 18, `scale(${0.9 + shell * 0.1 + lift * 0.015}) translateY(${-lift * 6}px)`),
          borderColor: `rgb(52 211 153 / ${0.15 + lift * 0.45})`,
          boxShadow: `0 50px 110px -30px rgb(0 0 0 / 0.95), 0 0 0 ${lift * 6}px rgb(52 211 153 / ${0.12 * lift})`,
        }}
      >
        <div className="flex h-10 items-center gap-2 bg-[#e6e0d4] px-4">
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <span className="ml-4 flex h-6 min-w-[220px] items-center gap-1.5 rounded-md bg-white/80 px-3 text-[13px] text-[#3f3a33]">
            <Lock size={12} weight="fill" className={s > 1.65 ? "text-[#1f8f5f]" : "text-black/25"} />
            {url}
            <Caret on={s > 1.25 && s < 1.7} color="#1a1714" />
          </span>
        </div>
        {/* deploy progress under the address bar */}
        <span className="absolute left-0 top-10 z-[2] h-[3px] w-full origin-left bg-gradient-to-r from-[#5aa2ff] to-[#34d399]" style={{ transform: `scaleX(${deploy})`, opacity: s < 2.4 ? 1 : 1 - seg(s, 2.4, 2.6) }} />
        {/* light sweep once it is live */}
        {sweep > 0 && sweep < 1 && (
          <span
            className="pointer-events-none absolute inset-y-0 z-[3] w-40 -skew-x-12"
            style={{ left: `${-30 + sweep * 130}%`, background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent)", filter: "blur(6px)" }}
          />
        )}
        {PIECES.map((p, i) => {
          const k = expo(seg(s, 0.3 + i * 0.1, 0.95 + i * 0.1));
          return (
            <div
              key={i}
              className="absolute rounded-xl"
              style={{ left: p.x, top: p.y, width: p.w, height: p.h, background: p.c, borderRadius: i === 0 ? 0 : 12, ...fly(k, p.dx, p.dy, 22, `rotate(${((1 - k) * (i % 2 ? 10 : -10)).toFixed(1)}deg)`) }}
            >
              {i === 0 && (
                <div className="flex h-full items-center justify-between px-6 text-[#1a1714]">
                  <span className="text-[18px] font-semibold tracking-[-0.03em]">{BUILD.brand}</span>
                  <span className="flex gap-4 text-[12px] font-medium text-[#5c564c]">
                    {BUILD.design.nav.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                </div>
              )}
              {i === 1 && (
                <div className="relative h-full overflow-hidden rounded-xl p-6 text-[#1a1714]">
                  <div className="absolute inset-y-3 right-3 w-[250px] overflow-hidden rounded-lg">
                    <Mountains />
                  </div>
                  <p className="relative text-[30px] font-semibold leading-none tracking-[-0.045em]">{BUILD.design.title}</p>
                  <p className="relative mt-2.5 text-[13px] text-[#5c564c]">{BUILD.design.sub}</p>
                  <span className="relative mt-5 inline-grid h-10 place-items-center rounded-full bg-[#3d5a3a] px-5 text-[13px] font-semibold text-white">{BUILD.design.button}</span>
                </div>
              )}
              {i >= 2 && (
                <div className="p-2.5">
                  <div className="relative h-16 overflow-hidden rounded-lg">
                    <Mountains v={i - 2} />
                  </div>
                  <p className="mt-2 truncate text-[12px] font-semibold text-[#1a1714]">{BUILD.design.houses[i - 2].name}</p>
                  <p className="text-[11px] text-[#7a7368]">{BUILD.design.houses[i - 2].price}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* online + checks */}
      <div style={{ ...box(cx - 75, 462, 150, 44), ...fly(online, 0, 24, 12) }}>
        {[0, 0.22].map((d) => {
          const k = seg(s, 2.1 + d, 2.9 + d);
          return k > 0 && k < 1 ? (
            <span key={d} className="absolute inset-0 rounded-full border-2 border-green" style={{ transform: `scale(${1 + ease(k) * 0.7}, ${1 + ease(k) * 1.4})`, opacity: (1 - k) * 0.6 }} />
          ) : null;
        })}
        <p className="flex h-full items-center justify-center gap-2 rounded-full border border-green/30 bg-[#0d1a17] text-[16px] font-semibold text-green">
          <span className="size-2.5 animate-pulse rounded-full bg-green" /> {L.online}
        </p>
      </div>
      <ul className="flex justify-center gap-3" style={box(BR.x - 60, 536, BR.w + 120)}>
        {L.checks.map((c, i) => (
          <li key={c} className="tool flex items-center gap-2 px-4 py-2.5 text-[15px] text-fg" style={fly(expo(seg(s, 2.25 + i * 0.08, 2.65 + i * 0.08)), 0, 24, 10)}>
            <CheckCircle size={17} weight="fill" className="text-green" /> {c}
          </li>
        ))}
      </ul>
    </>
  );
}
