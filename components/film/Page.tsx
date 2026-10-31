import { CheckCircle, EnvelopeSimple, ArrowRight, Image as ImageIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties, ReactNode } from "react";
import { box, MockNav, useB, Visual } from "../build/shared";
import { Caret, typed } from "../build/util";

/**
 * The layers of the 3D film (Film.tsx). Every layer is one 480 × 560 sheet in page coordinates; the three page
 * layers draw the SAME page at three levels of finish (grid → type → visuals), so seen from the top the stack is
 * always one page that gets better, and when the stack collapses they become one.
 */
export const PW = 480;
export const PH = 560;
/** page blocks (page coordinates) */
export const R = {
  nav: { x: 24, y: 16, w: 432, h: 28 },
  img: { x: 24, y: 56, w: 432, h: 186 },
  signup: { x: 40, y: 218, w: 400, h: 48 },
  title: { x: 24, y: 294, w: 420, h: 44 },
  sub: { x: 24, y: 348, w: 360, h: 18 },
  btn: { x: 24, y: 392, w: 150, h: 46 },
  more: { x: 196, y: 392, w: 110, h: 46 },
  plans: { x: 24, y: 460, w: 432, h: 74 },
};
const PLAN_W = (R.plans.w - 20) / 3;
export const plan = (k: number) => ({ x: R.plans.x + k * (PLAN_W + 10), y: R.plans.y, w: PLAN_W, h: R.plans.h });
/** the code line that makes each block real, and the component name shown on it */
export const CODED = [
  { r: R.img, line: 2, tag: "<Hero>" },
  { r: R.title, line: 3, tag: "<h1>" },
  { r: R.btn, line: 5, tag: "<Button>" },
  { r: R.signup, line: 6, tag: "<Signup>" },
  { r: R.plans, line: 8, tag: "<Plans>" },
];

const sheet = "absolute overflow-hidden rounded-[14px]";
const at = (r: { x: number; y: number; w: number; h: number }, style?: CSSProperties): CSSProperties => ({ ...box(r.x, r.y, r.w, r.h), ...style });

/** 1 · grid: the page as boxes. `pop(i)` 0 → 1 per box (staggered), `coded` 0 → 1 per block turns its outline blue */
export function GridSheet({ pop, coded }: { pop: (i: number) => number; coded: (i: number) => number }) {
  const boxes = [R.nav, R.img, R.title, R.sub, R.btn, R.more, plan(0), plan(1), plan(2)];
  const codeOf = (r: (typeof boxes)[number]) => {
    const i = CODED.findIndex((c) => c.r === r || (r.y === R.plans.y && c.r === R.plans));
    return i < 0 ? 0 : coded(i);
  };
  return (
    <div className={`${sheet} bg-[#f1ede5]`} style={{ width: PW, height: PH }}>
      {/* column guides */}
      {[0, 1, 2, 3, 4, 5].map((c) => (
        <i key={c} className="absolute inset-y-0 w-[64px] bg-[#e8a3b0]/[0.09]" style={{ left: 24 + c * 73.6 }} />
      ))}
      {boxes.map((r, i) => {
        const k = pop(i);
        const c = codeOf(r);
        return (
          <span
            key={i}
            className="absolute rounded-lg"
            style={at(r, {
              opacity: k,
              transform: k < 1 ? `scale(${(0.9 + k * 0.1).toFixed(3)})` : undefined,
              background: `rgb(26 23 20 / ${(0.06 - c * 0.03).toFixed(3)})`,
              outline: `1.5px ${c > 0.5 ? "solid" : "dashed"} color-mix(in srgb, #3d8bff ${(c * 100).toFixed(0)}%, rgb(26 23 20 / 0.28))`,
            })}
          />
        );
      })}
    </div>
  );
}

/** 2 · type: the grid boxes light, the words set in */
export function TypeSheet({ k }: { k: number }) {
  const { BUILD, D } = useB();
  return (
    <div className={`${sheet} bg-[#f3efe8] text-[#1a1714]`} style={{ width: PW, height: PH }}>
      <div className="absolute" style={at(R.nav)}>
        <MockNav brand={BUILD.brand} links={D.pages} />
      </div>
      <span className="absolute rounded-xl bg-[#1a1714]/[0.05]" style={at(R.img)} />
      <p className="absolute whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]" style={at(R.title)}>
        {typed(D.title, k * 1.4)}
        <Caret on={k > 0 && k < 0.75} color="#1a1714" />
      </p>
      <p className="absolute text-[15px] text-[#5c564c]" style={at(R.sub, { opacity: Math.min(1, Math.max(0, k * 2 - 0.8)) })}>
        {D.sub}
      </p>
      <span className="absolute grid place-items-center rounded-full border border-[#1a1714]/30 text-[15px] font-semibold" style={at(R.btn, { opacity: Math.min(1, Math.max(0, k * 2 - 1)) })}>
        {D.button}
      </span>
      {[0, 1, 2].map((i) => (
        <span key={i} className="absolute flex flex-col justify-center rounded-xl bg-[#1a1714]/[0.04] pl-[64px]" style={at(plan(i), { opacity: Math.min(1, Math.max(0, k * 2 - 1)) })}>
          <span className="text-[13px] font-semibold">{D.plans[i].name}</span>
          <span className="text-[12px] text-[#7a7368]">{D.plans[i].price}</span>
        </span>
      ))}
    </div>
  );
}

