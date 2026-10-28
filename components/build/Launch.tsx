import {
  ChartLineUp,
  ChatCircleDots,
  Check,
  GraduationCap,
  Lock,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Caret, ease, expo, seg, typed } from "./util";
import { box, fly, useB, Visual } from "./shared";

/* ---------------- 4 · Launch ---------------- */
const BR = { x: 540, y: 20, w: 600, h: 560 };
const PIECES = [
  { x: 0, y: 40, w: 600, h: 50, dx: -420, dy: -120, c: "#e6e0d4" },
  { x: 24, y: 112, w: 552, h: 236, dx: 460, dy: -80, c: "#efe9de" },
  { x: 24, y: 364, w: 170, h: 172, dx: -480, dy: 160, c: "#efe9de" },
  { x: 215, y: 364, w: 170, h: 172, dx: 0, dy: 320, c: "#efe9de" },
  { x: 406, y: 364, w: 170, h: 172, dx: 480, dy: 160, c: "#efe9de" },
];
/** launch checklist: when each item finishes (beats), its colour and icon */
const DONE = [1.05, 1.4, 1.75, 2.1];
/** the checklist spans exactly the browser's height: 16px header + 20px gap + 4 rows of 120 with 14px gaps = 558 */
const ROW_H = 120;
const ROW_Y = BR.y + 36;
const CHECK = [
  { color: "#5aa2ff", icon: ShieldCheck },
  { color: "#a78bfa", icon: ChartLineUp },
  { color: "#22d3ee", icon: GraduationCap },
  { color: "#34d399", icon: ChatCircleDots },
];

