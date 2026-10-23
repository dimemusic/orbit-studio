import { CheckCircle, Lock } from "@phosphor-icons/react/dist/ssr";
import { PROCESS } from "@/lib/content";
import { Abs, Caret, ease, seg, typed } from "./util";

const L = PROCESS.demo.launch;

// browser window being assembled (stage coords, 1000×640)
const W = { x: 150, y: 90, w: 480, h: 400 };
/** pieces of the site: final rect inside the window + where they fly in from */
const PIECES = [
  { x: 0, y: 30, w: 480, h: 40, from: [-260, -120, -14], c: "#e6e0d4" },
  { x: 20, y: 86, w: 440, h: 150, from: [320, -160, 10], c: "#d9c6a5" },
  { x: 20, y: 252, w: 136, h: 96, from: [-300, 200, -18], c: "#efe9de" },
  { x: 172, y: 252, w: 136, h: 96, from: [40, 280, 12], c: "#efe9de" },
  { x: 324, y: 252, w: 136, h: 96, from: [340, 190, 16], c: "#efe9de" },
  { x: 0, y: 362, w: 480, h: 38, from: [-120, 300, -8], c: "#1a1714" },
];

/** Launch: the site assembles from its parts, gets packed into a box, the box travels to the client, the client's site goes live. */
export function LaunchScene({ t }: { t: number }) {
  // 1) assemble 0 → .38
  const piece = (i: number) => ease(seg(t, 0.02 + i * 0.05, 0.16 + i * 0.05));
  // 2) pack .42 → .6: window shrinks into the box, lid closes
  const shrink = ease(seg(t, 0.42, 0.56));
  const lid = ease(seg(t, 0.55, 0.62));
  const boxIn = ease(seg(t, 0.38, 0.46));
  // 3) ship .62 → .8
  const ship = ease(seg(t, 0.63, 0.8));
  // 4) live .8 → 1
  const live = ease(seg(t, 0.8, 0.88));
  const url = typed(L.url, seg(t, 0.84, 0.92));
  const checks = L.checks.map((_, i) => t > 0.88 + i * 0.025);

  const box = { x: 290, y: 400 };
  // window flies into the box: move its centre onto the box and shrink
  const winScale = 1 - shrink * 0.75;
  const dx = (box.x + 100 - (W.x + W.w / 2)) * shrink;
  const dy = (box.y + 60 - (W.y + W.h / 2)) * shrink;

  return (
    <div className="absolute inset-0">
      {/* assembled site window */}
      <Abs
        x={W.x}
        y={W.y}
        w={W.w}
        h={W.h}
        className="origin-center overflow-hidden rounded-xl border border-white/15 bg-[#f4f0e8] shadow-[0_30px_70px_-20px_rgb(0_0_0/0.85)]"
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(${winScale})`,
          opacity: 1 - lid,
          visibility: lid >= 1 ? "hidden" : "visible",
        }}
      >
        <div className="flex h-[30px] items-center gap-1.5 bg-[#e6e0d4] px-3">
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
          <i className="size-2 rounded-full bg-black/20" />
        </div>
        {PIECES.map((pc, i) => {
          const k = piece(i);
          const [fx, fy, fr] = pc.from;
          return (
            <div
              key={i}
              className="absolute rounded-lg"
              style={{
                left: pc.x,
                top: pc.y,
                width: pc.w,
                height: pc.h,
                background: pc.c,
                opacity: k,
                transform: `translate(${fx * (1 - k)}px, ${fy * (1 - k)}px) rotate(${fr * (1 - k)}deg)`,
                boxShadow: k < 1 ? "0 18px 30px -10px rgb(0 0 0 / 0.5)" : "none",
                borderRadius: i === 0 || i === 5 ? 0 : 10,
              }}
            >
              {i === 1 && (
                <div className="p-5">
                  <i className="block h-5 w-48 rounded-full bg-[#1a1714]/70" />
                  <i className="mt-3 block h-2.5 w-64 rounded-full bg-[#1a1714]/25" />
                  <i className="mt-5 block h-8 w-28 rounded-full bg-[#3d5a3a]" />
                </div>
              )}
              {i >= 2 && i <= 4 && <div className="m-2 h-12 rounded-md bg-[#d9c6a5]" />}
            </div>
          );
        })}
      </Abs>

      {/* the box (MaxArt packing) */}
      <Abs
        x={box.x + ship * 330}
        y={box.y - ship * 40}
        w={200}
        h={140}
        style={{
          opacity: boxIn * (1 - seg(t, 0.78, 0.82)),
          transform: `translateY(${(1 - boxIn) * 40}px) scale(${1 - ship * 0.35}) rotate(${Math.sin(ship * Math.PI) * -4}deg)`,
        }}
      >
        {/* lid */}
        <div
          className="absolute -top-3 left-0 h-6 w-full origin-bottom rounded-md bg-[#c69a63]"
          style={{ transform: `perspective(400px) rotateX(${(1 - lid) * 110}deg)` }}
        />
        <div className="absolute inset-0 top-2 grid place-items-center rounded-md bg-gradient-to-b from-[#d6a96f] to-[#b8874f] shadow-[0_24px_40px_-14px_rgb(0_0_0/0.8)]">
          <span className="rounded bg-[#05070d]/80 px-2.5 py-1 text-[11px] font-semibold text-fg">{L.pack}</span>
        </div>
        {/* motion trail while shipping */}
        <div className="absolute right-full top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-l from-white/40 to-transparent" style={{ width: Math.sin(ship * Math.PI) * 220 }} />
      </Abs>

      {/* client's laptop */}
      <Abs x={590} y={120} w={340} style={{ opacity: seg(t, 0.6, 0.7), transform: `translateY(${(1 - seg(t, 0.6, 0.7)) * 20}px)` }}>
        <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-grey">{L.client}</p>
        <div className="rounded-t-xl border border-white/15 bg-[#14171e] p-2">
          <div className="relative h-[200px] overflow-hidden rounded-md bg-black">
            <div className="absolute inset-0 bg-[#f4f0e8] transition-opacity duration-500" style={{ opacity: live }}>
              <div className="flex h-6 items-center gap-1.5 bg-[#e6e0d4] px-2 text-[9px] text-[#5c564c]">
                <Lock size={9} weight="fill" className="text-[#1f8f5f]" />
                {url}
                <Caret on={t > 0.84 && t < 0.93} color="#1a1714" />
              </div>
              <div className="p-3">
                <i className="block h-2 w-12 rounded-full bg-[#1a1714]" />
                <div className="mt-3 rounded-md bg-[#d9c6a5] p-3">
                  <i className="block h-3 w-28 rounded-full bg-[#1a1714]/70" />
                  <i className="mt-2 block h-4 w-14 rounded-full bg-[#3d5a3a]" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <i className="h-8 rounded bg-[#efe9de]" />
                  <i className="h-8 rounded bg-[#efe9de]" />
                  <i className="h-8 rounded bg-[#efe9de]" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-[-16px] h-3 rounded-b-xl bg-gradient-to-b from-[#3a3f4a] to-[#15181f]" />
      </Abs>

      {/* result, left column (the assembly area is empty by now) */}
      <Abs x={110} y={170} w={400}>
        <p
          className={`text-[44px] font-semibold leading-none tracking-[-0.045em] transition-all duration-700 ${
            t > 0.9 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="text-gradient tg-fresh">{L.done}</span>
        </p>
        <p
          className={`mt-6 flex w-max items-center gap-2 rounded-full border border-green/30 bg-[#0d1a17] px-3.5 py-1.5 text-[13px] font-semibold text-green transition-all duration-500 ${
            t > 0.9 ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          <span className="size-2 animate-pulse rounded-full bg-green" /> {L.online}
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {L.checks.map((c, i) => (
            <li key={c} className={`flex items-center gap-2 text-[13px] transition-all duration-300 ${checks[i] ? "text-fg opacity-100" : "translate-x-2 text-grey opacity-0"}`}>
              <CheckCircle size={15} weight="fill" className="text-green" /> {c}
            </li>
          ))}
        </ul>
      </Abs>
    </div>
  );
}
