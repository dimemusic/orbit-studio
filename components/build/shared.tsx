import { Lock } from "@phosphor-icons/react/dist/ssr";
import { memo, type CSSProperties, type ReactNode } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";
import { seg, smooth } from "./util";

// Shared by the Build film (components/sections/Build.tsx): timeline, motion blur budget, layout helpers, the derived copy.

/** each stage's inner timeline is 3 beats; this is how many real seconds each one gets.
 *  Design (the craft) and the panel (the client's benefit) get more time, code and launch read at a glance. */
export const BEATS = 3;
export const STAGE_SEC = [5.0, 3.2, 4.0, 3.4];
export const STAGE_START = STAGE_SEC.map((_, i) =>
  STAGE_SEC.slice(0, i).reduce((a, b) => a + b, 0),
);
export const TOTAL = STAGE_SEC.reduce((a, b) => a + b, 0);
/** the final frame is held this long, then the film starts again */
export const HOLD = 5;
/** each lap opens with a title card in the middle of the screen («Що ми робимо?»), then the film starts */
export const INTRO = 1.3;
export const CYCLE = INTRO + TOTAL + HOLD;
export const stageAt = (t: number) => {
  let i = 0;
  while (i < STAGE_SEC.length - 1 && t >= STAGE_START[i + 1]) i++;
  return i;
};
export const SW = 1200;
export const SH = 620;

/**
 * The product (the mock site) is ONE object through the whole film: Figma artboard → code preview → phone → browser.
 * Every stage keeps it in the same band (top 20, height 560), so between stages it slides and reshapes
 * (width, corner radius, phone bezel) instead of leaving the screen. Rendered by build/Product.tsx.
 */
export type Prod = { x: number; y: number; w: number; h: number; r: number; bezel: number };
export const PROD: Prod[] = [
  { x: 360, y: 20, w: 480, h: 560, r: 8, bezel: 0 },
  { x: 730, y: 20, w: 430, h: 560, r: 14, bezel: 0 },
  { x: 836, y: 20, w: 286, h: 560, r: 54, bezel: 12 },
  { x: 540, y: 20, w: 600, h: 560, r: 18, bezel: 0 },
];
/** stage hand-over window around each boundary (s): the outgoing UI leaves while the next one arrives, no empty beat */
export const HAND = { before: 0.4, after: 0.5 };
/** 0 → 1 while stage i hands over to stage i + 1 (0 for the last stage) */
export const handover = (t: number, i: number) =>
  i >= STAGE_SEC.length - 1 ? 0 : smooth(seg(t, STAGE_START[i + 1] - HAND.before, STAGE_START[i + 1] + HAND.after));
/** a stage's own clock in beats (0..BEATS), clamped: before it starts it shows its first frame, after it ends its last */
export const beatsOf = (t: number, i: number) => Math.min(BEATS, Math.max(0, ((t - STAGE_START[i]) / STAGE_SEC[i]) * BEATS));

/**
 * Motion blur budget. Blur only on big moving things (stage whips, title letters, panels with px ≥ BIG_BLUR);
 * small pieces move with translate + opacity only. Off entirely on dense / weak devices (DPR > 1.5 or ≤ 4 cores),
 * where a filter per frame on a scaled stage costs more than it shows. Set once on mount (see Build).
 */
export let MB = true;
export const setMB = (on: boolean) => {
  MB = on;
};
export const BIG_BLUR = 10;
export const blur = (px: number) => (MB && px > 0.05 ? `blur(${px.toFixed(2)}px)` : undefined);

/** motion-blur style for an element that flies in: k = 0 (start) → 1 (settled) */
export const fly = (
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

export const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
});
export const INK = "#1a1714";

/** neutral abstract "product shot" for the mock site (no image files); v picks the palette.
 *  Lit like a studio photo: a window glow, soft contact shadows (radial gradients, no SVG filters: it moves with the film),
 *  a bevelled object with a top-edge highlight and a glossy sphere. */
