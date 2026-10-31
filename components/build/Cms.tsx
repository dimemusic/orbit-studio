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
    nameK: seg(s, 0.45, 0.92),
    priceK: seg(s, 1.03, 1.24),
    up: seg(s, 1.3, 1.68),
    photoK: expo(seg(s, 1.66, 1.9)),
    descK: seg(s, 1.76, 2.02),
    stockK: expo(seg(s, 2.05, 2.28)),
    pubK: expo(seg(s, 2.3, 2.55)),
  };
}

export function CmsStage({ s }: { s: number }) {
  const { M } = useB();
  const focusK = (a: number, b: number) =>
    smooth(seg(s, a, a + 0.08)) * (1 - smooth(seg(s, b, b + 0.08)));
  const fName = focusK(0.38, 0.98);
  const fPrice = focusK(0.98, 1.28);
  const fDesc = focusK(1.72, 2.05);
  const { nameK, priceK, up, photoK, descK, stockK, pubK } = beats(s);
  const name = typed(M.nameVal, nameK);
  const pressed = s > 2.2 && s < 2.3;
  const row = (i: number) =>
    fly(expo(seg(s, 0.1 + i * 0.045, 0.6 + i * 0.045)), -40, 0, 8);
  const LOG_AT = [1.0, 1.3, 1.7, 2.32];

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
            focus={fName}
            right={
              <span className="tabular-nums text-faint">
                {Array.from(name).length}/{M.max}
              </span>
            }
          >
            <span className="px-4">
              <Typed
                text={M.nameVal}
                k={nameK}
                caret={fName > 0.5}
                color="#22d3ee"
              />
            </span>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3" style={row(2)}>
          <Field label={M.price} focus={fPrice}>
            <span className="flex-1 px-4 tabular-nums">
              <Typed
                text={M.priceVal}
                k={priceK}
                caret={fPrice > 0.5}
                color="#22d3ee"
              />
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

/** the phone screen (262 × 536): the product page updates as the form is filled. Lives inside the product frame,
 *  which draws the phone body (bezel, buttons) as it reshapes into a phone. */
export function CmsScreen({ s }: { s: number }) {
  const { BUILD, M } = useB();
  const { nameK, priceK, photoK, descK, stockK, pubK } = beats(s);
  const name = typed(M.nameVal, nameK);
  return (
    <div className="absolute inset-0 text-[#1a1714]">
      <PhoneStatus />
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[15px] font-semibold">{BUILD.brand}</span>
          <span
            className="flex items-center gap-1.5 text-[11px] font-semibold"
            style={{
              color: `color-mix(in srgb, #1f8f5f ${(pubK * 100).toFixed(0)}%, rgb(0 0 0 / 0.3))`,
            }}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {M.live}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative grid h-36 place-items-center overflow-hidden bg-[#ebe8e2]">
            <ImageIcon size={30} className="text-black/20" />
            <div
              className="absolute inset-0"
              style={{
                opacity: photoK,
                transform: `scale(${(1.12 - photoK * 0.12).toFixed(4)})`,
              }}
            >
              <Visual />
            </div>
            <span className="absolute left-3 top-3 flex gap-1.5">
              {M.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#1a1714]"
                >
                  {t}
                </span>
              ))}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="min-h-[22px] text-[18px] font-semibold leading-tight">
                {name || " "}
              </p>
              <span
                className="rounded-full bg-[#1f8f5f]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1f8f5f]"
                style={fly(stockK, 10, 0, 6)}
              >
                {M.stock}
              </span>
            </div>
            <p className="mt-1 text-[18px] font-semibold tabular-nums">
              {typed(M.priceVal, priceK)}
              {priceK > 0 && ` ${M.cur}`}
            </p>
            <p className="mt-2 min-h-[34px] text-[12px] leading-snug text-[#5c564c]">
              {typed(M.descVal, descK)}
            </p>
            <span className="mt-3 grid h-10 place-items-center rounded-full bg-[#1a1714] text-[13px] font-semibold text-white">
              {M.buy}
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 opacity-70">
          <div className="relative h-16 overflow-hidden rounded-xl">
            <Visual v={1} />
          </div>
          <div className="relative h-16 overflow-hidden rounded-xl">
            <Visual v={2} />
          </div>
        </div>
      </div>
      <i className="absolute bottom-2 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-[#1a1714]/80" />
    </div>
  );
}
