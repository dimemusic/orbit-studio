import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PROCESS } from "@/lib/content";
import { Caret, ease, seg, typed, Win } from "./util";

const C = PROCESS.demo.code;

// syntax colours
const K = "#c792ea"; // keyword
const T = "#7fdbca"; // tag / component
const A = "#addb67"; // attribute
const S = "#ecc48d"; // string
const P = "#8b919c"; // punctuation
const X = "#d6deeb"; // text

type Tok = [string, string];
const LINES: Tok[][] = [
  [["export default function ", K], ["Home", T], ["() {", P]],
  [["  return ", K], ["(", P]],
  [["    <", P], ["main", T], [" className", A], ["=", P], ['"site"', S], [">", P]],
  [["      <", P], ["Header", T], [" logo", A], ["=", P], ['"Maina"', S], [" />", P]],
  [["      <", P], ["section", T], [" className", A], ["=", P], ['"hero"', S], [">", P]],
  [["        <", P], ["h1", T], [">", P], [C.h1, X], ["</", P], ["h1", T], [">", P]],
  [["        <", P], ["p", T], [">", P], [C.p, X], ["</", P], ["p", T], [">", P]],
  [["        <", P], ["Button", T], [">", P], [C.btn, X], ["</", P], ["Button", T], [">", P]],
  [["      </", P], ["section", T], [">", P]],
  [["      <", P], ["Products", T], [" items", A], ["=", P], ["{", P], ["products", X], ["}", P], [" />", P]],
  [["    </", P], ["main", T], [">", P]],
  [["  );", P]],
  [["}", P]],
];
const LEN = LINES.map((l) => l.reduce((n, [s]) => n + s.length, 0));
const TOTAL = LEN.reduce((a, b) => a + b, 0);
/** char offset where each line starts */
const START = LEN.reduce<number[]>((acc, _, i) => [...acc, i ? acc[i - 1] + LEN[i - 1] : 0], []);

/** Code editor typing the page live; the preview on the right builds as the code is written; build in the terminal. */
export function CodeScene({ t }: { t: number }) {
  const chars = Math.round(seg(t, 0, 0.78) * TOTAL);
  const lineAt = (i: number) => Math.min(1, Math.max(0, (chars - START[i]) / LEN[i])); // 0..1 typed of line i
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  // how much of a text token inside a line is typed
  const textOf = (line: number, tok: number) => {
    const before = LINES[line].slice(0, tok).reduce((n, [s]) => n + s.length, 0);
    const len = LINES[line][tok][0].length;
    return typed(LINES[line][tok][0], (chars - START[line] - before) / len);
  };

  const cmd = seg(t, 0.8, 0.86);
  return (
    <Win title={C.file}>
      {/* editor */}
      <div className="absolute bottom-[150px] left-0 top-0 w-[590px] overflow-hidden bg-[#0a0d15] px-2 py-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[14px] leading-[26px]">
        {LINES.map((line, i) => {
          let left = chars - START[i];
          return (
            <div key={i} className={`flex rounded-sm ${i === cur ? "bg-white/[0.04]" : ""}`}>
              <span className="w-9 shrink-0 select-none pr-3 text-right text-faint">{i + 1}</span>
              <span className="whitespace-pre">
                {line.map(([s, c], k) => {
                  const show = s.slice(0, Math.max(0, Math.min(s.length, left)));
                  left -= s.length;
                  return (
                    <span key={k} style={{ color: c }}>
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
      <div className="absolute bottom-0 left-0 h-[150px] w-[590px] border-t border-white/[0.07] bg-[#080a10] px-5 py-4 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[13px] leading-[24px]">
        <p className="text-grey">
          <span className="text-green">~/maina</span> $ {typed(C.cmd, cmd)}
          {t > 0.79 && t < 0.88 && <Caret />}
        </p>
        <p className={`flex items-center gap-2 text-green transition-opacity duration-300 ${t > 0.88 ? "opacity-100" : "opacity-0"}`}>
          <CheckCircle size={14} weight="fill" /> {C.ok1}
        </p>
        <p className={`flex items-center gap-2 text-green transition-opacity duration-300 ${t > 0.94 ? "opacity-100" : "opacity-0"}`}>
          <CheckCircle size={14} weight="fill" /> {C.ok2}
        </p>
      </div>
      {/* live preview */}
      <div className="absolute bottom-0 right-0 top-0 w-[410px] border-l border-white/[0.07] bg-[#0d111a] p-5">
        <div className="h-full overflow-hidden rounded-lg border border-white/10 bg-[#f4f0e8]">
          <div className="flex h-7 items-center gap-1.5 bg-[#e6e0d4] px-3">
            <i className="size-2 rounded-full bg-black/20" />
            <i className="size-2 rounded-full bg-black/20" />
            <span className="ml-2 rounded bg-white/70 px-2 text-[10px] text-[#5c564c]">{C.url}</span>
          </div>
          <div className="p-5 text-[#1a1714]">
            <div className="flex items-center justify-between transition-all duration-500" style={{ opacity: lineAt(3), transform: `translateY(${(1 - ease(lineAt(3))) * 8}px)` }}>
              <span className="text-[15px] font-semibold tracking-[-0.03em]">Maina</span>
              <span className="flex gap-2">
                <i className="h-1.5 w-8 rounded-full bg-black/20" />
                <i className="h-1.5 w-8 rounded-full bg-black/20" />
              </span>
            </div>
            <div className="mt-6 rounded-xl p-5 transition-colors duration-500" style={{ background: lineAt(4) > 0.5 ? "#e9dfcd" : "transparent" }}>
              <p className="min-h-[34px] text-[28px] font-semibold leading-none tracking-[-0.045em]">{textOf(5, 3)}</p>
              <p className="mt-2 min-h-[18px] text-[13px] text-[#5c564c]">{textOf(6, 3)}</p>
              <span
                className="mt-4 inline-grid h-9 place-items-center rounded-full bg-[#3d5a3a] px-5 text-[12px] font-semibold text-white transition-all duration-300"
                style={{ opacity: lineAt(7) > 0.3 ? 1 : 0, transform: `scale(${lineAt(7) > 0.3 ? 1 : 0.8})` }}
              >
                {textOf(7, 3) || " "}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((k) => {
                const on = lineAt(9) > (k + 1) / 4;
                return (
                  <div key={k} className="rounded-lg bg-white p-2 transition-all duration-500" style={{ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 10}px)` }}>
                    <div className="h-14 rounded-md" style={{ background: ["#d9c6a5", "#c7b08a", "#b98a5e"][k] }} />
                    <i className="mt-2 block h-1.5 w-3/4 rounded-full bg-black/20" />
                    <i className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-black/10" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Win>
  );
}
