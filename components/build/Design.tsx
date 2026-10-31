import {
  ArrowDown,
  ArrowRight,
  ArrowsOut,
  ArrowsOutLineVertical,
  CaretDown,
  Cursor,
  Drop,
  EnvelopeSimple,
  FrameCorners,
  Hand,
  Image as ImageIcon,
  PenNib,
  Rows,
  Square,
  SquaresFour,
  TextAa,
  TextAlignLeft,
  TextT,
} from "@phosphor-icons/react/dist/ssr";
import { Fragment, memo, type ReactNode } from "react";
import { along, expo, seg, smooth, Typed } from "./util";
import { SW, fly, box, INK, Visual, useB } from "./shared";

/* ---------------- 1 · Design ---------------- */
const AB = { x: 360, y: 20, w: 480, h: 560 };
/** element rects inside the artboard: assembled AND selected from the same numbers, so the selection always fits */
type Rc = { x: number; y: number; w: number; h: number };
const R = {
  img: { x: 24, y: 24, w: 432, h: 186 },
  title: { x: 24, y: 262, w: 420, h: 48 },
  btn: { x: 24, y: 360, w: 150, h: 46 },
  plans: { x: 24, y: 428, w: 432, h: 74 },
};
const PLAN_W = (R.plans.w - 20) / 3;
const SWATCHES = ["#e8492a", "#a78bfa", "#22d3ee", INK];
const TOOLS = [Cursor, FrameCorners, Square, TextT, PenNib, Hand];
/** two sidebars, exactly as tall as the artboard and 40px from it on both sides */
const LS = { x: 60, y: 20, w: 260, h: 560 };
const RS = { x: 880, y: 20, w: 260, h: 560 };
/** component tiles (left sidebar, bottom section): the sources the button and cards fly out of */
const tile = (i: number) => ({
  x: LS.x + 16 + (i % 2) * 118,
  y: LS.y + 438 + Math.floor(i / 2) * 48,
  w: 110,
  h: 40,
});
/** hairline between sidebar sections */
const Hr = ({ y }: { y: number }) => <i className="absolute inset-x-0 h-px bg-white/[0.07]" style={{ top: y }} />;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const label = "text-[11px] font-semibold uppercase tracking-[0.1em] text-grey";
const cell = "flex h-[34px] items-center gap-2 rounded-lg bg-white/[0.05] px-2.5 text-[13px] tabular-nums text-body";

const VI = "#a78bfa"; // designer
const CY = "#22d3ee"; // copywriter
const GR = "#34d399"; // client
/** swatch centres in the Fill panel */
const swatch = (i: number) => ({ x: RS.x + 32 + i * 42 + 4, y: RS.y + 478 + 6 });
/** where a hand holds an element it drags */
const grab = (r: Rc) => ({ x: r.x + r.w * 0.55, y: r.y + r.h * 0.62 });

/** the design beats shared by the tools (DesignStage) and the artboard itself (DesignScreen) */
function beats(s: number) {
  const pick = seg(s, 2.24, 2.5);
  const hover = Math.min(3, Math.floor(pick * 4));
  return {
    img: expo(seg(s, 1.02, 1.4)),
    badge: expo(seg(s, 1.25, 1.5)),
    signup: expo(seg(s, 1.3, 1.62)),
    title: seg(s, 1.46, 1.84),
    sub: expo(seg(s, 1.78, 2.04)),
    btnFly: smooth(seg(s, 1.85, 2.12)),
    more: expo(seg(s, 2.0, 2.25)),
    pick,
    hover,
    planFly: (k: number) => smooth(seg(s, 2.22 + k * 0.03, 2.5 + k * 0.03)),
    btnColor: s >= 2.5 ? SWATCHES[3] : pick > 0 ? SWATCHES[hover] : "#c9c5bd",
  };
}
/** the designer drags the artboard frame open (0 → 1): the product frame (build/Product.tsx) clips to it */
export const designFrame = (s: number) => smooth(seg(s, 0.4, 0.95));

