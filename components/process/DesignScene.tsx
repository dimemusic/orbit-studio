import { Cursor, FrameCorners, Hand, Image as ImageIcon, PenNib, Square, TextT } from "@phosphor-icons/react/dist/ssr";
import { PROCESS } from "@/lib/content";
import { Abs, along, Caret, ease, Pointer, seg, typed, Win } from "./util";

const D = PROCESS.demo.design;
const SWATCHES = ["#e8492a", "#8b5cf6", "#22d3ee", "#3d8bff"];
const TOOLS = [Cursor, FrameCorners, Square, TextT, PenNib, Hand];

// artboard inside the stage (canvas area is x 200..800)
const AB = { x: 236, y: 66, w: 528, h: 470 };

/** Figma-like editor: frame is dragged out, image block, headline typed, colour picked for the button. */
export function DesignScene({ t }: { t: number }) {
  const frame = ease(seg(t, 0.02, 0.15));
  const img = ease(seg(t, 0.18, 0.32));
  const title = seg(t, 0.37, 0.56);
  const sub = seg(t, 0.56, 0.6);
  const btn = ease(seg(t, 0.6, 0.66));
  const pick = seg(t, 0.7, 0.86);
  const hover = Math.min(SWATCHES.length - 1, Math.floor(pick * SWATCHES.length));
  const chosen = t >= 0.86;
  const btnColor = chosen ? SWATCHES[3] : pick > 0 ? SWATCHES[hover] : "#c9c5bd";

  const tool = t < 0.16 ? 1 : t < 0.34 ? 2 : t < 0.6 ? 3 : 0;
  const sel = t < 0.16 ? "frame" : t < 0.35 ? "img" : t < 0.6 ? "title" : "btn";
  const selBox =
    sel === "frame"
      ? { x: AB.x, y: AB.y, w: AB.w * frame, h: AB.h * frame }
      : sel === "img"
        ? { x: AB.x + 24, y: AB.y + 64, w: 480 * img, h: 160 }
        : sel === "title"
          ? { x: AB.x + 20, y: AB.y + 246, w: 420, h: 56 }
          : { x: AB.x + 20, y: AB.y + 362, w: 164 * btn, h: 52 };
  const layers = [t > 0.02, t > 0.18, t > 0.37, t > 0.6];

  const p = along(t, [
    [0, AB.x + 4, AB.y + 4],
    [0.15, AB.x + AB.w, AB.y + AB.h],
    [0.18, AB.x + 26, AB.y + 66],
    [0.32, AB.x + 500, AB.y + 222],
    [0.36, AB.x + 28, AB.y + 270],
    [0.56, AB.x + 380, AB.y + 278],
    [0.6, AB.x + 26, AB.y + 368],
    [0.66, AB.x + 180, AB.y + 410],
    [0.7, 832, 300],
    [0.86, 832 + 3 * 40, 300],
    [0.92, AB.x + 120, AB.y + 388],
    [1, AB.x + 120, AB.y + 388],
  ]);
  const down = (t > 0.02 && t < 0.15) || (t > 0.18 && t < 0.32) || (t > 0.6 && t < 0.66) || (t > 0.84 && t < 0.88);

  return (
    <Win title={D.file}>
      {/* toolbar */}
      <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-center gap-1 border-b border-white/[0.07] bg-[#0d111a]">
        {TOOLS.map((Ic, i) => (
          <span key={i} className={`grid size-8 place-items-center rounded-md transition-colors duration-300 ${i === tool ? "bg-violet text-white" : "text-grey"}`}>
            <Ic size={16} />
          </span>
        ))}
      </div>
      {/* layers */}
      <div className="absolute bottom-0 left-0 top-11 w-[200px] border-r border-white/[0.07] bg-[#0c1018] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{D.layersLabel}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {D.layers.map((l, i) => (
            <li
              key={l}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-all duration-500 ${layers[i] ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"} ${
                ["frame", "img", "title", "btn"][i] === sel ? "bg-violet/20 text-fg" : "text-body"
              }`}
              style={{ paddingLeft: i ? 22 : 8 }}
            >
              {i === 0 ? <FrameCorners size={12} /> : i === 1 ? <ImageIcon size={12} /> : i === 2 ? <TextT size={12} /> : <Square size={12} />}
              {l}
            </li>
          ))}
        </ul>
      </div>
      {/* properties */}
      <div className="absolute bottom-0 right-0 top-11 w-[200px] border-l border-white/[0.07] bg-[#0c1018] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{D.props}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] tabular-nums">
          <span className="rounded-md bg-white/[0.05] px-2 py-1.5 text-body">W {Math.round(selBox.w)}</span>
          <span className="rounded-md bg-white/[0.05] px-2 py-1.5 text-body">H {Math.round(selBox.h)}</span>
        </div>
        <p className="mt-4 text-[11px] text-grey">{D.fill}</p>
        <div className="mt-1.5 flex items-center gap-2 rounded-md bg-white/[0.05] px-2 py-1.5 text-[12px] text-body">
          <span className="size-3.5 rounded-sm" style={{ background: sel === "btn" ? btnColor : sel === "title" ? "#1a1714" : "#efe9de" }} />
          <span className="uppercase tabular-nums">{sel === "btn" ? btnColor : sel === "title" ? "#1a1714" : "#efe9de"}</span>
        </div>
        {sel === "title" && <p className="mt-3 rounded-md bg-white/[0.05] px-2 py-1.5 text-[12px] text-body">{D.font}</p>}
        {/* colour picker */}
        <div className={`mt-5 transition-all duration-500 ${t > 0.66 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="text-[11px] text-grey">{D.picker}</p>
          <div className="mt-2 h-20 rounded-md" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${btnColor})` }} />
          <div className="mt-2 flex gap-2.5">
            {SWATCHES.map((c, i) => (
              <span
                key={c}
                className="size-7 rounded-full transition-[box-shadow,transform] duration-200"
                style={{ background: c, boxShadow: pick > 0 && i === (chosen ? 3 : hover) ? `0 0 0 2px #0c1018, 0 0 0 4px ${c}` : "none", transform: i === hover && pick > 0 && !chosen ? "scale(1.12)" : "none" }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* canvas */}
      <div className="absolute bottom-0 left-[200px] right-[200px] top-11 bg-[#11151f] [background-image:radial-gradient(rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:16px_16px]" />
      {/* artboard (site being drawn) */}
      <Abs x={AB.x} y={AB.y} w={AB.w} h={AB.h} style={{ clipPath: `inset(0 ${(1 - frame) * 100}% ${(1 - frame) * 100}% 0 round 4px)` }} className="bg-[#f4f0e8]">
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="h-3 w-16 rounded-full bg-[#1a1714]" />
          <span className="flex gap-3">
            <i className="h-2 w-10 rounded-full bg-[#1a1714]/25" />
            <i className="h-2 w-10 rounded-full bg-[#1a1714]/25" />
            <i className="h-2 w-10 rounded-full bg-[#1a1714]/25" />
          </span>
        </div>
        <div className="mx-6 mt-6 h-[160px] origin-left rounded-xl" style={{ transform: `scaleX(${img})`, background: "linear-gradient(120deg,#d9c6a5,#b98a5e 55%,#7a4e32)" }}>
          <ImageIcon size={34} className="m-auto block translate-y-[60px] text-white/70" style={{ opacity: seg(t, 0.28, 0.34) }} />
        </div>
        <p className="mx-5 mt-6 min-h-[56px] text-[40px] font-semibold leading-none tracking-[-0.045em] text-[#1a1714]">
          {typed(D.title, title)}
          <Caret on={t > 0.36 && t < 0.6} color="#1a1714" />
        </p>
        <div className="mx-6 mt-2 flex flex-col gap-2" style={{ opacity: sub }}>
          <i className="h-2.5 w-80 rounded-full bg-[#1a1714]/20" />
          <i className="h-2.5 w-60 rounded-full bg-[#1a1714]/20" />
        </div>
        <span
          className="mx-6 mt-7 grid h-[44px] w-[150px] origin-left place-items-center rounded-full text-[14px] font-semibold text-white transition-colors duration-300"
          style={{ transform: `scale(${btn})`, background: btnColor }}
        >
          {D.button}
        </span>
      </Abs>
      {/* selection */}
      {t > 0.02 && (
        <Abs x={selBox.x - 2} y={selBox.y - 2} w={selBox.w + 4} h={selBox.h + 4} className="pointer-events-none border-[1.5px] border-violet">
          {[
            [-4, -4],
            [selBox.w - 2, -4],
            [-4, selBox.h - 2],
            [selBox.w - 2, selBox.h - 2],
          ].map(([x, y], i) => (
            <i key={i} className="absolute size-2 border border-violet bg-white" style={{ left: x, top: y }} />
          ))}
        </Abs>
      )}
      <Pointer x={p.x} y={p.y} down={down} />
    </Win>
  );
}
