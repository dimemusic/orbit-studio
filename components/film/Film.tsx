import { Check, CheckCircle, ChatCircleDots, Code, EnvelopeSimple, GridFour, ImageSquare, Lock, ShoppingBag, SlidersHorizontal, TextAa, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { box, BrowserBar, SH, SW, useB } from "../build/shared";
import { along, ease, expo, seg, smooth, typed } from "../build/util";
import { AdminSheet, CODED, CodeSheet, GridSheet, PH, plan, PW, R, TypeSheet, VisualSheet } from "./Page";

/**
 * The 3D film: the site as an exploded stack of layers, seen from above at an isometric angle.
 *   Design  · grid, type and visuals drop in one on top of the other: from the top it is one page getting better.
 *   Code    · the source rises in underneath and types itself; each block it makes real turns blue on the grid
 *             and gets its component tag on the page.
 *   Panel   · the admin panel rises at the bottom; one line runs from its price field up to the plan card and
 *             carries every edit (sale price, new photo) up the stack.
 *   Launch  · the stack collapses into one sheet and turns to face us: it is the live site in a browser.
 *   Hold    · the finale: a visitor clicks, a request and an order come in.
 * Everything is a pure function of the film clock `t` (and `hold`), drawn on the fixed 1200 × 620 stage.
 * Only transforms and opacity move; settled 2D content carries no transform (sharp when the stage is scaled).
 */

// ---------- timeline (film seconds; stages start at 0 · 4.2 · 7.6 · 11.4, see build/shared STAGE_SEC) ----------
const G = 100; // gap between layers (px, before the rig's scale)
const DROP = 320; // how far a layer travels to its slot
const T = {
  grid: [0.15, 0.95],
  type: [1.25, 2.0],
  typeK: [1.6, 2.6],
  vis: [2.4, 3.15],
  visK: [2.7, 3.8],
  code: [4.3, 5.0],
  chars: [4.7, 6.9],
  ready: [6.95, 7.3],
  admin: [7.7, 8.4],
  sel: [8.45, 8.6],
  price: [8.65, 9.05],
  pulse1: [9.05, 9.35],
  up: [9.45, 9.9],
  photo: [9.9, 10.1],
  pulse2: [10.05, 10.35],
  stock: [10.4, 10.6],
  pub: [10.8, 11.05],
  collapse: [11.5, 12.6],
  flat: [12.0, 13.4],
  chrome: [13.2, 13.8],
  url: [13.6, 14.1],
  online: [14.2, 14.5],
} as const;
const k = (t: number, [a, b]: readonly [number, number]) => seg(t, a, b);

/** rig: where the stack sits on the stage and how it is turned (iso → flat for the launch) */
const ISO = { x: 700, y: 300, rx: 52, rz: -38, s: 0.72 };
const FLAT = { x: 600, y: 304, rx: 0, rz: 0, s: 0.92 };
const lerp = (a: number, b: number, q: number) => a + (b - a) * q;

/** one sheet of the stack at height z (rig space); children are a 480 × 560 page sheet */
function Sheet({ z, o = 1, children, style }: { z: number; o?: number; children: ReactNode; style?: CSSProperties }) {
  if (o <= 0.001) return null;
  return (
    <div
      className="absolute shadow-[0_40px_70px_-30px_rgb(0_0_0/0.85)]"
      // a sheet at rest at z = 0 carries no transform (sharp once the stack lies flat)
      style={{ left: -PW / 2, top: -PH / 2, width: PW, height: PH, borderRadius: 14, transform: Math.abs(z) > 0.05 ? `translateZ(${z.toFixed(1)}px)` : undefined, opacity: o, ...style }}
    >
      {children}
    </div>
  );
}

export function Film({ t, hold, fin }: { t: number; hold: number; fin: number }) {
  const { CHARS, LEN, LINES, START, C, M, L } = useB();

  // ---- layers ----
  const gridIn = expo(k(t, T.grid));
  const typeIn = expo(k(t, T.type));
  const visIn = expo(k(t, T.vis));
  const codeIn = expo(k(t, T.code));
  const adminIn = expo(k(t, T.admin));
  const collapse = smooth(k(t, T.collapse));
  const flat = smooth(k(t, T.flat));
  const squash = 1 - collapse;

  // code
  const chars = Math.round(k(t, T.chars) * CHARS);
  const lineK = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const cur = t > T.chars[0] && t < T.chars[1] ? LINES.findIndex((_, i) => chars < START[i] + LEN[i]) : -1;
  const coded = (i: number) => ease(Math.min(1, lineK(CODED[i].line) * 1.5));

  // panel edits
  const sel = smooth(k(t, T.sel));
  const price = k(t, T.price);
  const up = k(t, T.up);
  const photoForm = expo(k(t, T.photo));
  const stock = expo(k(t, T.stock));
  const pub = expo(k(t, T.pub));
  const p1 = k(t, T.pulse1);
  const p2 = k(t, T.pulse2);
  // what the page shows: each edit lands when its pulse reaches the card
  const sale = expo(seg(t, T.pulse1[1] - 0.05, T.pulse1[1] + 0.2));
  const photoPage = expo(seg(t, T.pulse2[1] - 0.05, T.pulse2[1] + 0.2));

  // ---- rig ----
  const rig = {
    x: lerp(ISO.x, FLAT.x, flat),
    y: lerp(ISO.y, FLAT.y, flat),
    rx: lerp(ISO.rx, FLAT.rx, flat),
    rz: lerp(ISO.rz, FLAT.rz, flat),
    s: lerp(ISO.s, FLAT.s, flat),
  };
  const settled = flat >= 1;
  // z of each layer (the stack is centred on the grid sheet); collapse brings them all to 0
  const zGrid = 0;
  const zType = (G + (1 - typeIn) * DROP) * squash;
  const zVis = (2 * G + (1 - visIn) * DROP) * squash;
  const zCode = (-G - (1 - codeIn) * DROP) * squash;
  const zAdmin = (-2 * G - (1 - adminIn) * DROP) * squash;
  // under the top sheet only: they melt into it as the stack closes
  const under = 1 - smooth(seg(t, T.collapse[0] + 0.5, T.collapse[1]));

  // launch
  const chrome = expo(k(t, T.chrome));
  const url = typed(L.url, k(t, T.url));
  const online = expo(k(t, T.online));
  const visitors = Math.max(1, Math.round(1 + 23 * ease(seg(hold, 0.5, 4.2))));
  const count = expo(seg(hold, 0.35, 0.8));
  const press = Math.sin(Math.PI * seg(hold, 1.1, 1.35));
  const cursor = along(hold, [
    [0.2, 520, 600],
    [1.1, R.btn.x + R.btn.w * 0.55, R.btn.y + R.btn.h * 0.6],
    [1.35, R.btn.x + R.btn.w * 0.55, R.btn.y + R.btn.h * 0.6],
    [2.6, 300, 500],
    [4.4, 400, 520],
  ]);
  const cursorOn = Math.min(seg(hold, 0.2, 0.5), 1 - seg(hold, 4.2, 4.5));
  // the lap's exit
  const out = fin * fin * fin;

  // the connector from the panel's price field up to the «Стандарт» card (rig space)
  const linkOn = adminIn * under * (t < T.collapse[0] + 0.3 ? 1 : 0);
  const linkX = 204 - PW / 2;
  const linkY = 478 - PH / 2;
  const linkH = Math.max(0, zVis - zAdmin);
  const pulse = (p: number) => (p > 0 && p < 1 ? p : -1);

  return (
    <div
      className="absolute inset-0"
      style={
        out > 0
          ? { transform: `translateX(${(-out * 200).toFixed(1)}px)`, opacity: 1 - out, filter: out > 0.02 ? `blur(${(out * 12).toFixed(1)}px)` : undefined }
          : undefined
      }
    >
      <Legend t={t} gridIn={gridIn} typeIn={typeIn} visIn={visIn} codeIn={codeIn} chars={chars / CHARS} adminIn={adminIn} pub={pub} />

      {/* the stack */}
      <div className="absolute inset-0" style={{ perspective: 2600, perspectiveOrigin: `${rig.x}px ${rig.y}px` }}>
        <div
          className="absolute"
          style={{
            left: rig.x,
            top: rig.y,
            transformStyle: "preserve-3d",
            // flat and settled: no transform at all, so the page is rastered sharp at the stage's scale
            transform: settled ? `scale(${rig.s})` : `rotateX(${rig.rx.toFixed(2)}deg) rotateZ(${rig.rz.toFixed(2)}deg) scale(${rig.s.toFixed(4)})`,
          }}
        >
          <Sheet z={zAdmin} o={adminIn * under}>
            <AdminSheet sel={sel} price={price} up={up} photo={photoForm} stock={stock} pub={pub} />
          </Sheet>
          <Sheet z={zCode} o={codeIn * under}>
            <CodeSheet chars={chars} cur={cur} />
          </Sheet>
          <Sheet z={zGrid} o={gridIn * under} style={{ transformOrigin: "50% 50%", ...(gridIn < 1 ? { transform: `translateZ(0) scale(${(0.94 + gridIn * 0.06).toFixed(3)})` } : {}) }}>
            <GridSheet pop={(i) => expo(seg(t, 0.45 + i * 0.06, 0.95 + i * 0.06))} coded={(i) => coded(i)} />
          </Sheet>
          <Sheet z={zType} o={typeIn * under}>
            <TypeSheet k={k(t, T.typeK)} />
          </Sheet>
          {/* the browser around the finished page (only once it faces us) */}
          {chrome > 0 && (
            <div
              className="absolute overflow-hidden rounded-[16px] bg-[#ebe6dc] shadow-[0_50px_110px_-30px_rgb(0_0_0/0.95)]"
              style={{
                left: -PW / 2 - 1,
                top: -PH / 2 - 36,
                transform: "translateZ(-0.5px)",
                width: PW + 2,
                height: PH + 37,
                opacity: chrome,
                boxShadow: `0 0 0 1px rgb(52 211 153 / ${(online * 0.5).toFixed(3)}), 0 50px 110px -30px rgb(0 0 0 / 0.95)`,
              }}
            >
              <BrowserBar
                h={36}
                lock={online > 0.5}
                url={url}
                right={
                  <span className="flex items-center gap-1.5 rounded-full bg-[#1f8f5f]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#1f8f5f]" style={{ opacity: online }}>
                    <span className="size-1.5 rounded-full bg-[#1f8f5f]" />
                    <span className="grid overflow-hidden">
                      <span className="col-start-1 row-start-1" style={{ transform: `translateY(${(-count * 110).toFixed(1)}%)`, opacity: 1 - count }}>
                        {L.online}
                      </span>
                      <span className="col-start-1 row-start-1 whitespace-nowrap tabular-nums" style={{ transform: `translateY(${((1 - count) * 110).toFixed(1)}%)`, opacity: count }}>
                        {visitors} {L.visitors}
                      </span>
                    </span>
                  </span>
                }
              />
            </div>
          )}
          <Sheet z={zVis} o={visIn} style={chrome > 0 ? { borderRadius: "0 0 14px 14px" } : undefined}>
            <VisualSheet k={k(t, T.visK)} sale={sale} photo={photoPage}>
              {/* component tags while the code makes each block real */}
              {CODED.map((c, i) => {
                const q = coded(i) * under;
                if (q <= 0) return null;
                return (
                  <span
                    key={c.tag}
                    className="absolute rounded-md bg-[#3d8bff] px-1.5 py-0.5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[11px] font-semibold text-white"
                    style={{ left: c.r.x, top: c.r.y - 22, opacity: q, transform: `translateY(${((1 - q) * 6).toFixed(1)}px)` }}
                  >
                    {c.tag}
                  </span>
                );
              })}
              {/* the card being edited: lit while the panel works on it */}
              {adminIn > 0 && under > 0 && (
                <span
                  className="pointer-events-none absolute rounded-xl"
                  style={{ ...box(plan(1).x - 3, plan(1).y - 3, plan(1).w + 6, plan(1).h + 6), boxShadow: `0 0 0 2px rgb(34 211 238 / ${(adminIn * (1 - pub) * 0.9).toFixed(3)})` }}
                />
              )}
              {/* the first visitor */}
              {cursorOn > 0 && (
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="absolute z-[2] [filter:drop-shadow(0_2px_3px_rgb(0_0_0/0.35))]" style={{ left: cursor.x - 4, top: cursor.y - 2, opacity: cursorOn, transform: `scale(${(1 - press * 0.12).toFixed(3)})`, transformOrigin: "4px 2px" }}>
                  <path d="M4 2v17.2l4.1-3.9 2.9 6.6 2.9-1.25-2.85-6.45h5.9z" fill="#1a1714" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              )}
              {press > 0 && <span className="pointer-events-none absolute rounded-full" style={{ ...box(R.btn.x, R.btn.y, R.btn.w, R.btn.h), boxShadow: `0 0 0 ${(press * 8).toFixed(1)}px rgb(26 23 20 / ${(press * 0.18).toFixed(3)})` }} />}
            </VisualSheet>
          </Sheet>
          {/* the link: panel price field → plan card, standing upright between the layers; pulses carry the edits */}
          {linkOn > 0 && linkH > 1 && (
            <div className="absolute" style={{ left: linkX - 1, top: linkY, width: 2, height: linkH, transformOrigin: "50% 0", transform: `translateZ(${zAdmin.toFixed(1)}px) rotateX(90deg)`, opacity: linkOn }}>
              <span className="absolute inset-0 bg-[#22d3ee]/70" style={{ clipPath: `inset(0 0 ${((1 - smooth(seg(t, T.admin[1] - 0.1, T.admin[1] + 0.35))) * 100).toFixed(1)}% 0)` }} />
              {[pulse(p1), pulse(p2)].map((p, i) =>
                p >= 0 ? <span key={i} className="absolute -left-[4px] size-[10px] rounded-full bg-[#22d3ee] shadow-[0_0_0_3px_rgb(34_211_238/0.25)]" style={{ top: p * linkH - 5 }} /> : null,
              )}
            </div>
          )}
        </div>
      </div>

      {/* side notes in 2D: the build, the publish, the finale */}
      <SideNote at={{ x: 880, y: 500, w: 240 }} k={expo(k(t, T.ready)) * (1 - smooth(k(t, T.admin)))}>
        <CheckCircle size={18} weight="fill" className="text-green" />
        <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[13px] text-body">{C.cmd}</span>
        <span className="ml-auto text-[13px] font-semibold text-green">{C.ok}</span>
      </SideNote>
      <SideNote at={{ x: 880, y: 40, w: 240 }} k={pub * (1 - smooth(k(t, T.collapse)))}>
        <CheckCircle size={18} weight="fill" className="text-green" />
        <span className="text-[14px] text-green">{M.toast}</span>
      </SideNote>
      {L.events.map((e, i) => {
        const q = expo(seg(hold, 0.5 + i, 1.05 + i));
        if (q <= 0) return null;
        const below = L.events.reduce((n, _, j) => n + (j > i ? smooth(seg(hold, 0.5 + j, 0.95 + j)) : 0), 0);
        const Ic = [UserCircle, EnvelopeSimple, ShoppingBag][i];
        const c = ["#5aa2ff", "#a78bfa", "#34d399"][i];
        return (
          <SideNote key={e.t} at={{ x: 860, y: 60 + below * 70, w: 260 }} k={q} dx={40}>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ background: `${c}26`, color: c }}>
              <Ic size={18} weight="fill" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[14px] font-semibold text-fg">{e.t}</span>
              <span className="mt-0.5 block truncate text-[12px] text-grey">{e.d}</span>
            </span>
          </SideNote>
        );
      })}
      {/* launch checklist replaces the legend */}
      <Checklist t={t} />
    </div>
  );
}

