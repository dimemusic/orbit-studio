import { CheckCircle, ListChecks, MagnifyingGlass, Sparkle, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { box, fly, useB } from "./shared";
import { Caret, expo, seg, typed } from "./util";

/* ---------------- 1 · Brief & research ---------------- */

const ACC = "#fb7185";
const GOOD = "#34d399";
/** search volume bars, relative to the first query (illustrative demo data) */
const BAR = [1, 0.55, 0.25, 0.17];

/**
 * Before any design. Left: the brief fills in, then what people search for in the niche. Centre: competitors checked
 * on prices / mobile / speed with real-looking values, then findings that turn each weakness into a decision.
 * Right: the page plan (every block with its job) that the design stage then draws.
 * The centre column (x 360..840) is the phone crop. Every panel's content fits its box with explicit line heights.
 */
/** s = beats 0..3 (beatsOf); everything has landed by 2.1, the rest is read time before the hand-over */
export function BriefStage({ s }: { s: number }) {
  const { BUILD } = useB();
  const B = BUILD.brief;
  const pan = (i: number) => expo(seg(s, 0.02 + i * 0.06, 0.35 + i * 0.06));

  return (
    <>
      {/* the brief: the client's answers */}
      <div className="tool flex flex-col p-5" style={{ ...box(40, 20, 296, 316), ...fly(pan(0), -60, 0, 12) }}>
        <p className="tool-label flex items-center gap-2 leading-4">
          <ListChecks size={14} weight="bold" style={{ color: ACC }} />
          {B.form}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {B.rows.map((r, i) => {
            const k = seg(s, 0.15 + i * 0.12, 0.3 + i * 0.12);
            return (
              <div key={r.k} className="tool-cell flex h-[52px] flex-col justify-center px-3">
                <span className="text-[11px] leading-4 text-grey">{r.k}</span>
                <span className="truncate text-[14px] leading-5 text-fg">
                  {typed(r.v, k)}
                  {k > 0 && k < 1 && <Caret color={ACC} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* demand: what people search for, with monthly volume */}
      <div className="tool flex flex-col p-5" style={{ ...box(40, 352, 296, 228), ...fly(pan(3), -60, 0, 12) }}>
        <p className="tool-label flex items-center gap-2 leading-4">
          <TrendUp size={14} weight="bold" style={{ color: ACC }} />
          {B.search}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {B.queries.map((q, i) => {
            const k = expo(seg(s, 0.45 + i * 0.08, 0.75 + i * 0.08));
            return (
              <div key={q.q} style={{ opacity: 0.3 + 0.7 * k }}>
                <div className="flex items-baseline justify-between gap-3 text-[13px] leading-4">
                  <span className="truncate text-fg">{q.q}</span>
                  <span className="shrink-0 tabular-nums text-grey">
                    <span className="text-fg">{q.n}</span> {B.perMonth}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full origin-left rounded-full"
                    style={{ background: ACC, transform: `scaleX(${(BAR[i] * k).toFixed(3)})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* competitors: prices, mobile, speed */}
      <div className="tool flex flex-col p-5" style={{ ...box(360, 20, 480, 300), ...fly(pan(1), 0, 30, 12) }}>
        <p className="tool-label flex items-center gap-2 leading-4">
          <MagnifyingGlass size={14} weight="bold" style={{ color: ACC }} />
          {B.market}
        </p>
        <div className="mt-4 grid grid-cols-[1fr_repeat(3,88px)] px-3 text-[12px] leading-4 text-grey">
          <span />
          {B.cols.map((c) => (
            <span key={c} className="text-center">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {B.rivals.map((r, i) => {
            const row = expo(seg(s, 0.35 + i * 0.08, 0.55 + i * 0.08));
            return (
              <div
                key={r.name}
                className="tool-cell grid h-[56px] grid-cols-[1fr_repeat(3,88px)] items-center px-3"
                style={{ opacity: row, transform: row < 1 ? `translateY(${((1 - row) * 8).toFixed(1)}px)` : undefined }}
              >
                <span className="flex min-w-0 items-center gap-3 text-[14px] leading-5 text-fg">
                  {/* a tiny abstract thumbnail of the rival's site */}
                  <span className="grid h-8 w-10 shrink-0 grid-rows-[6px_1fr] gap-0.5 rounded-md bg-white/[0.08] p-1">
                    <span className="rounded-sm bg-white/20" />
                    <span className="rounded-sm bg-white/10" />
                  </span>
                  <span className="truncate">{r.name}</span>
                </span>
                {r.cells.map((c, j) => {
                  const m = expo(seg(s, 0.55 + i * 0.08 + j * 0.05, 0.7 + i * 0.08 + j * 0.05));
                  return (
                    <span key={j} className="grid place-items-center">
                      <span
                        className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium leading-4"
                        style={{
                          opacity: m,
                          transform: `scale(${(0.7 + 0.3 * m).toFixed(3)})`,
                          background: c.ok ? "rgb(52 211 153 / 0.14)" : "rgb(251 113 133 / 0.12)",
                          color: c.ok ? GOOD : ACC,
                        }}
                      >
                        {c.v}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* findings: each rival weakness becomes a decision for the site */}
      <div className="tool flex flex-col p-5" style={{ ...box(360, 336, 480, 244), ...fly(pan(2), 0, 30, 12) }}>
        <p className="tool-label flex items-center gap-2 leading-4">
          <Sparkle size={14} weight="bold" style={{ color: ACC }} />
          {B.found}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {B.insights.map((x, i) => {
            const k = expo(seg(s, 0.95 + i * 0.15, 1.2 + i * 0.15));
            return (
              <div
                key={x.do}
                className="tool-cell flex h-[52px] items-center gap-3 px-3"
                style={{ opacity: k, transform: k < 1 ? `translateX(${((1 - k) * -16).toFixed(1)}px)` : undefined }}
              >
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-lg text-[12px] font-bold leading-none"
                  style={{ background: "rgb(251 113 133 / 0.14)", color: ACC }}
                >
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[11px] leading-4 text-grey">{x.why}</span>
                  <span className="truncate text-[14px] leading-5 text-fg">→ {x.do}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* the page plan the design will draw: every block with its job */}
      <div className="tool flex flex-col p-5" style={{ ...box(864, 20, 296, 560), ...fly(pan(4), 60, 0, 12) }}>
        <p className="tool-label leading-4">{B.plan}</p>
        <div className="mt-4 flex flex-col gap-2">
          {B.blocks.map((b, i) => {
            const k = expo(seg(s, 1.25 + i * 0.1, 1.45 + i * 0.1));
            return (
              <div
                key={b.t}
                className="flex items-center gap-3 rounded-xl px-3"
                style={{
                  height: i === 1 ? 80 : 56,
                  opacity: 0.25 + 0.75 * k,
                  background: k > 0 ? "rgb(255 255 255 / 0.045)" : "transparent",
                  border: `1.5px dashed rgb(255 255 255 / ${(0.12 + 0.1 * k).toFixed(3)})`,
                }}
              >
                <CheckCircle size={16} weight="fill" style={{ color: GOOD, opacity: k, flexShrink: 0 }} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] leading-5" style={{ color: k > 0.5 ? "#f5f7fa" : "#8b919c" }}>
                    {b.t}
                  </span>
                  <span className="text-[11px] leading-4 text-grey" style={{ opacity: k }}>
                    {b.d}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="mt-auto flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold"
          style={{ opacity: expo(seg(s, 1.95, 2.1)), background: "rgb(52 211 153 / 0.14)", color: GOOD }}
        >
          <CheckCircle size={16} weight="fill" />
          {B.ready}
        </div>
      </div>
    </>
  );
}