export function DesignStage({ s }: { s: number }) {
  const { D } = useB();
  // a team in one file: the designer, the copywriter and the client work at the same time, each with their own cursor and selection colour
  const pan = (i: number) => expo(seg(s, 0.02 + i * 0.04, 0.55 + i * 0.04));
  const frame = designFrame(s);
  const { btnFly, pick, planFly, hover, btnColor } = beats(s);
  const comment = expo(seg(s, 2.32, 2.6));

  const at = (r: Rc): Rc => ({ x: AB.x + r.x, y: AB.y + r.y, w: r.w, h: r.h });
  const glide = (list: Rc[], times: number[]) => {
    let i = 0;
    while (i < times.length - 1 && s >= times[i + 1]) i++;
    const g = i ? smooth(seg(s, times[i], times[i] + 0.12)) : 1;
    const from = list[Math.max(0, i - 1)];
    const to = list[i];
    return { i, r: { x: lerp(from.x, to.x, g), y: lerp(from.y, to.y, g), w: lerp(from.w, to.w, g), h: lerp(from.h, to.h, g) } };
  };
  // designer: frame → photo → button
  const V = glide([{ x: AB.x, y: AB.y, w: AB.w * frame, h: AB.h * frame }, at(R.img), at(R.btn)], [0.4, 1.02, 2.02]);
  // copywriter: title → plans
  const C = glide([at(R.title), at(R.plans)], [1.46, 2.34]);
  const selBox = V.r;
  const tool = s < 1.0 ? 1 : s < 1.4 ? 2 : 0;
  const rowV = [0, 1, 5][V.i];
  const rowC = s < 1.46 ? -1 : [3, 6][C.i];
  const titleOn = s > 1.46 && s < 2.34;
  const fillHex = V.i === 2 ? btnColor : V.i === 1 ? "#efede9" : "#f4f0e8";

  // a component instance flies from its tile in the components panel to its place on the artboard
  const flyRect = (k: number, src: Rc, dst: Rc): Rc => ({
    x: lerp(src.x, dst.x, k),
    y: lerp(src.y, dst.y, k) - Math.sin(Math.PI * k) * 40,
    w: lerp(src.w, dst.w, k),
    h: lerp(src.h, dst.h, k),
  });
  const ghost = (k: number, src: Rc, dst: Rc, children: ReactNode, cls: string, bg?: string) => {
    if (!(k > 0 && k < 1)) return null;
    const r = flyRect(k, src, dst);
    return (
      <div
        className={`pointer-events-none absolute z-10 ${cls}`}
        style={{
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          background: bg,
          boxShadow: `0 ${20 * Math.sin(Math.PI * k)}px 40px -12px rgb(0 0 0 / 0.6)`,
          willChange: "left, top, width, height",
        }}
      >
        {children}
      </div>
    );
  };
  const planDst = (k: number): Rc => ({ x: AB.x + R.plans.x + k * (PLAN_W + 10), y: AB.y + R.plans.y, w: PLAN_W, h: R.plans.h });

  // cursors: paths between actions, pinned to whatever they are dragging
  const btnHand = grab(flyRect(btnFly, tile(0), at(R.btn)));
  const vPin =
    s > 0.4 && s < 0.95
      ? { x: AB.x + AB.w * frame, y: AB.y + AB.h * frame }
      : s > 1.85 && s < 2.12
        ? btnHand
        : s > 2.24 && s < 2.5
          ? { x: lerp(swatch(0).x, swatch(3).x, pick), y: swatch(0).y }
          : null;
  const vPos =
    vPin ??
    along(s, [
      [0, 300, 660],
      [0.38, AB.x, AB.y],
      [0.95, AB.x + AB.w, AB.y + AB.h],
      [1.04, AB.x + 250, AB.y + 150],
      [1.4, AB.x + 300, AB.y + 196],
      [1.8, grab(tile(0)).x, grab(tile(0)).y],
      [2.12, grab(at(R.btn)).x, grab(at(R.btn)).y],
      [2.24, swatch(0).x, swatch(0).y],
      [2.5, swatch(3).x, swatch(3).y],
      [3, swatch(3).x + 34, swatch(3).y - 22],
    ]);
  const cPin = s > 2.22 && s < 2.5 ? grab(flyRect(planFly(0), tile(1), planDst(0))) : null;
  const cPos =
    cPin ??
    along(s, [
      [0, 1250, 330],
      [1.08, 1250, 330],
      [1.44, AB.x + R.title.x + 6, AB.y + R.title.y + 26],
      [1.5, AB.x + R.title.x + 6, AB.y + R.title.y + 26],
      [1.84, AB.x + 210, AB.y + R.title.y + R.title.h + 46],
      [2.18, grab(tile(1)).x, grab(tile(1)).y],
      [2.22, grab(tile(1)).x, grab(tile(1)).y],
      [2.5, grab(planDst(0)).x, grab(planDst(0)).y],
      [3, grab(planDst(1)).x + 20, grab(planDst(1)).y - 46],
    ]);
  const pinAt = { x: AB.x + 318, y: AB.y + R.btn.y + 4 };
  const gPos = along(s, [
    [0, 760, 700],
    [1.92, 760, 700],
    [2.3, pinAt.x + 6, pinAt.y + 8],
    [2.36, pinAt.x + 6, pinAt.y + 8],
    [3, pinAt.x + 60, pinAt.y + 70],
  ]);

  return (
    <>
      {/* left sidebar: tools · pages · layers · components, one panel with hairline sections (Figma-like) */}
      <div className="tool overflow-hidden" style={{ ...box(LS.x, LS.y, LS.w, LS.h), ...fly(pan(0), -160, 0) }}>
        <div className="absolute inset-x-4" style={{ top: 16, ...fly(pan(1), -20, 0, 4) }}>
          <p className={`${label} flex h-5 items-center justify-between`}>
            {D.pagesLabel}
            <span className="flex -space-x-1.5">
              {[VI, CY, GR].map((c, i) => (
                <span
                  key={c}
                  className="grid size-5 place-items-center rounded-full border-2 border-[#0a0d15] text-[9px] font-bold normal-case tracking-normal text-[#05070d]"
                  style={{ background: c }}
                >
                  {D.team[i].name[0]}
                </span>
              ))}
            </span>
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 text-[13px]">
            {D.pages.map((p, i) => (
              <li key={p} className={`flex h-[26px] items-center justify-between rounded-md px-2 ${i === 0 ? "bg-white/[0.06] text-fg" : "text-body"}`}>
                {p}
                {i === 0 && <span className="text-[11px] tabular-nums text-grey">1440</span>}
              </li>
            ))}
          </ul>
        </div>
        <Hr y={138} />
        <div className="absolute inset-x-4" style={{ top: 152, ...fly(pan(2), -20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.layersLabel}</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {D.layers.map((l, i) => {
              const at0 = [0.4, 1.02, 1.3, 1.46, 1.78, 1.85, 2.22][i];
              const on = expo(seg(s, at0, at0 + 0.25));
              const Ic = [FrameCorners, ImageIcon, Rows, TextT, TextAlignLeft, Square, SquaresFour][i];
              return (
                <li
                  key={l}
                  className={`flex h-[28px] items-center gap-2 rounded-md px-2 text-[13px] ${i === rowV || i === rowC ? "text-fg" : "text-body"}`}
                  style={{
                    ...fly(on, -12, 0, 4),
                    paddingLeft: i ? 24 : 8,
                    background: i === rowV ? "rgb(167 139 250 / 0.2)" : i === rowC ? "rgb(34 211 238 / 0.16)" : undefined,
                    transition: "background-color .3s",
                  }}
                >
                  <Ic size={13} className="shrink-0 text-grey" />
                  {l}
                </li>
              );
            })}
          </ul>
        </div>
        <Hr y={400} />
        <p className={`${label} absolute inset-x-4 flex h-4 items-center`} style={{ top: 414, ...fly(pan(3), -20, 0, 4) }}>
          {D.compLabel}
        </p>
        {D.comps.map((c, i) => {
          const r = tile(i);
          const hot = i === 0 && btnFly > 0 && btnFly < 1 ? VI : i === 1 && planFly(0) > 0 && planFly(2) < 1 ? CY : null;
          return (
            <div
              key={c}
              className="absolute flex items-center gap-2.5 rounded-lg border bg-white/[0.04] px-2.5 transition-colors duration-300"
              style={{ ...box(r.x - LS.x, r.y - LS.y, r.w, r.h), ...fly(pan(3), -20, 0, 4), borderColor: hot ?? "transparent" }}
            >
              <span className="grid w-7 shrink-0 place-items-center">
                {i === 0 && <span className="h-2.5 w-7 rounded-full bg-white/70" />}
                {i === 1 && <span className="h-4 w-6 rounded bg-white/25" />}
                {i === 2 && <span className="h-2.5 w-7 rounded border border-white/40" />}
                {i === 3 && <span className="h-2.5 w-5 rounded-full bg-violet-soft/70" />}
              </span>
              <span className="text-[12px] text-body">{c}</span>
            </div>
          );
        })}
      </div>

      {/* floating toolbar: bottom centre of the canvas, as in Figma */}
      <div
        className="tool z-20 flex items-center gap-1 p-1.5"
        style={{ ...box(SW / 2 - 112, AB.y + AB.h - 52, 224, 44), ...fly(pan(1), 0, 40, 8), borderRadius: 14 }}
      >
        {TOOLS.map((Ic, i) => (
          <span key={i} className={`grid size-8 place-items-center rounded-lg transition-colors duration-300 ${i === tool ? "bg-violet text-white" : "text-grey"}`}>
            <Ic size={16} />
          </span>
        ))}
      </div>

      {/* right sidebar: properties · auto layout · text · fill · effects */}
      <div className="tool overflow-hidden" style={{ ...box(RS.x, RS.y, RS.w, RS.h), ...fly(pan(0), 160, 0) }}>
        <div className="absolute inset-x-4" style={{ top: 16, ...fly(pan(1), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.props}</p>
          <div className="mt-[6px] grid grid-cols-2 gap-2">
            {(
              [
                ["X", selBox.x - AB.x],
                ["Y", selBox.y - AB.y],
                ["W", selBox.w],
                ["H", selBox.h],
              ] as const
            ).map(([k, v]) => (
              <span key={k} className={cell}>
                <span className="text-grey">{k}</span> {Math.round(v)}
              </span>
            ))}
          </div>
        </div>
        <Hr y={128} />
        <div className="absolute inset-x-4" style={{ top: 142, ...fly(pan(1), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.layout}</p>
          <div className="mt-[6px] grid grid-cols-[auto_1fr_1fr] gap-2">
            <span className="flex h-[34px] items-center gap-0.5 rounded-lg bg-white/[0.05] px-1">
              <span className="grid size-6 place-items-center rounded-md bg-violet text-white">
                <ArrowDown size={12} weight="bold" />
              </span>
              <span className="grid size-6 place-items-center rounded-md text-grey">
                <ArrowRight size={12} weight="bold" />
              </span>
            </span>
            <span className={cell}>
              <ArrowsOutLineVertical size={13} className="text-grey" /> 24
            </span>
            <span className={cell}>
              <ArrowsOut size={13} className="text-grey" /> 24
            </span>
          </div>
        </div>
        <Hr y={212} />
        <div className="absolute inset-x-4" style={{ top: 226, ...fly(pan(2), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.text}</p>
          <div className="mt-[6px] flex flex-col gap-2 transition-opacity duration-300" style={{ opacity: titleOn ? 1 : 0.55 }}>
            <span className={`${cell} justify-between text-fg`}>
              {D.font} <CaretDown size={12} className="text-grey" />
            </span>
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <span className={`${cell} justify-between`}>
                {D.weight} <CaretDown size={12} className="text-grey" />
              </span>
              <span className={`${cell} ${titleOn ? "text-fg ring-1 ring-cyan/60" : ""}`}>40</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className={cell}>
                <TextAa size={13} className="text-grey" /> 100%
              </span>
              <span className={cell}>
                <span className="text-grey">|A|</span> −4.5%
              </span>
            </div>
          </div>
        </div>
        <Hr y={380} />
        <div className="absolute inset-x-4" style={{ top: 394, ...fly(pan(3), 20, 0, 4) }}>
          <p className={`${label} flex h-4 items-center`}>{D.fill}</p>
          <div className={`${cell} mt-[6px] uppercase`}>
            <span className="size-4 rounded border border-white/20" style={{ background: fillHex, transition: "background-color .25s" }} />
            {fillHex}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            {SWATCHES.map((c, i) => {
              const on = pick > 0 && i === (s >= 2.5 ? 3 : hover);
              return (
                <span
                  key={c}
                  className="size-8 rounded-full border border-white/15"
                  style={{
                    background: c,
                    boxShadow: on ? `0 0 0 2px #0a0d15, 0 0 0 4px ${c === INK ? "#f5f7fa" : c}` : "none",
                    transform: on ? "scale(1.08)" : undefined,
                    transition: "transform .2s, box-shadow .2s",
                  }}
                />
              );
            })}
          </div>
        </div>
        <Hr y={508} />
        <div className="absolute inset-x-4 flex h-[34px] items-center justify-between" style={{ top: 516, ...fly(pan(3), 20, 0, 4) }}>
          <span className={label}>{D.effects}</span>
          <span className="flex items-center gap-2 text-[13px] text-body">
            <Drop size={13} className="text-grey" /> {D.shadow}
          </span>
        </div>
      </div>

      {/* instances in flight */}
      {ghost(
        btnFly,
        tile(0),
        at(R.btn),
        <span className="grid h-full place-items-center whitespace-nowrap text-[15px] font-semibold text-white">
          {D.button}
        </span>,
        "overflow-hidden rounded-full",
        "#c9c5bd",
      )}
      {D.plans.map((p, k) => (
        <Fragment key={p.name}>
          {ghost(
            planFly(k),
            tile(1),
            planDst(k),
            <PlanBody i={k} />,
            "flex items-center gap-2.5 overflow-hidden rounded-xl bg-white p-2 text-[#1a1714]",
          )}
        </Fragment>
      ))}

      {/* selections in each person's colour */}
      {s > 0.4 && <Sel r={V.r} color={VI} size />}
      {s > 1.46 && <Sel r={C.r} color={CY} k={expo(seg(s, 1.46, 1.6))} />}
      {/* client comment */}
      <div className="absolute flex items-start gap-2" style={{ ...box(pinAt.x, pinAt.y), ...fly(comment, 0, 10, 6) }}>
        <span className="grid size-7 shrink-0 place-items-center rounded-full rounded-bl-none text-[12px] font-bold text-[#05070d]" style={{ background: GR }}>
          {D.team[2].name[0]}
        </span>
        <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-[12px] font-medium text-[#1a1714] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]">{D.comment}</span>
      </div>
      {/* the team */}
      <Mate x={vPos.x} y={vPos.y} color={VI} name={D.team[0].name} k={expo(seg(s, 0, 0.3))} down={(s > 0.4 && s < 0.95) || (s > 1.85 && s < 2.12) || (s > 2.46 && s < 2.54)} />
      <Mate x={cPos.x} y={cPos.y} color={CY} name={D.team[1].name} k={expo(seg(s, 1.08, 1.3))} down={(s > 1.44 && s < 1.5) || (s > 2.22 && s < 2.5)} />
      <Mate x={gPos.x} y={gPos.y} color={GR} name={D.team[2].name} k={expo(seg(s, 1.92, 2.12))} down={s > 2.3 && s < 2.36} />
    </>
  );
}

/** the artboard's content (artboard coordinates, 480 × 560): the site assembling itself, from the same rects as the selections.
 *  Lives inside the product frame (build/Product.tsx), which is the artboard itself. */
export function DesignScreen({ s }: { s: number }) {
  const { D } = useB();
  const { img, badge, signup, title, sub, btnFly, more, planFly, btnColor } = beats(s);
  return (
    <div className="absolute inset-0 text-[#1a1714]">
      <div
        className="absolute overflow-hidden rounded-xl"
        style={{
          ...box(R.img.x, R.img.y, R.img.w, R.img.h),
          clipPath: `inset(${((1 - img) * 100).toFixed(2)}% 0 0 0 round 12px)`,
          opacity: Math.min(1, img * 2),
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `scale(${(1.12 - img * 0.12).toFixed(4)})` }}
        >
          <Visual />
        </div>
        <span
          className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#1a1714]"
          style={fly(badge, -10, 0, 4)}
        >
          {D.badge}
        </span>
      </div>
      {/* email signup bar floating over the visual */}
      <div
        className="absolute flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-[0_12px_30px_-12px_rgb(40_30_20/0.45)]"
        style={{
          ...box(R.img.x + 16, R.img.y + R.img.h - 24, R.img.w - 32, 48),
          ...fly(signup, 0, 18, 8),
        }}
      >
        <EnvelopeSimple size={16} className="text-[#7a7368]" />
        <span className="flex-1 text-[13px] text-[#9a9287]">{D.email}</span>
        <span className="flex h-full items-center rounded-xl bg-[#1a1714] px-4 text-[12px] font-semibold text-[#f4f0e8]">
          {D.join}
        </span>
      </div>
      <p
        className="absolute flex items-center whitespace-nowrap text-[40px] font-semibold leading-none tracking-[-0.045em]"
        style={box(R.title.x, R.title.y, R.title.w, R.title.h)}
      >
        <Typed
          text={D.title}
          k={title}
          caret={s > 1.46 && s < 1.9}
          color="#1a1714"
        />
      </p>
      <p
        className="absolute text-[15px] text-[#5c564c]"
        style={{
          ...box(R.title.x, R.title.y + R.title.h + 8, R.title.w),
          ...fly(sub, 0, 10, 6),
        }}
      >
        {D.sub}
      </p>
      {btnFly >= 1 && (
        <span
          className="absolute grid place-items-center whitespace-nowrap rounded-full text-[15px] font-semibold text-white"
          style={{
            ...box(R.btn.x, R.btn.y, R.btn.w, R.btn.h),
            background: btnColor,
            transition: "background-color .25s",
          }}
        >
          {D.button}
        </span>
      )}
      <span
        className="absolute flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold"
        style={{
          ...box(R.btn.x + R.btn.w + 22, R.btn.y, undefined, R.btn.h),
          ...fly(more, -12, 0, 5),
        }}
      >
        {D.more} <ArrowRight size={14} />
      </span>
      {D.plans.map((p, k) =>
        planFly(k) >= 1 ? (
          <div
            key={p.name}
            className="absolute flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
            style={box(
              R.plans.x + k * (PLAN_W + 10),
              R.plans.y,
              PLAN_W,
              R.plans.h,
            )}
          >
            <PlanBody i={k} />
          </div>
        ) : null,
      )}
    </div>
  );
}

/** a selection box in one person's colour */
function Sel({ r, color, size = false, k = 1 }: { r: Rc; color: string; size?: boolean; k?: number }) {
  return (
    <div className="pointer-events-none absolute border-[1.5px]" style={{ ...box(r.x - 2, r.y - 2, r.w + 4, r.h + 4), borderColor: color, opacity: k }}>
      {[
        [-5, -5],
        [r.w - 1, -5],
        [-5, r.h - 1],
        [r.w - 1, r.h - 1],
      ].map(([x, y], i) => (
        <i key={i} className="absolute size-2.5 border-[1.5px] bg-white" style={{ left: x, top: y, borderColor: color }} />
      ))}
      {size && (
        <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#05070d]" style={{ background: color }}>
          {Math.round(r.w)} × {Math.round(r.h)}
        </span>
      )}
    </div>
  );
}

/** a teammate's cursor, Figma multiplayer style: coloured arrow + name tag; (x, y) is the tip */
function Mate({ x, y, color, name, down = false, k = 1 }: { x: number; y: number; color: string; name: string; down?: boolean; k?: number }) {
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: x, top: y, opacity: k }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="absolute -left-[4px] -top-[2px] [filter:drop-shadow(0_2px_4px_rgb(0_0_0/0.45))]"
        style={{ transformOrigin: "4px 2px", transform: `scale(${down ? 0.88 : 1})`, transition: "transform .12s" }}
      >
        <path d="M4 2v17.2l4.1-3.9 2.9 6.6 2.9-1.25-2.85-6.45h5.9z" fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-[14px] top-[20px] whitespace-nowrap rounded-md rounded-tl-none px-2 py-0.5 text-[11px] font-semibold text-[#05070d] shadow-[0_4px_12px_-4px_rgb(0_0_0/0.5)]" style={{ background: color }}>
        {name}
      </span>
    </div>
  );
}

const PlanBody = memo(function PlanBody({ i }: { i: number }) {
  const { D } = useB();
  const p = D.plans[i];
  return (
    <>
      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
        <Visual v={i} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight">
          {p.name}
        </span>
        <span className="mt-1 block text-[12px] text-[#7a7368]">{p.price}</span>
      </span>
    </>
  );
});