/** a small floating panel in stage coordinates (2D) */
function SideNote({ at, k, dx = 0, children }: { at: { x: number; y: number; w: number }; k: number; dx?: number; children: ReactNode }) {
  if (k <= 0.001) return null;
  return (
    <div className="tool flex min-h-[52px] items-center gap-3 px-3.5" style={{ ...box(at.x, at.y, at.w), opacity: Math.min(1, k * 1.4), transform: k < 1 ? `translate(${((1 - k) * dx).toFixed(1)}px, ${((1 - k) * (dx ? 0 : 14)).toFixed(1)}px)` : undefined }}>
      {children}
    </div>
  );
}

/** the legend: the stack's layers, each lighting up as it arrives (left of the stack) */
const LAYER_ICON = [GridFour, TextAa, ImageSquare, Code, SlidersHorizontal];
const LAYER_COLOR = ["#a78bfa", "#a78bfa", "#a78bfa", "#5aa2ff", "#22d3ee"];
function Legend({ t, gridIn, typeIn, visIn, codeIn, chars, adminIn, pub }: { t: number; gridIn: number; typeIn: number; visIn: number; codeIn: number; chars: number; adminIn: number; pub: number }) {
  const { BUILD } = useB();
  const LAY = BUILD.layers;
  const gone = smooth(seg(t, T.collapse[0] - 0.1, T.collapse[0] + 0.4));
  if (gone >= 1) return null;
  const arrive = [gridIn, typeIn, visIn, codeIn, adminIn];
  const done = [gridIn >= 0.98, typeIn >= 0.98 && t > T.typeK[1], visIn >= 0.98 && t > T.visK[1], chars >= 1, pub > 0.5];
  const progress = [k(t, T.grid), k(t, T.typeK), k(t, T.visK), chars, seg(t, T.admin[0], T.pub[1])];
  const active = done.findIndex((d, i) => !d && arrive[i] > 0);
  return (
    <div className="tool absolute p-4" style={{ ...box(60, 120, 280, 0), height: "auto", opacity: (1 - gone) * Math.min(1, gridIn * 1.5), transform: gone > 0 ? `translateX(${(-gone * 40).toFixed(1)}px)` : undefined }}>
      <p className="tool-label px-1">{LAY.label}</p>
      {/* top of the list = top of the stack */}
      <ul className="mt-3 flex flex-col gap-1.5">
        {[2, 1, 0, 3, 4].map((i) => {
          const Ic = LAYER_ICON[i];
          const on = arrive[i];
          return (
            <li
              key={i}
              className="flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors duration-300"
              style={{ opacity: 0.35 + 0.65 * Math.min(1, on * 1.5), background: active === i ? "rgb(255 255 255 / 0.05)" : undefined }}
            >
              <span className="grid size-7 place-items-center rounded-lg" style={{ background: `${LAYER_COLOR[i]}22`, color: LAYER_COLOR[i] }}>
                <Ic size={15} weight="bold" />
              </span>
              <span className="flex-1 text-[14px] text-fg">{LAY.items[i]}</span>
              <span className="relative grid size-5 place-items-center">
                {done[i] ? (
                  <span className="grid size-5 place-items-center rounded-full text-green" style={{ background: "rgb(52 211 153 / 0.14)", boxShadow: "inset 0 0 0 1px rgb(52 211 153 / 0.45)" }}>
                    <Check size={11} weight="bold" />
                  </span>
                ) : on > 0 ? (
                  <span className="size-4 rounded-full" style={{ background: `conic-gradient(${LAYER_COLOR[i]} ${(progress[i] * 360).toFixed(0)}deg, rgb(255 255 255 / 0.1) 0deg)`, mask: "radial-gradient(circle, transparent 52%, #000 56%)", WebkitMask: "radial-gradient(circle, transparent 52%, #000 56%)" }} />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** launch: the checklist that replaces the legend while the stack closes */
const CHECK_AT = [12.6, 13.1, 13.6, 14.1];
const CHECK_ICON = [Lock, ImageSquare, TextAa, ChatCircleDots];
function Checklist({ t }: { t: number }) {
  const { L } = useB();
  const inK = expo(seg(t, T.collapse[0] + 0.2, T.collapse[0] + 0.8));
  if (inK <= 0) return null;
  return (
    <div className="absolute" style={{ ...box(60, 150, 260), opacity: inK, transform: inK < 1 ? `translateX(${((1 - inK) * -30).toFixed(1)}px)` : undefined }}>
      <p className="tool-label flex justify-between px-1">
        {L.listLabel}
        <span className="tabular-nums text-fg">
          {CHECK_AT.filter((a) => t >= a).length}/{L.items.length}
        </span>
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {L.items.map((it, i) => {
          const d = expo(seg(t, CHECK_AT[i], CHECK_AT[i] + 0.3));
          const Ic = CHECK_ICON[i];
          return (
            <li key={it.t} className="tool flex items-center gap-3 px-3.5 py-3">
              <Ic size={18} className="shrink-0 text-grey" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-fg">{it.t}</span>
                <span className="block truncate text-[12px] text-grey">{it.d}</span>
              </span>
              <span className="grid size-6 shrink-0 place-items-center rounded-full text-green" style={{ opacity: d, transform: `scale(${d.toFixed(3)})`, background: "rgb(52 211 153 / 0.14)", boxShadow: "inset 0 0 0 1px rgb(52 211 153 / 0.45)" }}>
                <Check size={12} weight="bold" />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The film's box: the 1200 × 620 stage scaled to fit (desktop). Phones and tablets (< 64rem) see the middle of it
 * (the stack) cropped to the box width. Renders only after measuring and once the visitor showed signs of life
 * (pointer, touch, scroll, key) or the box is on screen, so the film stays out of the page's first load.
 */
const CROP = { x: 340, w: 790 };
export function FilmBox({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0, mobile: false });
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 63.99rem)");
    const measure = () => {
      const r = el.getBoundingClientRect();
      setFit({ w: r.width, h: r.height, mobile: mq.matches });
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
  useEffect(() => {
    if (awake) return;
    const wake = () => setAwake(true);
    if (ref.current && ref.current.getBoundingClientRect().top < window.innerHeight) return wake();
    const evs = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true, once: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, wake));
  }, [awake]);
  const k = fit.mobile ? fit.w / CROP.w : Math.min(fit.w / SW, fit.h / SH);
  const ready = awake && fit.w > 0 && (fit.mobile || fit.h > 0);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative z-[1] mx-gutter mb-8 mt-6 min-h-[240px] flex-1 overflow-hidden max-lg:mx-0 max-lg:min-h-0 max-lg:flex-none"
      style={fit.mobile && fit.w ? { height: SH * k } : undefined}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: SW,
          height: SH,
          transform: `translate(-50%, -50%) translateX(${fit.mobile ? ((SW / 2 - (CROP.x + CROP.w / 2)) * k).toFixed(1) : 0}px) scale(${k.toFixed(4)})`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {ready && children}
      </div>
    </div>
  );
}
