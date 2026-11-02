import { CheckCircle, ListChecks, MagnifyingGlass, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { box, fly, useB } from "./shared";
import { Caret, expo, seg, typed } from "./util";

/* ---------------- 1 · Brief & research ---------------- */

/** competitor checks: true = does it well. Purely illustrative marks for the demo. */
const MARKS = [
  [false, true, false],
  [true, false, false],
  [false, false, true],
];
const ACC = "#fb7185";

/**
 * Before any design: the brief fills in (left), the niche is researched (centre: three competitors checked on three
 * criteria, then the findings), and it all lands in a page plan (right) that the design stage then draws.
 * Layout keeps the centre column (x 360..840) for the phone crop.
 */
export function BriefStage({ s }: { s: number }) {
  const { BUILD } = useB();
  const B = BUILD.brief;
  const pan = (i: number) => expo(seg(s, 0.02 + i * 0.12, 0.5 + i * 0.12));

  return (
    <>
      {/* the brief */}
      <div className="tool flex flex-col p-5" style={{ ...box(40, 20, 296, 360), ...fly(pan(0), -60, 0, 12) }}>
        <p className="tool-label flex items-center gap-2">
          <ListChecks size={14} weight="bold" style={{ color: ACC }} />
          {B.form}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {B.rows.map((r, i) => {
            const k = seg(s, 0.25 + i * 0.18, 0.45 + i * 0.18);
            return (
              <div key={r.k}>
                <p className="text-[12px] text-grey">{r.k}</p>
                <div className="tool-cell mt-1 flex h-10 items-center px-3 text-[14px] text-fg">
                  {typed(r.v, k)}
                  {k > 0 && k < 1 && <Caret color={ACC} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* the niche: competitors on three criteria */}
      <div className="tool flex flex-col p-5" style={{ ...box(360, 20, 480, 300), ...fly(pan(1), 0, 30, 12) }}>
        <p className="tool-label flex items-center gap-2">
          <MagnifyingGlass size={14} weight="bold" style={{ color: ACC }} />
          {B.market}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_repeat(3,72px)] items-center gap-y-2 text-[12px] text-grey">
          <span />
          {B.cols.map((c) => (
            <span key={c} className="text-center">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {B.rivals.map((r, i) => {
            const row = expo(seg(s, 0.55 + i * 0.12, 0.8 + i * 0.12));
            return (
              <div
                key={r}
                className="tool-cell grid h-[52px] grid-cols-[1fr_repeat(3,72px)] items-center px-3"
                style={{ opacity: row, transform: row < 1 ? `translateY(${((1 - row) * 8).toFixed(1)}px)` : undefined }}
              >
                <span className="flex items-center gap-3 text-[14px] text-fg">
                  {/* a tiny abstract thumbnail of the rival's site */}
                  <span className="grid h-8 w-12 grid-rows-[6px_1fr] gap-0.5 rounded-md bg-white/[0.08] p-1">
                    <span className="rounded-sm bg-white/20" />
                    <span className="rounded-sm bg-white/10" />
                  </span>
                  {r}
                </span>
                {MARKS[i].map((ok, j) => {
                  const m = expo(seg(s, 0.85 + i * 0.1 + j * 0.06, 1.05 + i * 0.1 + j * 0.06));
                  return (
                    <span key={j} className="grid place-items-center">
                      <span
                        className="grid size-6 place-items-center rounded-full text-[12px] font-bold leading-none"
                        style={{
                          opacity: m,
                          transform: `scale(${(0.6 + 0.4 * m).toFixed(3)})`,
                          background: ok ? "rgb(52 211 153 / 0.16)" : "rgb(251 113 133 / 0.14)",
                          color: ok ? "#34d399" : ACC,
                        }}
                      >
                        {ok ? "✓" : "×"}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* findings: what the site has to do better than the rivals */}
      <div className="tool flex flex-col p-5" style={{ ...box(360, 340, 480, 240), ...fly(pan(2), 0, 30, 12) }}>
        <p className="tool-label flex items-center gap-2">
          <Sparkle size={14} weight="bold" style={{ color: ACC }} />
          {B.found}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {B.insights.map((x, i) => {
            const k = expo(seg(s, 1.3 + i * 0.15, 1.6 + i * 0.15));
            return (
              <div
                key={x}
                className="tool-cell flex h-12 items-center gap-3 px-3 text-[14px] text-fg"
                style={{ opacity: k, transform: k < 1 ? `translateX(${((1 - k) * -16).toFixed(1)}px)` : undefined }}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-lg text-[12px] font-bold leading-none" style={{ background: "rgb(251 113 133 / 0.14)", color: ACC }}>
                  {i + 1}
                </span>
                {x}
              </div>
            );
          })}
        </div>
      </div>

      {/* the page plan the design will draw */}
      <div className="tool flex flex-col p-5" style={{ ...box(864, 20, 296, 560), ...fly(pan(3), 60, 0, 12) }}>
        <p className="tool-label">{B.plan}</p>
        <div className="mt-4 flex flex-col gap-2">
          {B.blocks.map((b, i) => {
            const k = expo(seg(s, 1.65 + i * 0.1, 1.9 + i * 0.1));
            const tall = i === 1 ? 88 : 44;
            return (
              <div
                key={b}
                className="relative flex items-center gap-3 overflow-hidden rounded-xl px-3 text-[13px]"
                style={{
                  height: tall,
                  opacity: 0.25 + 0.75 * k,
                  background: k > 0 ? "rgb(255 255 255 / 0.045)" : "transparent",
                  border: `1.5px dashed rgb(255 255 255 / ${(0.12 + 0.1 * k).toFixed(3)})`,
                  color: k > 0.5 ? "#f5f7fa" : "#8b919c",
                }}
              >
                <CheckCircle size={16} weight="fill" style={{ color: "#34d399", opacity: k, flexShrink: 0 }} />
                {b}
              </div>
            );
          })}
        </div>
        <div
          className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold"
          style={{ opacity: expo(seg(s, 2.3, 2.5)), background: "rgb(52 211 153 / 0.14)", color: "#34d399" }}
        >
          <CheckCircle size={16} weight="fill" />
          {B.ready}
        </div>
      </div>
    </>
  );
}
