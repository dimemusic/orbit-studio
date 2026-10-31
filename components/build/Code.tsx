import { CheckCircle, GitBranch, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { Caret, ease, expo, seg, typed } from "./util";
import { BLOCKS, DesignScreen } from "./Design";
import { box, BrowserBar, fly, useB } from "./shared";

/* ---------------- 2 · Code ---------------- */

/** how far the code is typed at beat s: shared by the editor (CodeStage) and the live preview (CodeScreen) */
function useTyping(s: number) {
  const { CHARS, LEN, START } = useB();
  const chars = Math.round(seg(s, 0.3, 1.95) * CHARS);
  const lineK = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  return { chars, lineK };
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

/**
 * The live preview (430 × 560): the SAME page that was designed, now in a browser. Each block starts as the
 * static mock (washed out, a dashed outline) and becomes real when its line of code is typed (a short green
 * flash). Lives inside the product frame.
 */
const PREVIEW_K = 430 / 480;
export function CodeScreen({ s }: { s: number }) {
  const { lineK } = useTyping(s);
  return (
    <div className="absolute inset-0">
      <BrowserBar url="localhost:3000" />
      <div className="absolute left-0 top-[34px] origin-top-left" style={{ width: 480, height: 560, transform: `scale(${PREVIEW_K})` }}>
        <DesignScreen s={3} />
        {BLOCKS.map(({ r, line }, i) => {
          const live = ease(Math.min(1, lineK(line) * 1.4));
          const flash = Math.sin(Math.PI * Math.min(1, Math.max(0, live * 1.6 - 0.6)));
          if (live >= 1 && flash < 0.01) return null;
          return (
            <span
              key={i}
              className="pointer-events-none absolute rounded-xl"
              style={{
                ...box(r.x - 6, r.y - 6, r.w + 12, r.h + 12),
                background: `rgb(244 240 232 / ${((1 - live) * 0.62).toFixed(3)})`,
                outline: live < 1 ? `1.5px dashed rgb(139 92 246 / ${((1 - live) * 0.7).toFixed(3)})` : undefined,
                boxShadow: flash > 0.01 ? `0 0 0 2px rgb(52 211 153 / ${(flash * 0.9).toFixed(3)})` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
