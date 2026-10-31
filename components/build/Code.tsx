import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
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

/** the code, typed straight on the background (no editor window), and the terminal under it */
export function CodeStage({ s }: { s: number }) {
  const { C, LEN, LINES, START } = useB();
  const { chars, lineK } = useTyping(s);
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const term = expo(seg(s, 1.9, 2.2));

  return (
    <>
      {/* code written straight on the background */}
      <div
        className="border-l-2 border-[#5aa2ff]/40 pl-6 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[18px] leading-[34px]"
        style={box(40, 20, 640)}
      >
        {LINES.map((line, i) => {
          let left = chars - START[i];
          const k = ease(Math.min(1, lineK(i) * 4));
          return (
            <div
              key={i}
              className="flex"
              style={{ opacity: chars > START[i] ? 1 : 0.15 }}
            >
              <span className="w-9 shrink-0 pr-4 text-right text-faint">
                {i + 1}
              </span>
              <span
                className="whitespace-pre"
                style={
                  // small: the typed line only fades in (no per-line blur)
                  chars > START[i] && k < 1
                    ? { opacity: 0.35 + 0.65 * k }
                    : undefined
                }
              >
                {line.map(([x, c], j) => {
                  const show = x.slice(
                    0,
                    Math.max(0, Math.min(x.length, left)),
                  );
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
      {/* terminal */}
      <div
        className="tool flex items-center gap-4 px-5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[15px]"
        style={{ ...box(40, 520, 640, 60), ...fly(term, 0, 40, 12) }}
      >
        <span className="text-green">~/your-product $</span>
        <span className="text-body">{typed(C.cmd, seg(s, 2.02, 2.2))}</span>
        <span
          className="ml-auto flex items-center gap-2 text-green"
          style={fly(expo(seg(s, 2.22, 2.45)), 20, 0, 8)}
        >
          <CheckCircle size={17} weight="fill" /> {C.ok}
        </span>
      </div>
    </>
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
