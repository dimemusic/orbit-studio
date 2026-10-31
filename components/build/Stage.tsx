import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SH, SW } from "./shared";

/**
 * Phones and tablets (< 1024px): the 1200×620 desktop stage shrinks to nothing, so each stage instead shows ONE part of itself,
 * cropped and scaled to fill the box (design: the artboard, code: the editor + terminal, CMS: the product form, launch: the browser).
 * The desktop layout is untouched; the crop is applied per stage layer so the whips between stages stay smooth.
 */
const FOCUS = [
  { x: 360, y: 20, w: 480, h: 560 },
  { x: 40, y: 20, w: 640, h: 560 },
  { x: 40, y: 20, w: 540, h: 560 },
  { x: 540, y: 20, w: 600, h: 560 },
];
type Fit = { mobile: boolean; w: number; h: number };
const FitCtx = createContext<Fit>({ mobile: false, w: 0, h: 0 });
/** the stage box's fit: `mobile` = cropped phone / tablet mode */
export const useFit = () => useContext(FitCtx);
/** mobile crop of stage i: transform for its layer (origin 0 0) */
const cropOf = (i: number, f: Fit) => {
  const r = FOCUS[i];
  // width decides the scale; the box height follows the current stage (StageBox)
  const c = Math.min(f.w / r.w, (window.innerHeight * 0.58) / r.h);
  // centred horizontally, pinned to the top so the stage sits right under the stage title
  return { c, tx: (f.w - r.w * c) / 2 - r.x * c, ty: -r.y * c };
};

export function StageBox({ cur, children }: { cur: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit & { k: number }>({ mobile: false, w: 0, h: 0, k: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 63.99rem)");
    const measure = () => {
      const r = el.getBoundingClientRect();
      setFit({ mobile: mq.matches, w: r.width, h: r.height, k: Math.min(r.width / SW, r.height / SH) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);
  // the film is below the fold: its stages are heavy, so they mount only once the visitor shows signs of life
  // (pointer, touch, scroll, key) or the box is already on screen; until then the page loads without that work
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    if (awake) return;
    const el = box.current;
    const wake = () => setAwake(true);
    if (el && el.getBoundingClientRect().top < window.innerHeight) return wake();
    const evs = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true, once: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake));
  }, [awake]);
  const ready = awake && (fit.mobile ? fit.w > 0 : fit.k > 0);
  return (
    <div
      ref={box}
      aria-hidden="true"
      className="relative z-[1] mx-gutter mb-8 mt-6 min-h-[240px] flex-1 max-lg:mt-6 max-lg:min-h-0 max-lg:flex-none max-lg:overflow-visible max-lg:transition-[height] max-lg:duration-500 max-lg:ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={fit.mobile && fit.w ? { height: FOCUS[cur].h * cropOf(cur, fit).c } : undefined}
    >
      <FitCtx.Provider value={fit}>
        <div
          className={fit.mobile ? "absolute left-0 top-0" : "absolute left-1/2 top-1/2"}
          style={{
            width: SW,
            height: SH,
            transform: fit.mobile ? undefined : `translate(-50%, -50%) scale(${fit.k})`,
            visibility: ready ? "visible" : "hidden",
          }}
        >
          {/* the stage is measured on the client first: rendering it only then also keeps its float-heavy inline styles out of SSR (no hydration mismatch) */}
          {ready && children}
        </div>
      </FitCtx.Provider>
    </div>
  );
}

/** one stage layer: whip transform while it moves + the phone crop (if any) */
/** each stage's glass panels take its own tint (design violet, code blue, panel cyan, launch green): `--tint` in globals.css */
const TINT = ["139 92 246", "61 139 255", "34 211 238", "52 211 153"];

export function StageLayer({ i, whip, children }: { i: number; whip: CSSProperties | undefined; children: ReactNode }) {
  const f = useContext(FitCtx);
  const tint = { "--tint": TINT[i] } as CSSProperties;
  if (!f.mobile) return <div className="absolute inset-0" style={{ ...tint, ...whip }}>{children}</div>;
  const { c, tx, ty } = cropOf(i, f);
  const r = FOCUS[i];
  const crop = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${c.toFixed(4)})`;
  // only the focus part is shown: neighbours (panels, toasts) are clipped away
  // a few px of air so the panels' own rounded corners and shadows are not cut
  const clip = `inset(${r.y - 6}px ${SW - r.x - r.w - 6}px ${SH - r.y - r.h - 6}px ${r.x - 6}px)`;
  return (
    <div className="absolute inset-0 origin-top-left" style={{ ...tint, ...whip, clipPath: clip, transform: whip?.transform ? `${whip.transform} ${crop}` : crop }}>
      {children}
    </div>
  );
}
