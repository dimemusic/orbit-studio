"use client";

import { CheckCircle, Cursor, FrameCorners, Hand, Image as ImageIcon, Lock, PenNib, Square, TextT, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BUILD } from "@/lib/content";
import { homeNum } from "../home";
import { Eyebrow } from "../ui/Bits";
import { along, Caret, ease, Pointer, seg, typed } from "../process/util";

/**
 * «Як ми працюємо»: a ~12s film that plays once by itself when the section comes into view.
 * No app windows: a grid draws on the page background, our own tool panels fly in around the artboard,
 * then it whips to live code, the CMS, and the launch. Everything that moves carries motion blur;
 * stages change with a blurred whip; the big centred H1 changes per stage, letter by letter.
 * The mock UI lives on a fixed 1200×620 stage scaled to fit. Reduced motion: final frame at once.
 */
const STAGE_LEN = 3;
const TOTAL = STAGE_LEN * BUILD.stages.length;
const SW = 1200;
const SH = 620;

/** motion-blur style for an element that flies in: k = 0 (start) → 1 (settled) */
const fly = (k: number, dx = 0, dy = 0, px = 14, extra = ""): CSSProperties => ({
  transform: `translate3d(${((1 - k) * dx).toFixed(1)}px, ${((1 - k) * dy).toFixed(1)}px, 0) ${extra}`,
  filter: k < 1 ? `blur(${((1 - k) * px).toFixed(2)}px)` : undefined,
  opacity: Math.min(1, k * 1.6),
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

  const cur = Math.min(BUILD.stages.length - 1, Math.floor(t / STAGE_LEN));
  const st = BUILD.stages[cur];
  const gridH = ease(seg(t, 0, 0.7));
  const gridV = ease(seg(t, 0.15, 0.85));

  return (
    <section ref={ref} id="process" aria-labelledby="build-title" className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden">
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
                  style={{ background: s.color, transform: `scaleX(${seg(t, i * STAGE_LEN, (i + 1) * STAGE_LEN)})` }}
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
          const start = i * STAGE_LEN;
          if (t < start - 0.15 || (i < BUILD.stages.length - 1 && t > start + STAGE_LEN + 0.05)) return null;
          const enter = i === 0 ? 1 : ease(seg(t, start - 0.1, start + 0.4));
          const exitK = i === BUILD.stages.length - 1 ? 0 : seg(t, start + STAGE_LEN - 0.35, start + STAGE_LEN);
          const exit = exitK * exitK;
          const s0 = t - start;
          return (
            <div
              key={s.id}
              className="absolute inset-0"
              style={{
                transform: `translate3d(${((1 - enter) * 340 - exit * 340).toFixed(1)}px, 0, 0)`,
                filter: enter < 1 || exit > 0 ? `blur(${((1 - enter) * 20 + exit * 20).toFixed(1)}px)` : undefined,
                opacity: Math.min(1, enter * 1.4) * (1 - exit),
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
  const i = Math.min(BUILD.stages.length - 1, Math.floor(t / STAGE_LEN));
  const st = BUILD.stages[i];
  const start = i * STAGE_LEN + (i === 0 ? 0.15 : 0.02);
  const out = i === BUILD.stages.length - 1 ? 0 : ease(seg(t, i * STAGE_LEN + STAGE_LEN - 0.3, i * STAGE_LEN + STAGE_LEN));
  const words = st.title;
  let n = 0;
  return (
    <p aria-hidden="true" className="mt-5 min-h-[1.1em] text-[clamp(44px,7.4vw,116px)] font-semibold leading-[1] tracking-[-0.05em]">
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" style={{ color: wi === words.length - 1 ? st.color : undefined }}>
          {Array.from(w).map((ch, ci) => {
            const k = ease(seg(t, start + n * 0.028, start + 0.32 + n * 0.028));
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

/** pointer that blurs with its own speed */
function BlurPointer({ s, path, down }: { s: number; path: [number, number, number][]; down?: boolean }) {
  const p = along(s, path);
  const q = along(Math.max(0, s - 0.035), path);
  const v = Math.hypot(p.x - q.x, p.y - q.y);
  return (
    <div className="absolute inset-0" style={{ filter: v > 2 ? `blur(${Math.min(5, v * 0.18).toFixed(1)}px)` : undefined }}>
      <Pointer x={p.x} y={p.y} down={down} />
    </div>
  );
}

const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ position: "absolute", left: x, top: y, width: w, height: h });

/* ---------------- 1 · Design ---------------- */
const D = BUILD.design;
const AB = { x: 360, y: 20, w: 480, h: 560 };
/** element rects inside the artboard: drawn AND selected from the same numbers, so the selection always fits */
const R = {
  img: { x: 24, y: 64, w: 432, h: 180 },
  title: { x: 24, y: 272, w: 420, h: 54 },
  btn: { x: 24, y: 400, w: 150, h: 46 },
};
const SWATCHES = ["#e8492a", "#a78bfa", "#22d3ee", "#3d5a3a"];
const TOOLS = [Cursor, FrameCorners, Square, TextT, PenNib, Hand];

function DesignStage({ s }: { s: number }) {
  const tb = ease(seg(s, 0.15, 0.55));
  const ly = ease(seg(s, 0.3, 0.7));
  const pr = ease(seg(s, 0.25, 0.65));
  const frame = ease(seg(s, 0.55, 1.0));
  const img = ease(seg(s, 1.0, 1.35));
  const title = seg(s, 1.4, 1.95);
  const lines = ease(seg(s, 1.95, 2.1));
  const btn = ease(seg(s, 2.05, 2.25));
  const pick = seg(s, 2.3, 2.8);
  const hover = Math.min(3, Math.floor(pick * 4));
  const btnColor = s >= 2.8 ? SWATCHES[3] : pick > 0 ? SWATCHES[hover] : "#c9c5bd";
  const tool = s < 1.0 ? 1 : s < 1.38 ? 2 : s < 2.0 ? 3 : 0;
  const sel = s < 1.0 ? 0 : s < 1.38 ? 1 : s < 2.0 ? 2 : 3;
  const at = (r: { x: number; y: number; w: number; h: number }, kw = 1) => ({ x: AB.x + r.x, y: AB.y + r.y, w: r.w * kw, h: r.h });
  const selBox = [{ x: AB.x, y: AB.y, w: AB.w * frame, h: AB.h * frame }, at(R.img, 0.4 + img * 0.6), at(R.title), at(R.btn, 0.6 + btn * 0.4)][sel];
  const path: [number, number, number][] = [
    [0, 700, 600],
    [0.55, AB.x + 2, AB.y + 2],
    [1.0, AB.x + AB.w, AB.y + AB.h],
    [1.05, AB.x + R.img.x + 4, AB.y + R.img.y + 4],
    [1.35, AB.x + R.img.x + R.img.w, AB.y + R.img.y + R.img.h],
    [1.4, AB.x + R.title.x + 4, AB.y + R.title.y + 30],
    [1.95, AB.x + R.title.x + 380, AB.y + R.title.y + 30],
    [2.05, AB.x + R.btn.x + 4, AB.y + R.btn.y + 4],
    [2.25, AB.x + R.btn.x + R.btn.w, AB.y + R.btn.y + R.btn.h],
    [2.3, 942, 418],
    [2.8, 942 + 3 * 48, 418],
    [3, AB.x + R.btn.x + 110, AB.y + R.btn.y + 26],
  ];
  const down = (s > 0.55 && s < 1.0) || (s > 1.05 && s < 1.35) || (s > 2.05 && s < 2.25) || (s > 2.75 && s < 2.85);

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
            const on = [s > 0.55, s > 1.0, s > 1.4, s > 2.05][i];
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
        <div className="mt-4" style={fly(ease(seg(s, 2.2, 2.4)), 0, 14, 8)}>
          <div className="h-20 rounded-lg" style={{ background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,${btnColor})` }} />
          <div className="mt-3 flex gap-3">
            {SWATCHES.map((c, i) => (
              <span
                key={c}
                className="size-9 rounded-full"
                style={{ background: c, boxShadow: pick > 0 && i === (s >= 2.8 ? 3 : hover) ? `0 0 0 2px #0a0d15, 0 0 0 4px ${c}` : "none" }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* artboard: the site being drawn (children use the same rects as the selection) */}
      <div className="overflow-hidden rounded-md bg-[#f4f0e8] text-[#1a1714]" style={{ ...box(AB.x, AB.y, AB.w, AB.h), clipPath: `inset(0 ${(1 - frame) * 100}% ${(1 - frame) * 100}% 0)` }}>
        <div className="absolute inset-x-6 top-5 flex items-center justify-between">
          <span className="text-[17px] font-semibold tracking-[-0.03em]">Maina</span>
          <span className="flex gap-3">
            <i className="h-2 w-10 rounded-full bg-black/20" />
            <i className="h-2 w-10 rounded-full bg-black/20" />
            <i className="h-2 w-10 rounded-full bg-black/20" />
          </span>
        </div>
        <div className="absolute grid origin-left place-items-center rounded-xl" style={{ ...box(R.img.x, R.img.y, R.img.w, R.img.h), background: "linear-gradient(120deg,#d9c6a5,#b98a5e 55%,#7a4e32)", ...fly(img, -60, 0, 16, `scaleX(${0.4 + img * 0.6})`) }}>
          <ImageIcon size={36} className="text-white/70" />
        </div>
        <p className="absolute flex items-center whitespace-nowrap text-[44px] font-semibold leading-none tracking-[-0.045em]" style={box(R.title.x, R.title.y, R.title.w, R.title.h)}>
          {typed(D.title, title)}
          <Caret on={s > 1.4 && s < 2.0} color="#1a1714" />
        </p>
        <div className="absolute flex flex-col gap-2" style={{ ...box(R.title.x, R.title.y + R.title.h + 14), opacity: lines }}>
          <i className="h-2.5 w-80 rounded-full bg-black/20" />
          <i className="h-2.5 w-56 rounded-full bg-black/20" />
        </div>
        <span className="absolute grid origin-left place-items-center rounded-full text-[15px] font-semibold text-white" style={{ ...box(R.btn.x, R.btn.y, R.btn.w, R.btn.h), background: btnColor, ...fly(btn, 0, 10, 10, `scale(${0.6 + btn * 0.4})`) }}>
          {D.button}
        </span>
      </div>
      {/* selection + size label */}
      {s > 0.55 && (
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
      <BlurPointer s={s} path={path} down={down} />
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
  [["    <", PU], ["Header", TG], [" logo", AT], ["=", PU], ['"Maina"', STR], [" />", PU]],
  [["    <", PU], ["Hero", TG], [">", PU]],
  [["      <", PU], ["h1", TG], [">", PU], [C.h1, TX], ["</", PU], ["h1", TG], [">", PU]],
  [["      <", PU], ["p", TG], [">", PU], [C.p, TX], ["</", PU], ["p", TG], [">", PU]],
  [["      <", PU], ["Button", TG], [">", PU], [C.btn, TX], ["</", PU], ["Button", TG], [">", PU]],
  [["    </", PU], ["Hero", TG], [">", PU]],
  [["    <", PU], ["Products", TG], [" items", AT], ["=", PU], ["{", PU], ["menu", TX], ["}", PU], [" />", PU]],
  [["  );", PU]],
  [["}", PU]],
];
const LEN = LINES.map((l) => l.reduce((a, [x]) => a + x.length, 0));
const START = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
const CHARS = LEN.reduce((a, b) => a + b, 0);

function CodeStage({ s }: { s: number }) {
  const chars = Math.round(seg(s, 0.35, 2.25) * CHARS);
  const lineK = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const textOf = (line: number, tok: number) => {
    const before = LINES[line].slice(0, tok).reduce((a, [x]) => a + x.length, 0);
    return typed(LINES[line][tok][0], (chars - START[line] - before) / LINES[line][tok][0].length);
  };
  const term = ease(seg(s, 2.2, 2.4));

  return (
    <>
      {/* code written straight on the background */}
      <div className="border-l-2 border-[#5aa2ff]/40 pl-6 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[19px] leading-[38px]" style={box(40, 20, 640)}>
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
        <span className="text-green">~/maina $</span>
        <span className="text-body">{typed(C.cmd, seg(s, 2.3, 2.55))}</span>
        <span className="ml-auto flex items-center gap-2 text-green" style={fly(ease(seg(s, 2.6, 2.75)), 20, 0, 8)}>
          <CheckCircle size={17} weight="fill" /> {C.ok}
        </span>
      </div>
      {/* live preview building as the code is written */}
      <div className="overflow-hidden rounded-xl bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]" style={{ ...box(730, 20, 430, 496), ...fly(ease(seg(s, 0.1, 0.5)), 220, 0, 18) }}>
        <div className="flex h-8 items-center gap-1.5 bg-[#e6e0d4] px-3">
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <span className="ml-2 rounded bg-white/70 px-2 text-[11px] text-[#5c564c]">localhost:3000</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between" style={fly(ease(lineK(2)), 0, -16, 8)}>
            <span className="text-[16px] font-semibold tracking-[-0.03em]">Maina</span>
            <span className="flex gap-2">
              <i className="h-1.5 w-9 rounded-full bg-black/20" />
              <i className="h-1.5 w-9 rounded-full bg-black/20" />
            </span>
          </div>
          <div className="mt-5 rounded-xl p-5" style={{ background: lineK(3) > 0.6 ? "#e9dfcd" : "transparent", transition: "background .4s" }}>
            <p className="min-h-[36px] text-[32px] font-semibold leading-none tracking-[-0.045em]">{textOf(4, 3)}</p>
            <p className="mt-2 min-h-[20px] text-[14px] text-[#5c564c]">{textOf(5, 3)}</p>
            <span className="mt-4 inline-grid h-10 min-w-[110px] place-items-center rounded-full bg-[#3d5a3a] px-5 text-[13px] font-semibold text-white" style={fly(ease(Math.min(1, lineK(6) * 2.5)), 0, 12, 8)}>
              {textOf(6, 3) || " "}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((k) => (
              <div key={k} className="rounded-lg bg-white p-2" style={fly(ease(seg(lineK(8), k * 0.25, k * 0.25 + 0.5)), 0, 40, 12)}>
                <div className="h-20 rounded-md" style={{ background: ["#d9c6a5", "#c7b08a", "#b98a5e"][k] }} />
                <i className="mt-2 block h-1.5 w-3/4 rounded-full bg-black/20" />
                <i className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-black/10" />
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
const PHOTO = "linear-gradient(135deg,#f1e3c8,#d8b98c 50%,#a9784f)";

function CmsStage({ s }: { s: number }) {
  const name = typed(M.nameVal, seg(s, 0.45, 1.05));
  const price = typed(M.priceVal, seg(s, 1.15, 1.4));
  const up = seg(s, 1.5, 1.9);
  const photo = s > 1.9;
  const stock = s > 2.05;
  const pressed = s > 2.2 && s < 2.35;
  const pub = s > 2.35;
  const card = (k: number) => fly(ease(seg(s, 0.1 + k * 0.1, 0.5 + k * 0.1)), -260, 0, 16);
  const path: [number, number, number][] = [
    [0, 620, 560],
    [0.4, 460, 82],
    [1.1, 460, 82],
    [1.15, 300, 192],
    [1.45, 300, 192],
    [1.5, 380, 300],
    [1.95, 380, 300],
    [2.05, 512, 426],
    [2.15, 512, 426],
    [2.25, 210, 532],
    [3, 260, 560],
  ];
  const down = (s > 0.4 && s < 0.46) || (s > 1.13 && s < 1.18) || (s > 1.48 && s < 1.53) || (s > 2.03 && s < 2.08) || pressed;
  const input = "mt-2 flex h-12 items-center rounded-xl border px-4 text-[17px] text-fg";

  return (
    <>
      <div className="tool p-5" style={{ ...box(60, 30, 480), ...card(0) }}>
        <p className="text-[13px] text-grey">{M.name}</p>
        <p className={`${input} ${s > 0.4 && s < 1.1 ? "border-cyan" : "border-white/15"}`}>
          {name}
          <Caret on={s > 0.4 && s < 1.1} color="#22d3ee" />
        </p>
      </div>
      <div className="tool p-5" style={{ ...box(60, 150, 230), ...card(1) }}>
        <p className="text-[13px] text-grey">{M.price}</p>
        <p className={`${input} tabular-nums ${s > 1.12 && s < 1.45 ? "border-cyan" : "border-white/15"}`}>
          {price}
          <Caret on={s > 1.12 && s < 1.45} color="#22d3ee" />
        </p>
      </div>
      <div className="tool flex items-center gap-4 p-5" style={{ ...box(60, 270, 480, 104), ...card(2) }}>
        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-white/[0.06]" style={photo ? { background: PHOTO } : undefined}>
          {!photo && <ImageIcon size={24} className="text-grey" />}
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-2 text-[15px] text-body">
            {photo ? <CheckCircle size={16} weight="fill" className="text-green" /> : <UploadSimple size={16} />}
            {photo ? "varenyky.jpg" : `${M.photo} · ${Math.round(up * 100)}%`}
          </p>
          <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <span className="block h-full rounded-full bg-cyan" style={{ width: `${up * 100}%` }} />
          </span>
        </div>
      </div>
      <div className="tool flex items-center justify-between px-5" style={{ ...box(60, 396, 480, 64), ...card(3) }}>
        <span className="text-[16px] text-fg">{M.stock}</span>
        <span className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${stock ? "bg-green" : "bg-white/15"}`}>
          <span className={`absolute top-1 size-5 rounded-full bg-white transition-all duration-300 ${stock ? "left-6" : "left-1"}`} />
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
      <div className="tool flex items-center gap-2 px-4 py-2.5 text-[14px] text-green" style={{ ...box(600, 40), ...fly(ease(seg(s, 2.4, 2.6)), 0, -30, 12) }}>
        <CheckCircle size={16} weight="fill" /> {M.toast}
      </div>
      {/* iPhone: the live site updates */}
      <IPhone style={{ ...box(830, 0, 290, 610), ...fly(ease(seg(s, 0.05, 0.45)), 260, 0, 18) }}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[15px] font-semibold">Maina</span>
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${pub ? "text-[#1f8f5f]" : "text-black/30"}`}>
            <span className={`size-1.5 rounded-full ${pub ? "bg-[#1f8f5f]" : "bg-black/25"}`} />
            {M.live}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid h-40 place-items-center" style={{ background: photo ? PHOTO : "#ebe5da", transition: "background .5s" }}>
            {!photo && <ImageIcon size={30} className="text-black/20" />}
          </div>
          <div className="p-4">
            <p className="min-h-[44px] text-[17px] font-semibold leading-tight">{name || " "}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[18px] font-semibold tabular-nums">{price}</span>
              <span className="rounded-full bg-[#1f8f5f]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1f8f5f]" style={fly(stock ? 1 : 0, 10, 0, 6)}>
                {M.stock}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 opacity-60">
          <div className="h-24 rounded-xl bg-[#e6dfd2]" />
          <div className="h-24 rounded-xl bg-[#e6dfd2]" />
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
  { x: 24, y: 110, w: 552, h: 160, dx: 460, dy: -80, c: "#d9c6a5" },
  { x: 24, y: 290, w: 170, h: 116, dx: -480, dy: 160, c: "#efe9de" },
  { x: 215, y: 290, w: 170, h: 116, dx: 0, dy: 320, c: "#efe9de" },
  { x: 406, y: 290, w: 170, h: 116, dx: 480, dy: 160, c: "#efe9de" },
];
function LaunchStage({ s }: { s: number }) {
  const shell = ease(seg(s, 0.05, 0.4));
  const url = typed(L.url, seg(s, 1.25, 1.65));
  const deploy = ease(seg(s, 1.6, 2.0));
  const sweep = seg(s, 2.0, 2.45);
  const online = ease(seg(s, 2.0, 2.25));
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
          const k = ease(seg(s, 0.35 + i * 0.12, 0.8 + i * 0.12));
          return (
            <div
              key={i}
              className="absolute rounded-xl"
              style={{ left: p.x, top: p.y, width: p.w, height: p.h, background: p.c, borderRadius: i === 0 ? 0 : 12, ...fly(k, p.dx, p.dy, 22, `rotate(${((1 - k) * (i % 2 ? 10 : -10)).toFixed(1)}deg)`) }}
            >
              {i === 0 && (
                <div className="flex h-full items-center justify-between px-6 text-[#1a1714]">
                  <span className="text-[18px] font-semibold tracking-[-0.03em]">Maina</span>
                  <span className="flex gap-3">
                    <i className="h-2 w-10 rounded-full bg-black/20" />
                    <i className="h-2 w-10 rounded-full bg-black/20" />
                  </span>
                </div>
              )}
              {i === 1 && (
                <div className="p-6 text-[#1a1714]">
                  <p className="text-[34px] font-semibold leading-none tracking-[-0.045em]">{BUILD.design.title}</p>
                  <i className="mt-3 block h-2.5 w-72 rounded-full bg-black/20" />
                  <span className="mt-5 inline-grid h-10 place-items-center rounded-full bg-[#3d5a3a] px-5 text-[13px] font-semibold text-white">{BUILD.design.button}</span>
                </div>
              )}
              {i >= 2 && <div className="m-2.5 h-16 rounded-lg bg-[#d9c6a5]" />}
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
          <li key={c} className="tool flex items-center gap-2 px-4 py-2.5 text-[15px] text-fg" style={fly(ease(seg(s, 2.3 + i * 0.1, 2.6 + i * 0.1)), 0, 30, 12)}>
            <CheckCircle size={17} weight="fill" className="text-green" /> {c}
          </li>
        ))}
      </ul>
    </>
  );
}
