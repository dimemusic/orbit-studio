import { useContent } from "../Lang";
import { seg, smooth } from "../build/util";

export { ease, expo, seg, smooth, typed, Typed } from "../build/util";

/** the fixed stage every frame is drawn on (scaled to fit the box) */
export const SW = 1200;
export const SH = 620;

/** seconds per step: brief, design, code, admin, launch, support */
export const STEP = [3.8, 4.4, 4.2, 4.0, 3.6, 4.0];
export const START = STEP.map((_, i) => STEP.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL = STEP.reduce((a, b) => a + b, 0);
/** the finished frame is held this long before the lap starts again */
export const HOLD = 3.5;
export const CYCLE = TOTAL + HOLD;

export const stepAt = (t: number) => {
  let i = 0;
  while (i < STEP.length - 1 && t >= START[i + 1]) i++;
  return i;
};
/** local 0..1 progress inside a step, from `a` to `b` (fractions of that step) */
export const local = (t: number, i: number, a = 0, b = 1) => seg(t, START[i] + STEP[i] * a, START[i] + STEP[i] * b);
/** seconds into step i (can be negative / beyond) */
export const at = (t: number, i: number) => t - START[i];

/** open / close envelope of a window: k 0..1 opening around `open`, closing around `close` (absolute seconds) */
export function life(t: number, open: number, close = 1e9, inDur = 0.6, outDur = 0.45) {
  const k = smooth(seg(t, open, open + inDur));
  const out = smooth(seg(t, close, close + outDur));
  return { k, out, on: k > 0 && out < 1 };
}

export type Rect = { x: number; y: number; w: number; h: number };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const mix = (a: Rect, b: Rect, k: number): Rect => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

export function useStudio() {
  return useContent().STUDIO;
}
export type S = ReturnType<typeof useStudio>;
