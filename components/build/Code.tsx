import { CheckCircle, EnvelopeSimple, GitBranch, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { Caret, ease, expo, seg, typed } from "./util";
import { box, BrowserBar, fly, MockNav, useB, Visual } from "./shared";

/* ---------------- 2 · Code ---------------- */

/** how far the code is typed at beat s: shared by the editor (CodeStage) and the live preview (CodeScreen) */
function useTyping(s: number) {
  const { CHARS, LEN, LINES, START } = useB();
  const chars = Math.round(seg(s, 0.3, 1.95) * CHARS);
  const lineK = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const textOf = (line: number, tok: number) => {
    const before = LINES[line].slice(0, tok).reduce((a, [x]) => a + x.length, 0);
    return typed(LINES[line][tok][0], (chars - START[line] - before) / LINES[line][tok][0].length);
  };
  return { chars, lineK, textOf };
}

/** the editor panel: tab bar, gutter, the line being typed lit up, and the terminal docked at the bottom */
const ED = { x: 40, y: 20, w: 640, h: 560 };
const TAB_H = 44;
const LINE_H = 31;
const TERM_H = 92;
const mono = "font-[ui-monospace,SFMono-Regular,Menlo,monospace]";

export function CodeStage({ s }: { s: number }) {
  const { C, LEN, LINES, START } = useB();
  const { chars, lineK } = useTyping(s);
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const term = expo(seg(s, 1.9, 2.2));
  const ok = expo(seg(s, 2.22, 2.45));
  const panel = expo(seg(s, 0.02, 0.5));

  return (
    <div className="tool overflow-hidden" style={{ ...box(ED.x, ED.y, ED.w, ED.h), ...fly(panel, -60, 0, 10) }}>
      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] bg-black/20 px-2" style={{ height: TAB_H }}>
        {C.files.map((f, i) => (
          <span
            key={f}
            className={`flex h-[30px] items-center gap-2 rounded-lg px-3 text-[13px] ${mono} ${i === 0 ? "bg-white/[0.06] text-fg" : "text-faint"}`}
          >
            <span className="size-1.5 rounded-full" style={{ background: i === 0 ? "#5aa2ff" : i === 1 ? "#c792ea" : "#7fdbca", opacity: i === 0 ? 1 : 0.5 }} />
            {f}
          </span>
        ))}
        <span className={`ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-grey ${mono}`}>
          <GitBranch size={13} /> {C.branch}
        </span>
      </div>

      {/* code */}
      <div className={`relative pt-3 text-[16px] ${mono}`} style={{ lineHeight: `${LINE_H}px` }}>
        {cur >= 0 && (
          // the line being typed: a soft bar with a blue edge
          <span
            className="absolute inset-x-0 border-l-2 border-[#5aa2ff] bg-white/[0.035]"
            style={{ top: 12 + cur * LINE_H, height: LINE_H }}
          />
        )}
        {LINES.map((line, i) => {
          let left = chars - START[i];
          const k = ease(Math.min(1, lineK(i) * 4));
          return (
            <div key={i} className="relative flex" style={{ opacity: chars > START[i] ? 1 : 0.18 }}>
              <span className={`w-12 shrink-0 pr-4 text-right text-[13px] ${i === cur ? "text-body" : "text-faint"}`}>{i + 1}</span>
              <span
                className="whitespace-pre pl-2"
                style={
                  // small: the typed line only fades in (no per-line blur)
                  chars > START[i] && k < 1 ? { opacity: 0.35 + 0.65 * k } : undefined
                }
              >
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

      {/* terminal, docked */}
      <div
        className={`absolute inset-x-0 bottom-0 border-t border-white/[0.07] bg-black/25 px-5 text-[14px] ${mono}`}
        style={{ height: TERM_H, opacity: Math.min(1, 0.35 + term) }}
      >
        <p className="flex h-9 items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-faint">
          <TerminalWindow size={13} /> zsh
        </p>
        <p className="flex items-center gap-3" style={fly(term, 0, 10, 6)}>
          <span className="text-green">~/your-product</span>
          <span className="text-faint">$</span>
          <span className="text-body">{typed(C.cmd, seg(s, 2.02, 2.2))}</span>
          <span className="ml-auto flex items-center gap-2 text-green" style={fly(ok, 16, 0, 8)}>
            <CheckCircle size={16} weight="fill" /> {C.ok}
          </span>
        </p>
      </div>
    </div>
  );
}

/** the live preview (430 × 560): the page builds itself as the code is typed. Lives inside the product frame. */
export function CodeScreen({ s }: { s: number }) {
  const { BUILD } = useB();
  const { lineK, textOf } = useTyping(s);
  return (
    <div className="absolute inset-0 text-[#1a1714]">
      <BrowserBar url="localhost:3000" />
      <div className="px-5 pb-5 pt-3">
        <div className="mb-3" style={fly(expo(Math.min(1, lineK(2) * 2)), 0, -6, 4)}>
          <MockNav brand={BUILD.brand} links={BUILD.design.pages} size={0.85} />
        </div>
        <div
          className="relative h-[128px] overflow-hidden rounded-xl"
          style={fly(expo(lineK(2)), 0, 16, 10)}
        >
          <Visual />
        </div>
        <div className="pt-3">
          <p className="min-h-[28px] text-[26px] font-semibold leading-none tracking-[-0.045em]">
            {textOf(3, 3)}
          </p>
          <p className="mt-1.5 min-h-[18px] text-[13px] text-[#5c564c]">
            {textOf(4, 3)}
          </p>
          <span
            className="mt-3 inline-grid h-9 min-w-[110px] place-items-center rounded-full bg-[#1a1714] px-5 text-[12px] font-semibold text-white"
            style={fly(expo(Math.min(1, lineK(5) * 2.5)), 0, 12, 8)}
          >
            {textOf(5, 3) || " "}
          </span>
        </div>
        <div
          className="mt-3 flex items-center gap-2 rounded-xl bg-white p-1 pl-3 shadow-[0_6px_16px_-10px_rgb(40_30_20/0.5)]"
          style={fly(expo(Math.min(1, lineK(6) * 2)), 0, 14, 8)}
        >
          <EnvelopeSimple size={13} className="text-[#7a7368]" />
          <span className="flex-1 text-[11px] text-[#9a9287]">
            {BUILD.design.email}
          </span>
          <span className="grid h-8 place-items-center rounded-lg bg-[#1a1714] px-2.5 text-[11px] font-semibold text-[#f4f0e8]">
            {BUILD.design.join}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              className="rounded-lg bg-white p-2"
              style={fly(
                expo(seg(lineK(8), k * 0.2, k * 0.2 + 0.6)),
                0,
                30,
                10,
              )}
            >
              <div className="relative h-16 overflow-hidden rounded-md">
                <Visual v={k} />
              </div>
              <p className="mt-2 truncate text-[11px] font-semibold">
                {BUILD.design.plans[k].name}
              </p>
              <p className="text-[10px] text-[#7a7368]">
                {BUILD.design.plans[k].price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
