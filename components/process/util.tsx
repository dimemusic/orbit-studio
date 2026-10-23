import type { CSSProperties, ReactNode } from "react";

/** 0..1 progress of t inside [a, b] */
export const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

/** first k (0..1) of a string, by characters */
export const typed = (s: string, k: number) => s.slice(0, Math.round(s.length * Math.min(1, Math.max(0, k))));

/** ease-out cubic */
export const ease = (k: number) => 1 - Math.pow(1 - k, 3);

/** position on a timed path: points are [t, x, y], linear between them with ease */
export function along(t: number, pts: [number, number, number][]) {
  if (t <= pts[0][0]) return { x: pts[0][1], y: pts[0][2] };
  for (let i = 1; i < pts.length; i++) {
    const [t1, x1, y1] = pts[i];
    const [t0, x0, y0] = pts[i - 1];
    if (t <= t1) {
      const k = ease((t - t0) / Math.max(1e-6, t1 - t0));
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k };
    }
  }
  const last = pts[pts.length - 1];
  return { x: last[1], y: last[2] };
}

/** absolutely positioned box inside the 1000×640 stage */
export function Abs({ x, y, w, h, style, className = "", children }: { x: number; y: number; w?: number; h?: number; style?: CSSProperties; className?: string; children?: ReactNode }) {
  return (
    <div className={`absolute ${className}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/** fake mouse pointer */
export function Pointer({ x, y, down = false, color = "#f5f7fa" }: { x: number; y: number; down?: boolean; color?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute z-20 drop-shadow-[0_4px_8px_rgb(0_0_0/0.5)]"
      style={{ left: x, top: y, transform: `scale(${down ? 0.86 : 1})`, transition: "transform .15s" }}
    >
      <path d="M4 2l15 9.5-6.6 1.4L16 21l-3 1.4-3.7-8-5.3 4.6z" fill={color} stroke="#05070d" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** mock app window: title bar with dots + body */
export function Win({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-[14px] border border-white/10 bg-[#0a0d15] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)] ${className}`}>
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-[#0d111a] px-4">
        <i className="size-2.5 rounded-full bg-[#ff5f57]/80" />
        <i className="size-2.5 rounded-full bg-[#febc2e]/80" />
        <i className="size-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-3 text-[12px] text-grey">{title}</span>
      </div>
      <div className="relative h-[calc(100%-36px)]">{children}</div>
    </div>
  );
}

/** blinking text caret */
export function Caret({ on = true, color = "#f5f7fa" }: { on?: boolean; color?: string }) {
  if (!on) return null;
  return <span aria-hidden="true" className="ml-px inline-block h-[0.95em] w-[2px] translate-y-[0.12em] animate-[blink_1s_steps(1)_infinite]" style={{ background: color }} />;
}