/** 3 · visuals: the finished page; `edits` = the admin panel's changes to «Стандарт» (sale price, new photo) */
export function VisualSheet({ k, sale = 0, photo = 0, children }: { k: number; sale?: number; photo?: number; children?: ReactNode }) {
  const { BUILD, D, M } = useB();
  const fade = (a: number) => Math.min(1, Math.max(0, (k - a) / 0.35));
  return (
    <div className={`${sheet} bg-[#f4f0e8] text-[#1a1714]`} style={{ width: PW, height: PH }}>
      <div className="absolute" style={at(R.nav)}>
        <MockNav brand={BUILD.brand} links={D.pages} />
      </div>
      <div className="absolute overflow-hidden rounded-xl" style={at(R.img, { clipPath: `inset(${((1 - fade(0)) * 100).toFixed(1)}% 0 0 0 round 12px)` })}>
        <Visual />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold">{D.badge}</span>
      </div>
      <div
        className="absolute flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-[0_12px_30px_-12px_rgb(40_30_20/0.45)]"
        style={at(R.signup, { opacity: fade(0.2), transform: `translateY(${((1 - fade(0.2)) * 14).toFixed(1)}px)` })}
      >
        <EnvelopeSimple size={16} className="text-[#7a7368]" />
        <span className="flex-1 text-[13px] text-[#9a9287]">{D.email}</span>
        <span className="flex h-full items-center rounded-xl bg-[#1a1714] px-4 text-[12px] font-semibold text-[#f4f0e8]">{D.join}</span>
      </div>
      <p className="absolute whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]" style={at(R.title)}>
        {D.title}
      </p>
      <p className="absolute text-[15px] text-[#5c564c]" style={at(R.sub)}>
        {D.sub}
      </p>
      <span
        className="absolute grid place-items-center rounded-full text-[15px] font-semibold text-white"
        style={at(R.btn, { background: `color-mix(in srgb, #1a1714 ${(fade(0.3) * 100).toFixed(0)}%, #c9c5bd)` })}
      >
        {D.button}
      </span>
      <span className="absolute flex items-center gap-1.5 text-[14px] font-semibold" style={at(R.more)}>
        {D.more} <ArrowRight size={14} />
      </span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06)]" style={at(plan(i), { opacity: fade(0.35 + i * 0.1) })}>
          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
            <Visual v={i} />
            {i === 1 && photo > 0 && (
              <span className="absolute inset-0" style={{ opacity: photo }}>
                <Visual v={3} />
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-tight">{D.plans[i].name}</span>
            <span className="mt-1 grid whitespace-nowrap text-[12px] text-[#7a7368]">
              <span className="col-start-1 row-start-1" style={i === 1 && sale > 0 ? { opacity: 1 - sale } : undefined}>
                {D.plans[i].price}
              </span>
              {i === 1 && sale > 0 && (
                <span className="col-start-1 row-start-1 font-semibold text-[#c2410c]" style={{ opacity: sale }}>
                  {M.priceVal} {M.cur}
                </span>
              )}
            </span>
          </span>
        </div>
      ))}
      {children}
    </div>
  );
}