const VIS = [
  ["#f3f0ea", "#d9d3c8"],
  ["#eef1f5", "#cdd4de"],
  ["#f5eee7", "#dccdbf"],
];
/** static artwork: memoised, it re-rendered every animation frame with the stage */
export const Visual = memo(function Visual({ v = 0 }: { v?: number }) {
  const [a, b] = VIS[v % VIS.length];
  const id = `vis${v % VIS.length}`;
  return (
    <svg viewBox="0 0 432 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.22" cy="0.1" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}floor`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}obj`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#4a4b52" />
          <stop offset="0.45" stopColor="#202126" />
          <stop offset="1" stopColor="#0b0b0e" />
        </linearGradient>
        <linearGradient id={`${id}edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}ball`} cx="0.34" cy="0.28" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#e4e0d9" />
          <stop offset="1" stopColor="#8f897f" />
        </radialGradient>
      </defs>
      <rect width="432" height="180" fill={`url(#${id}bg)`} />
      <rect width="432" height="180" fill={`url(#${id}glow)`} />
      {/* floor line: where the table meets the wall */}
      <rect y="128" width="432" height="52" fill="#000" opacity="0.035" />
      {/* contact shadows */}
      <ellipse cx="292" cy="150" rx="118" ry="16" fill={`url(#${id}floor)`} />
      <ellipse cx="370" cy="151" rx="30" ry="6" fill={`url(#${id}floor)`} />
      <g transform="rotate(-9 290 90)">
        <rect x="226" y="34" width="128" height="104" rx="24" fill={`url(#${id}obj)`} />
        {/* bevel: a soft top edge catches the window light */}
        <rect x="236" y="35.5" width="108" height="2" rx="1" fill={`url(#${id}edge)`} />
        <rect x="240" y="47" width="100" height="6" rx="3" fill="#fff" opacity="0.1" />
      </g>
      <circle cx="368" cy="126" r="24" fill={`url(#${id}ball)`} />
      <ellipse cx="360" cy="116" rx="7" ry="4.5" fill="#fff" opacity="0.7" />
    </svg>
  );
});

/** browser chrome for the mock site: traffic lights, a centred address field with a lock; `right` for status pills */
export function BrowserBar({ url, lock = false, right, h = 34 }: { url: ReactNode; lock?: boolean; right?: ReactNode; h?: number }) {
  return (
    <div className="relative flex items-center gap-1.5 border-b border-black/[0.06] bg-[#ebe6dc] px-3.5" style={{ height: h }}>
      <i className="size-[9px] rounded-full bg-[#ff5f57]" />
      <i className="size-[9px] rounded-full bg-[#febc2e]" />
      <i className="size-[9px] rounded-full bg-[#28c840]" />
      <span
        className="absolute left-1/2 top-1/2 flex h-[22px] min-w-[46%] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-md bg-white/80 px-3 text-[12px] text-[#3f3a33] shadow-[0_1px_0_rgb(0_0_0/0.04)]"
      >
        {lock && <Lock size={11} weight="fill" className="text-[#1f8f5f]" />}
        {url}
      </span>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
}

/** the mock site's own header (logo, brand, page links): the same one on the artboard, in the preview and live.
 *  `size` scales it with the page it sits in (1 = artboard / browser, 0.85 = the narrower preview). */
export const MockNav = memo(function MockNav({ brand, links, size = 1 }: { brand: string; links: readonly string[]; size?: number }) {
  return (
    <div className="flex items-center justify-between text-[#1a1714]" style={{ fontSize: 12 * size, height: 28 * size }}>
      <span className="flex items-center gap-2 font-semibold tracking-[-0.02em]" style={{ fontSize: 13.5 * size }}>
        <span className="grid place-items-center rounded-[6px] bg-[#1a1714]" style={{ width: 18 * size, height: 18 * size }}>
          <span className="rounded-full bg-[#f4f0e8]" style={{ width: 6 * size, height: 6 * size }} />
        </span>
        {brand}
      </span>
      <span className="flex items-center text-[#5c564c]" style={{ gap: 16 * size }}>
        {links.map((l, i) => (
          <span key={l} className={i === 0 ? "font-semibold text-[#1a1714]" : undefined}>
            {l}
          </span>
        ))}
      </span>
    </div>
  );
});

const KW = "#c792ea";
const TG = "#7fdbca";
const AT = "#addb67";
const STR = "#ecc48d";
const PU = "#8b919c";
const TX = "#d6deeb";
type Tok = [string, string];
/** everything the film reads from the copy, per language (built once per language, cached) */
export type B = Content["BUILD"];
function derive(BUILD: B) {
  const C = BUILD.code;
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
  return { BUILD, D: BUILD.design, C, M: BUILD.cms, L: BUILD.launch, LINES, LEN, START, CHARS };
}
const DER = new Map<B, ReturnType<typeof derive>>();
export function useB() {
  const { BUILD } = useContent();
  let d = DER.get(BUILD);
  if (!d) DER.set(BUILD, (d = derive(BUILD)));
  return d;
}
