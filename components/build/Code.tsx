import {
  CheckCircle,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";
import { Caret, ease, expo, seg, typed } from "./util";
import { box, fly, useB, Visual } from "./shared";

/* ---------------- 2 · Code ---------------- */

export function CodeStage({ s }: { s: number }) {
  const { BUILD, C, CHARS, LEN, LINES, START } = useB();
  const chars = Math.round(seg(s, 0.3, 1.95) * CHARS);
  const lineK = (i: number) =>
    Math.min(1, Math.max(0, (chars - START[i]) / LEN[i]));
  const cur = LINES.findIndex((_, i) => chars < START[i] + LEN[i]);
  const textOf = (line: number, tok: number) => {
    const before = LINES[line]
      .slice(0, tok)
      .reduce((a, [x]) => a + x.length, 0);
    return typed(
      LINES[line][tok][0],
      (chars - START[line] - before) / LINES[line][tok][0].length,
    );
  };
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
      {/* live preview building as the code is written */}
      <div
        className="overflow-hidden rounded-xl bg-[#f4f0e8] text-[#1a1714] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]"
        style={{
          ...box(730, 20, 430, 560),
          ...fly(expo(seg(s, 0.06, 0.6)), 220, 0, 18),
        }}
      >
        <div className="flex h-8 items-center gap-1.5 bg-[#e6e0d4] px-3">
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <span className="ml-2 rounded bg-white/70 px-2 text-[11px] text-[#5c564c]">
            localhost:3000
          </span>
        </div>
        <div className="p-5">
          <div
            className="relative h-[144px] overflow-hidden rounded-xl"
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
    </>
  );
}
