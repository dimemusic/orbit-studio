/** 0..1 progress of t inside [a, b] */
export const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

/** first k (0..1) of a string, by characters */
export const typed = (s: string, k: number) => s.slice(0, Math.round(s.length * Math.min(1, Math.max(0, k))));

/** ease-out cubic */
export const ease = (k: number) => 1 - Math.pow(1 - k, 3);

/** ease-in-out (smootherstep): starts and ends at rest, no jolt */
export const smooth = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** ease-out expo: quick start, long soft settle (the "expensive" feel) */
export const expo = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

/** soft typing: letters appear as a short wave (fade + slight blur + rise), not a hard append */
export function Typed({ text, k, caret = false, color = "#f5f7fa" }: { text: string; k: number; caret?: boolean; color?: string }) {
  const chars = Array.from(text);
  const W = 2.4; // wave length in letters
  const n = (chars.length + W) * Math.min(1, Math.max(0, k));
  const cut = Math.min(chars.length, Math.ceil(n));
  return (
    <>
      {chars.slice(0, cut).map((ch, i) => {
        const a = Math.min(1, Math.max(0, (n - i) / W));
        return (
          <span
            key={i}
            className="inline-block whitespace-pre"
            style={a < 1 ? { opacity: a, filter: `blur(${((1 - a) * 3).toFixed(2)}px)`, transform: `translateY(${((1 - a) * 0.14).toFixed(3)}em)` } : undefined}
          >
            {ch}
          </span>
        );
      })}
      <Caret on={caret} color={color} />
    </>
  );
}

/** position on a timed path: points are [t, x, y], linear between them with ease */
export function along(t: number, pts: [number, number, number][]) {
  if (t <= pts[0][0]) return { x: pts[0][1], y: pts[0][2] };
  for (let i = 1; i < pts.length; i++) {
    const [t1, x1, y1] = pts[i];
    const [t0, x0, y0] = pts[i - 1];
    if (t <= t1) {
      const k = smooth((t - t0) / Math.max(1e-6, t1 - t0));
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k };
    }
  }
  const last = pts[pts.length - 1];
  return { x: last[1], y: last[2] };
}

/** blinking text caret */
export function Caret({ on = true, color = "#f5f7fa" }: { on?: boolean; color?: string }) {
  if (!on) return null;
  return <span aria-hidden="true" className="ml-px inline-block h-[0.95em] w-[2px] translate-y-[0.12em] animate-[blink_1s_steps(1)_infinite]" style={{ background: color }} />;
}