export function LaunchStage({ s }: { s: number }) {
  const { BUILD, L } = useB();
  const shell = expo(seg(s, 0.03, 0.55));
  const url = typed(L.url, seg(s, 1.25, 1.65));
  const deploy = ease(seg(s, 1.6, 2.0));
  const sweep = seg(s, 2.0, 2.45);
  const online = expo(seg(s, 2.0, 2.35));
  const lift = ease(seg(s, 2.0, 2.4));
  return (
    <>
      {/* browser assembling */}
      <div
        className="overflow-hidden rounded-2xl border bg-[#f4f0e8]"
        style={{
          ...box(BR.x, BR.y, BR.w, BR.h),
          ...fly(
            shell,
            0,
            60,
            18,
            shell < 1 ? `scale(${0.9 + shell * 0.1})` : "",
          ),
          borderColor: `rgb(52 211 153 / ${0.15 + lift * 0.45})`,
          boxShadow: "0 50px 110px -30px rgb(0 0 0 / 0.95)",
        }}
      >
        <div className="flex h-10 items-center gap-2 bg-[#e6e0d4] px-4">
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <i className="size-2.5 rounded-full bg-black/20" />
          <span className="ml-4 flex h-6 min-w-[220px] items-center gap-1.5 rounded-md bg-white/80 px-3 text-[13px] text-[#3f3a33]">
            <Lock
              size={12}
              weight="fill"
              className={s > 1.65 ? "text-[#1f8f5f]" : "text-black/25"}
            />
            {url}
            <Caret on={s > 1.25 && s < 1.7} color="#1a1714" />
          </span>
          {/* live status: a round ping on the dot, the pill itself stays still */}
          <span
            className="ml-auto flex items-center gap-2 rounded-full bg-[#1f8f5f]/12 px-3 py-1 text-[12px] font-semibold text-[#1f8f5f]"
            style={fly(online, 12, 0, 6)}
          >
            <span className="relative grid size-2 place-items-center">
              {online > 0.5 && <span className="absolute inset-0 animate-ping rounded-full bg-[#1f8f5f]/60" />}
              <span className="relative size-2 rounded-full bg-[#1f8f5f]" />
            </span>
            {L.online}
          </span>
        </div>
        {/* deploy progress under the address bar */}
        <span
          className="absolute left-0 top-10 z-[2] h-[3px] w-full origin-left bg-gradient-to-r from-[#5aa2ff] to-[#34d399]"
          style={{
            transform: `scaleX(${deploy})`,
            opacity: s < 2.4 ? 1 : 1 - seg(s, 2.4, 2.6),
          }}
        />
        {/* light sweep once it is live */}
        {sweep > 0 && sweep < 1 && (
          <span
            className="pointer-events-none absolute inset-y-0 z-[3] w-40 -skew-x-12"
            style={{
              left: `${-30 + sweep * 130}%`,
              // soft edges come from the gradient itself (was a blur(6px) filter on a moving layer)
              background:
                "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12) 25%, rgb(255 255 255 / 0.5) 50%, rgb(255 255 255 / 0.12) 75%, transparent)",
            }}
          />
        )}
        {PIECES.map((p, i) => {
          const k = expo(seg(s, 0.3 + i * 0.1, 0.95 + i * 0.1));
          return (
            <div
              key={i}
              className="absolute rounded-xl"
              style={{
                left: p.x,
                top: p.y,
                width: p.w,
                height: p.h,
                background: p.c,
                borderRadius: i === 0 ? 0 : 12,
                ...fly(
                  k,
                  p.dx,
                  p.dy,
                  22,
                  `rotate(${((1 - k) * (i % 2 ? 10 : -10)).toFixed(1)}deg)`,
                ),
              }}
            >
              {i === 0 && (
                <div className="flex h-full items-center justify-between px-6 text-[#1a1714]">
                  <span className="text-[18px] font-semibold tracking-[-0.03em]">
                    {BUILD.brand}
                  </span>
                  <span className="flex gap-4 text-[12px] font-medium text-[#5c564c]">
                    {BUILD.design.nav.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                </div>
              )}
              {i === 1 && (
                <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-xl p-7 text-[#1a1714]">
                  <div className="absolute inset-y-3 right-3 w-[270px] overflow-hidden rounded-lg">
                    <Visual />
                  </div>
                  <p className="relative text-[30px] font-semibold leading-none tracking-[-0.045em]">
                    {BUILD.design.title}
                  </p>
                  <p className="relative mt-2.5 text-[13px] text-[#5c564c]">
                    {BUILD.design.sub}
                  </p>
                  <span className="relative mt-5 inline-grid h-10 self-start place-items-center rounded-full bg-[#1a1714] px-5 text-[13px] font-semibold text-white">
                    {BUILD.design.button}
                  </span>
                </div>
              )}
              {i >= 2 && (
                <div className="flex h-full flex-col p-3">
                  <div className="relative h-[106px] shrink-0 overflow-hidden rounded-lg">
                    <Visual v={i - 2} />
                  </div>
                  <p className="mt-2.5 truncate text-[12px] font-semibold leading-tight text-[#1a1714]">
                    {BUILD.design.plans[i - 2].name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-[#7a7368]">
                    {BUILD.design.plans[i - 2].price}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* launch checklist: every item has its own icon and its own little motion */}
      <div
        className="flex items-center justify-between"
        style={{ ...box(40, BR.y, 430, 16), ...fly(expo(seg(s, 0.02, 0.5)), -40, 0, 8) }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-grey">{L.listLabel}</span>
        <span className="text-[13px] font-semibold tabular-nums text-fg">
          {DONE.filter((d) => s >= d).length}/{L.items.length}
        </span>
      </div>
      {L.items.map((it, i) => {
        const work = seg(s, DONE[i] - 0.5, DONE[i]);
        const done = expo(seg(s, DONE[i], DONE[i] + 0.3));
        const c = CHECK[i].color;
        const Ic = CHECK[i].icon;
        return (
          <div
            key={it.t}
            className="tool flex items-center gap-4 px-4"
            style={{
              ...box(40, ROW_Y + i * (ROW_H + 14), 430, ROW_H),
              ...fly(expo(seg(s, 0.06 + i * 0.07, 0.62 + i * 0.07)), -80, 0, 12),
            }}
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-xl"
              style={{
                background: `color-mix(in srgb, ${c} ${(12 + done * 10).toFixed(0)}%, transparent)`,
                color: c,
                transform: `scale(${(1 + Math.sin(Math.PI * done) * 0.12).toFixed(3)})`,
              }}
            >
              <Ic size={22} weight={done > 0.5 ? "fill" : "regular"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold leading-tight text-fg">{it.t}</p>
              <p className="mt-1 truncate text-[13px] leading-tight text-grey">{it.d}</p>
              {/* the item's own motion */}
              <div className="mt-2 flex h-3 items-center">
                {i === 0 && (
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: c, opacity: work > 0 ? 1 : 0 }}
                  >
                    <Lock size={11} weight="fill" /> {typed("https://", Math.min(1, work * 1.4))}
                  </span>
                )}
                {i === 1 && (
                  <svg
                    viewBox="0 0 120 12"
                    width="120"
                    height="12"
                    style={{ clipPath: `inset(0 ${((1 - work) * 100).toFixed(1)}% 0 0)` }}
                  >
                    <polyline
                      points="1,10 16,8 30,9 44,5 58,7 72,3 86,5 100,2 119,1"
                      fill="none"
                      stroke={c}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {i === 2 && (
                  <span className="block h-1.5 w-[160px] overflow-hidden rounded-full bg-white/[0.08]">
                    <span className="block h-full origin-left rounded-full" style={{ background: c, transform: `scaleX(${work})` }} />
                  </span>
                )}
                {i === 3 && (
                  <span className="flex items-center gap-1" style={{ opacity: work > 0 ? 1 : 0 }}>
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 rounded-full"
                        style={{
                          background: c,
                          transform: `translateY(${(done > 0.5 ? 0 : Math.sin(s * 18 - d * 1.2) * 2).toFixed(2)}px)`,
                          opacity: done > 0.5 ? 1 : 0.5 + 0.5 * Math.abs(Math.sin(s * 9 - d)),
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
            {/* status: progress ring, then a check */}
            <span className="relative grid size-8 shrink-0 place-items-center">
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${c} ${(work * 360).toFixed(1)}deg, rgb(255 255 255 / 0.1) 0deg)`,
                  WebkitMask: "radial-gradient(circle, transparent 58%, #000 60%)",
                  mask: "radial-gradient(circle, transparent 58%, #000 60%)",
                  opacity: 1 - done,
                }}
              />
              <span
                className="absolute inset-0 grid place-items-center rounded-full bg-green text-[#05070d]"
                style={{ transform: `scale(${done.toFixed(3)})`, opacity: done }}
              >
                <Check size={16} weight="bold" />
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
}
