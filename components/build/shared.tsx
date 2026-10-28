import { memo, type CSSProperties } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";

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

/** neutral abstract "product shot" for the mock site (no image files); v picks the palette */
const VIS = [
  ["#efede9", "#d6d2ca"],
  ["#e9ecf0", "#c8ced7"],
  ["#f1ebe5", "#d9cbbf"],
];
/** static artwork: memoised, it re-rendered every animation frame with the stage */
export const Visual = memo(function Visual({ v = 0 }: { v?: number }) {
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
  return { BUILD, D: BUILD.design, C, M: BUILD.cms, L: BUILD.launch, LINES, LEN, START, CHARS };
}
const DER = new Map<B, ReturnType<typeof derive>>();
export function useB() {
  const { BUILD } = useContent();
  let d = DER.get(BUILD);
  if (!d) DER.set(BUILD, (d = derive(BUILD)));
  return d;
}
