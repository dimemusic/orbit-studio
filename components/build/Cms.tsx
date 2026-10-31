import {
  CaretDown,
  CheckCircle,
  Image as ImageIcon,
  LinkSimple,
  ListBullets,
  TextB,
  TextItalic,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { type ReactNode } from "react";
import { expo, seg, smooth, Typed, typed } from "./util";
import { box, fly, useB, Visual } from "./shared";
import { PhoneStatus } from "./IPhone";

/* ---------------- 3 · CMS ---------------- */

/** one CMS input: label row, field with focus ring, optional hint under it */
function Field({
  label,
  right,
  focus,
  children,
  hint,
  className = "",
}: {
  label: string;
  right?: ReactNode;
  focus: number;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex items-center justify-between text-[12px] font-medium text-grey">
        {label}
        {right}
      </p>
      <div
        className="tool-cell mt-1.5 flex h-10 items-center text-[15px] text-fg"
        style={{
          borderColor: `color-mix(in srgb, #22d3ee ${(focus * 100).toFixed(0)}%, rgb(255 255 255 / 0.08))`,
          boxShadow: `0 0 0 ${(focus * 4).toFixed(2)}px rgb(34 211 238 / 0.12), inset 0 1px 1px rgb(0 0 0 / 0.25)`,
        }}
      >
        {children}
      </div>
      {hint}
    </div>
  );
}

/** text swap: the old label rolls up and out, the new one rolls in from below (no overlapping cross-fade) */
function Swap({ k, a, b }: { k: number; a: ReactNode; b: ReactNode }) {
  return (
    <span className="grid overflow-hidden">
      <span
        className="col-start-1 row-start-1 text-center"
        style={{
          transform: `translateY(${(-k * 110).toFixed(1)}%)`,
          opacity: 1 - k,
        }}
      >
        {a}
      </span>
      <span
        className="col-start-1 row-start-1 flex justify-center"
        style={{
          transform: `translateY(${((1 - k) * 110).toFixed(1)}%)`,
          opacity: k,
        }}
      >
        {b}
      </span>
    </span>
  );
}

/** the edit beats shared by the form (CmsStage) and the live page on the phone (CmsScreen) */
function beats(s: number) {
  return {
    /** the old price is selected, then the new one typed over it */
    selK: smooth(seg(s, 0.42, 0.55)),
    priceK: seg(s, 0.6, 0.92),
    up: seg(s, 1.05, 1.42),
    photoK: expo(seg(s, 1.4, 1.62)),
    descK: seg(s, 1.58, 1.95),
    stockK: expo(seg(s, 2.02, 2.22)),
    pubK: expo(seg(s, 2.3, 2.55)),
  };
}
/** the moment the new price lands: the old one gets struck through on the site */
const saleK = (s: number) => expo(seg(s, 0.9, 1.1));

export function CmsStage({ s }: { s: number }) {
  const { M } = useB();
  const focusK = (a: number, b: number) =>
    smooth(seg(s, a, a + 0.08)) * (1 - smooth(seg(s, b, b + 0.08)));
  const fPrice = focusK(0.36, 1.0);
  const fDesc = focusK(1.5, 1.98);
  const { selK, priceK, up, photoK, descK, stockK, pubK } = beats(s);
  const pressed = s > 2.22 && s < 2.3;
  const row = (i: number) =>
    fly(expo(seg(s, 0.1 + i * 0.045, 0.6 + i * 0.045)), -40, 0, 8);
  const LOG_AT = [0.95, 1.6, 1.98, 2.32];

  return (
    <>
      {/* the product form */}
      <div
        className="tool flex flex-col gap-2.5 p-5"
        style={{
          ...box(40, 20, 540, 560),
          ...fly(expo(seg(s, 0.02, 0.55)), -200, 0, 14),
        }}
      >
        <div className="flex items-start justify-between" style={row(0)}>
          <div>
            <p className="text-[12px] text-grey">{M.crumb}</p>
            <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-fg">
              {M.form}
            </p>
          </div>
          <span
            className="mt-1 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: `color-mix(in srgb, rgb(52 211 153 / 0.15) ${(pubK * 100).toFixed(0)}%, rgb(255 255 255 / 0.08))`,
              color: `color-mix(in srgb, #34d399 ${(pubK * 100).toFixed(0)}%, #c4cad4)`,
            }}
          >
            <Swap
              k={pubK}
              a={M.draft}
              b={
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green" />{" "}
                  {M.published}
                </span>
              }
            />
          </span>
        </div>

        <div style={row(1)}>
          <Field
            label={M.name}
            focus={0}
            right={
              <span className="tabular-nums text-faint">
                {Array.from(M.nameVal).length}/{M.max}
              </span>
            }
          >
            <span className="px-4">{M.nameVal}</span>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3" style={row(2)}>
          <Field label={M.price} focus={fPrice}>
            <span className="flex-1 px-4 tabular-nums">
              {priceK > 0 ? (
                <Typed text={M.priceVal} k={priceK} caret={fPrice > 0.5} color="#22d3ee" />
              ) : (
                // the old price, selected before it is typed over
                <span className="rounded-[3px] px-0.5 -mx-0.5" style={{ background: `rgb(34 211 238 / ${(selK * 0.35).toFixed(3)})` }}>
                  {M.priceOld}
                </span>
              )}
            </span>
            <span className="grid h-full w-11 place-items-center border-l border-white/10 text-grey">
              {M.cur}
            </span>
          </Field>
          <Field label={M.cat} focus={0}>
            <span className="flex flex-1 items-center justify-between px-4">
              {M.catVal} <CaretDown size={13} className="text-grey" />
            </span>
          </Field>
        </div>

        {/* photo dropzone */}
        <div style={row(3)}>
          <p className="text-[12px] font-medium text-grey">{M.photo}</p>
          <div
            className="mt-1.5 flex h-[62px] items-center gap-3.5 rounded-xl border border-dashed px-3"
            style={{
              borderColor:
                up > 0 && up < 1
                  ? "rgb(34 211 238 / 0.6)"
                  : "rgb(255 255 255 / 0.16)",
              transition: "border-color .3s",
            }}
          >
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06]">
              <UploadSimple size={18} className="text-grey" />
              {/* a clean "photo" thumbnail: soft gradient + picture glyph (a cropped render looked chopped at this size) */}
              <span
                className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#f1eee8] to-[#cdc6ba] text-[#1a1714]"
                style={{
                  opacity: Math.max(up > 0 ? 0.35 : 0, photoK),
                  transform: `scale(${(1.15 - photoK * 0.15).toFixed(4)})`,
                }}
              >
                <ImageIcon size={22} weight="duotone" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              {up <= 0 ? (
                <p className="text-[13px] text-grey">{M.drop}</p>
              ) : (
                <>
                  <p className="flex items-center justify-between text-[13px] text-body">
                    <span className="flex items-center gap-1.5">
                      {photoK > 0.5 && (
                        <CheckCircle
                          size={14}
                          weight="fill"
                          className="text-green"
                        />
                      )}
                      {M.file}
                    </span>
                    <span className="tabular-nums text-grey">
                      {photoK > 0.5 ? M.size : `${Math.round(up * 100)}%`}
                    </span>
                  </p>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                      className="block h-full origin-left rounded-full bg-cyan"
                      style={{
                        transform: `scaleX(${up})`,
                        opacity: 1 - photoK * 0.6,
                      }}
                    />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* description with a small editor toolbar */}
        <div
          className="tool-cell"
          style={{
            ...row(4),
            borderColor: `color-mix(in srgb, #22d3ee ${(fDesc * 100).toFixed(0)}%, rgb(255 255 255 / 0.08))`,
            boxShadow: `0 0 0 ${(fDesc * 4).toFixed(2)}px rgb(34 211 238 / 0.12), inset 0 1px 1px rgb(0 0 0 / 0.25)`,
          }}
        >
          <div className="flex items-center gap-1 border-b border-white/[0.08] px-2 py-1.5 text-grey">
            {[TextB, TextItalic, LinkSimple, ListBullets].map((Ic, i) => (
              <span
                key={i}
                className="grid size-7 place-items-center rounded-md"
              >
                <Ic size={14} />
              </span>
            ))}
          </div>
          <p className="h-[36px] px-4 py-1.5 text-[14px] text-body">
            <Typed
              text={M.descVal}
              k={descK}
              caret={fDesc > 0.5}
              color="#22d3ee"
            />
          </p>
        </div>

        {/* availability */}
        <div
          className="tool-cell flex h-12 items-center justify-between px-4"
          style={row(5)}
        >
          <span className="text-[14px] text-fg">{M.stock}</span>
          <span
            className="relative h-7 w-12 rounded-full"
            style={{
              background: `color-mix(in srgb, #34d399 ${(stockK * 100).toFixed(0)}%, rgb(255 255 255 / 0.15))`,
            }}
          >
            <span
              className="absolute left-1 top-1 size-5 rounded-full bg-white shadow"
              style={{ transform: `translateX(${(stockK * 20).toFixed(1)}px)` }}
            />
          </span>
        </div>

        {/* actions */}
        <div
          className="mt-auto flex items-center justify-end gap-3"
          style={row(6)}
        >
          <span className="rounded-full border border-white/15 px-5 py-3 text-[14px] font-semibold text-body">
            {M.save}
          </span>
          <span
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[14px] font-semibold text-white"
            style={{
              background: `color-mix(in srgb, #1f9d68 ${(pubK * 100).toFixed(0)}%, #3d8bff)`,
              transform: `scale(${pressed ? 0.95 : 1})`,
              transition: "transform .15s",
            }}
          >
            <Swap
              k={pubK}
              a={M.publish}
              b={
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" /> {M.published}
                </span>
              }
            />
          </span>
        </div>
      </div>

      {/* toast */}
      <div
        className="tool flex items-center gap-2 px-4 py-2.5 text-[14px] text-green"
        style={{
          ...box(604, 20),
          ...fly(expo(seg(s, 2.36, 2.66)), 0, -24, 10),
        }}
      >
        <CheckCircle size={16} weight="fill" /> {M.toast}
      </div>
      {/* change history: every edit is saved */}
      <div
        className="tool p-4"
        style={{
          ...box(604, 100, 200),
          ...fly(expo(seg(s, 0.2, 0.75)), 0, 30, 12),
        }}
      >
        <p className="tool-label">{M.logLabel}</p>
        {/* a timeline: one hairline through the dots */}
        <ul className="relative mt-3 flex flex-col gap-2.5 before:absolute before:bottom-2 before:left-[2.5px] before:top-2 before:w-px before:bg-white/[0.08]">
          {M.log.map((l, i) => {
            const k = expo(seg(s, LOG_AT[i], LOG_AT[i] + 0.3));
            return (
              <li
                key={l}
                className="flex items-start gap-2.5"
                style={fly(k, 0, 10, 5)}
              >
                <span
                  className={`relative mt-1.5 size-1.5 shrink-0 rounded-full ring-[3px] ring-[#0d1018] ${i === 3 ? "bg-green" : "bg-cyan"}`}
                />
                <span className="leading-tight">
                  <span className="block text-[13px] text-fg">{l}</span>
                  <span className="block text-[11px] text-grey">{M.now}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

    </>
  );
}

/**
 * The phone screen (262 × 536): the SAME site, its phone layout. It scrolls down to the plans, and the «Стандарт»
 * card takes every edit as the form makes it (sale price over the old one, new photo, description, in stock),
 * lit while it is being edited. Lives inside the product frame, which draws the phone body.
 */
const SCROLL = 150;
export function CmsScreen({ s }: { s: number }) {
  const { BUILD, D, M } = useB();
  const { priceK, photoK, descK, stockK, pubK } = beats(s);
  const sale = saleK(s);
  const scroll = smooth(seg(s, 0.05, 0.4)) * SCROLL;
  const editing = Math.min(smooth(seg(s, 0.3, 0.45)), 1 - smooth(seg(s, 2.3, 2.6)));
  return (
    <div className="absolute inset-0 text-[#1a1714]">
      <div className="absolute inset-x-0 bottom-0 top-[46px] overflow-hidden">
        <div className="px-4" style={{ transform: `translateY(${(-scroll).toFixed(1)}px)` }}>
          {/* header */}
          <div className="flex h-8 items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em]">
              <span className="grid size-[17px] place-items-center rounded-[5px] bg-[#1a1714]">
                <span className="size-[6px] rounded-full bg-[#f4f0e8]" />
              </span>
              {BUILD.brand}
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-semibold"
              style={{ color: `color-mix(in srgb, #1f8f5f ${(pubK * 100).toFixed(0)}%, rgb(0 0 0 / 0.3))` }}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {M.live}
            </span>
          </div>
          {/* hero, as designed */}
          <div className="relative mt-2 h-[108px] overflow-hidden rounded-xl">
            <Visual />
          </div>
          <p className="mt-3 text-[20px] font-semibold leading-none tracking-[-0.045em]">{D.title}</p>
          <p className="mt-1.5 text-[11px] leading-snug text-[#5c564c]">{D.sub}</p>
          <span className="mt-3 inline-grid h-8 place-items-center rounded-full bg-[#1a1714] px-4 text-[11px] font-semibold text-white">{D.button}</span>

          {/* plans */}
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a7368]">{M.catVal}</p>
          <PlanRow i={0} />
          {/* the plan being edited */}
          <div
            className="mt-2 overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: `0 0 0 ${(editing * 2).toFixed(2)}px rgb(34 211 238 / ${(editing * 0.85).toFixed(3)}), 0 6px 18px -10px rgb(40 30 20 / 0.35)` }}
          >
            <div className="relative h-[92px] overflow-hidden">
              <Visual v={1} />
              <div className="absolute inset-0" style={{ opacity: photoK, transform: `scale(${(1.12 - photoK * 0.12).toFixed(4)})` }}>
                <Visual v={3} />
              </div>
              <span className="absolute left-2.5 top-2.5 flex gap-1">
                {M.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold">
                    {t}
                  </span>
                ))}
              </span>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold leading-tight">{M.nameVal}</p>
                <span className="rounded-full bg-[#1f8f5f]/15 px-2 py-0.5 text-[10px] font-semibold text-[#1f8f5f]" style={fly(stockK, 10, 0, 6)}>
                  {M.stock}
                </span>
              </div>
              <p className="mt-1 flex items-baseline gap-2 text-[15px] font-semibold tabular-nums">
                {priceK > 0 ? (
                  <>
                    <span className="text-[#c2410c]">
                      {typed(M.priceVal, priceK)} {M.cur}
                    </span>
                    <span className="text-[11px] font-medium text-[#7a7368] line-through" style={{ opacity: sale }}>
                      {M.priceOld} {M.cur}
                    </span>
                  </>
                ) : (
                  <span>
                    {M.priceOld} {M.cur}
                  </span>
                )}
              </p>
              <p className="mt-1.5 min-h-[30px] text-[11px] leading-snug text-[#5c564c]">{typed(M.descVal, descK)}</p>
              <span className="mt-2 grid h-8 place-items-center rounded-full bg-[#1a1714] text-[11px] font-semibold text-white">{M.buy}</span>
            </div>
          </div>
          <PlanRow i={2} />
        </div>
      </div>
      <PhoneStatus />
      <i className="absolute bottom-2 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-[#1a1714]/80" />
    </div>
  );
}

/** a plan as a compact row on the phone (the ones not being edited) */
function PlanRow({ i }: { i: number }) {
  const { D } = useB();
  const p = D.plans[i];
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg">
        <Visual v={i} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold leading-tight">{p.name}</span>
        <span className="mt-0.5 block text-[11px] text-[#7a7368]">{p.price}</span>
      </span>
    </div>
  );
}