/** 4 · code: the page's source, typed on a dark sheet */
export function CodeSheet({ chars, cur }: { chars: number; cur: number }) {
  const { LINES, START } = useB();
  return (
    <div className={`${sheet} border border-white/10 bg-[#0b0e15]/95`} style={{ width: PW, height: PH }}>
      <div className="absolute inset-x-0 top-0 flex h-10 items-center gap-1.5 border-b border-white/[0.07] px-4">
        <i className="size-2 rounded-full bg-white/15" />
        <i className="size-2 rounded-full bg-white/15" />
        <i className="size-2 rounded-full bg-white/15" />
        <span className="ml-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] text-grey">page.tsx</span>
      </div>
      <div className="absolute inset-x-0 top-14 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[14px] leading-[30px]">
        {LINES.map((line, i) => {
          let left = chars - START[i];
          return (
            <div key={i} className="flex" style={{ opacity: chars > START[i] ? 1 : 0.18, background: i === cur ? "rgb(255 255 255 / 0.04)" : undefined }}>
              <span className="w-10 shrink-0 pr-3 text-right text-[12px] text-faint">{i + 1}</span>
              <span className="whitespace-pre pl-2">
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
    </div>
  );
}

/** 5 · admin panel: the «Стандарт» plan being edited; its price field sits right under the plan's card above */
export const ADMIN = {
  price: { x: 24, y: 452, w: 210, h: 44 },
};
export function AdminSheet({ sel, price, up, photo, stock, pub }: { sel: number; price: number; up: number; photo: number; stock: number; pub: number }) {
  const { M } = useB();
  const field = "absolute flex items-center rounded-xl border px-4 text-[15px] text-fg";
  const lbl = "absolute text-[12px] font-medium text-grey";
  const focus = (on: number) => ({
    borderColor: `color-mix(in srgb, #22d3ee ${(on * 100).toFixed(0)}%, rgb(255 255 255 / 0.1))`,
    background: "rgb(255 255 255 / 0.03)",
    boxShadow: `0 0 0 ${(on * 4).toFixed(1)}px rgb(34 211 238 / 0.12)`,
  });
  const editingPrice = Math.min(1, sel * 3) * (1 - Math.max(0, Math.min(1, (price - 0.98) * 50)));
  return (
    <div className={`${sheet} border border-white/10 bg-[#0d1018]/95 text-fg`} style={{ width: PW, height: PH }}>
      <p className="absolute left-6 top-6 text-[12px] text-grey">{M.crumb}</p>
      <p className="absolute left-6 top-11 text-[20px] font-semibold tracking-[-0.02em]">{M.form}</p>
      <span
        className="absolute right-6 top-7 rounded-full px-3 py-1.5 text-[12px] font-semibold"
        style={{
          background: `color-mix(in srgb, rgb(52 211 153 / 0.15) ${(pub * 100).toFixed(0)}%, rgb(255 255 255 / 0.08))`,
          color: `color-mix(in srgb, #34d399 ${(pub * 100).toFixed(0)}%, #c4cad4)`,
        }}
      >
        {pub > 0.5 ? M.published : M.draft}
      </span>

      <p className={lbl} style={{ left: 24, top: 100 }}>{M.name}</p>
      <span className={field} style={{ ...box(24, 120, 432, 44), ...focus(0) }}>{M.nameVal}</span>

      <p className={lbl} style={{ left: 24, top: 184 }}>{M.photo}</p>
      <div className="absolute flex items-center gap-3 rounded-xl border border-dashed px-3" style={{ ...box(24, 204, 432, 64), borderColor: up > 0 && up < 1 ? "rgb(34 211 238 / 0.6)" : "rgb(255 255 255 / 0.15)" }}>
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06] text-grey">
          <ImageIcon size={18} />
          <span className="absolute inset-0" style={{ opacity: photo }}>
            <Visual v={3} />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between text-[13px] text-body">
            <span className="flex items-center gap-1.5">
              {photo > 0.5 && <CheckCircle size={14} weight="fill" className="text-green" />}
              {up > 0 ? M.file : M.drop}
            </span>
            {up > 0 && <span className="tabular-nums text-grey">{photo > 0.5 ? M.size : `${Math.round(up * 100)}%`}</span>}
          </span>
          {up > 0 && (
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <span className="block h-full origin-left rounded-full bg-cyan" style={{ transform: `scaleX(${up})` }} />
            </span>
          )}
        </span>
      </div>

      <div className="absolute flex items-center justify-between rounded-xl bg-white/[0.035] px-4" style={box(24, 300, 432, 48)}>
        <span className="text-[14px]">{M.stock}</span>
        <span className="relative h-7 w-12 rounded-full" style={{ background: `color-mix(in srgb, #34d399 ${(stock * 100).toFixed(0)}%, rgb(255 255 255 / 0.15))` }}>
          <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow" style={{ transform: `translateX(${(stock * 20).toFixed(1)}px)` }} />
        </span>
      </div>

      <p className={lbl} style={{ left: 24, top: 432 }}>{M.price}</p>
      <span className={`${field} tabular-nums`} style={{ ...box(ADMIN.price.x, ADMIN.price.y, ADMIN.price.w, ADMIN.price.h), ...focus(editingPrice) }}>
        {price > 0 ? (
          <>
            {typed(M.priceVal, price)}
            <Caret on={price < 1} color="#22d3ee" />
          </>
        ) : (
          <span className="rounded-[3px] px-0.5" style={{ background: `rgb(34 211 238 / ${(sel * 0.35).toFixed(3)})` }}>
            {M.priceOld}
          </span>
        )}
        <span className="ml-auto text-grey">{M.cur}</span>
      </span>
      <p className={lbl} style={{ left: 250, top: 432 }}>{M.cat}</p>
      <span className={field} style={{ ...box(250, 452, 206, 44), ...focus(0) }}>{M.catVal}</span>

      <span
        className="absolute grid place-items-center rounded-full text-[14px] font-semibold text-white"
        style={{ ...box(296, 508, 160, 40), background: `color-mix(in srgb, #1f9d68 ${(pub * 100).toFixed(0)}%, #3d8bff)` }}
      >
        {pub > 0.5 ? M.published : M.publish}
      </span>
    </div>
  );
}
