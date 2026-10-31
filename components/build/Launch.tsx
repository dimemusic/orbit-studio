import {
  ChartLineUp,
  ChatCircleDots,
  Check,
  EnvelopeSimple,
  GraduationCap,
  Lock,
  ShieldCheck,
  ShoppingBag,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { along, Caret, ease, expo, seg, smooth, typed } from "./util";
import { ALL_EDITS, DesignScreen, HERO_BTN } from "./Design";
import { box, BrowserBar, fly, useB } from "./shared";

/* ---------------- 4 · Launch ---------------- */
const BR = { x: 540, y: 20, w: 600, h: 560 };
/** the page inside the browser: the designed 480 × 560 page scaled to the browser's height, centred */
const PAGE_K = 520 / 560;
const PAGE = { k: PAGE_K, x: (600 - 480 * PAGE_K) / 2, y: 40 };
/** the finale, in seconds of the held final frame: a visitor arrives, a request and an order come in */
const EVENT_AT = [0.5, 1.5, 2.5];
const EVENT_ICON = [UserCircle, EnvelopeSimple, ShoppingBag];
const EVENT_COLOR = ["#5aa2ff", "#a78bfa", "#34d399"];
/** the visitor's cursor in the browser (browser coordinates): enters, clicks the hero button, browses on */
const VISITOR: [number, number, number][] = [
  [0.2, 560, 600],
  [1.1, PAGE.x + (HERO_BTN.x + HERO_BTN.w * 0.55) * PAGE.k, PAGE.y + (HERO_BTN.y + HERO_BTN.h * 0.6) * PAGE.k],
  [1.35, PAGE.x + (HERO_BTN.x + HERO_BTN.w * 0.55) * PAGE.k, PAGE.y + (HERO_BTN.y + HERO_BTN.h * 0.6) * PAGE.k],
  [2.6, 330, 470],
  [4.4, 420, 500],
];
const PRESS = [1.1, 1.35];
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

/** the moment the site goes live: the product frame's border turns green with it (build/Product.tsx) */
export const launchLift = (s: number) => ease(seg(s, 2.0, 2.4));

export function LaunchStage({ s, hold = 0 }: { s: number; hold?: number }) {
  const { L } = useB();
  return (
    <>
      {/* the finale (held final frame): the first things happen on the live site, newest on top */}
      {L.events.map((e, i) => {
        const k = expo(seg(hold, EVENT_AT[i], EVENT_AT[i] + 0.55));
        if (k <= 0) return null;
        // pushed down by every newer one that has arrived
        const below = L.events.reduce((n, _, j) => n + (j > i ? smooth(seg(hold, EVENT_AT[j], EVENT_AT[j] + 0.45)) : 0), 0);
        const Ic = EVENT_ICON[i];
        return (
          <div
            key={e.t}
            className="tool z-10 flex items-center gap-3 px-3.5"
            style={{ ...box(BR.x + BR.w - 24 - 272, BR.y + 56 + below * 66, 272, 56), ...fly(k, 48, 0, 10) }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ background: `${EVENT_COLOR[i]}26`, color: EVENT_COLOR[i] }}>
              <Ic size={18} weight="fill" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[14px] font-semibold text-fg">{e.t}</span>
              <span className="mt-0.5 block truncate text-[12px] text-grey">{e.d}</span>
            </span>
          </div>
        );
      })}
      {/* launch checklist: every item has its own icon and its own little motion */}
      <div
        className="flex items-center justify-between"
        style={{ ...box(40, BR.y, 430, 16), ...fly(expo(seg(s, 0.02, 0.5)), -40, 0, 8) }}
      >
        <span className="tool-label">{L.listLabel}</span>
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
                className="absolute inset-0 grid place-items-center rounded-full text-green"
                style={{ transform: `scale(${done.toFixed(3)})`, opacity: done, background: "rgb(52 211 153 / 0.14)", boxShadow: "inset 0 0 0 1px rgb(52 211 153 / 0.45)" }}
              >
                <Check size={15} weight="bold" />
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
}

/** the browser (600 × 560): the site assembles, goes live, and (during the held final frame, `hold` seconds)
 *  gets its first visitor. Lives inside the product frame. */
export function LaunchScreen({ s, hold = 0 }: { s: number; hold?: number }) {
  const { L } = useB();
  const url = typed(L.url, seg(s, 1.25, 1.65));
  const deploy = ease(seg(s, 1.6, 2.0));
  const sweep = seg(s, 2.0, 2.45);
  const online = expo(seg(s, 2.0, 2.35));
  // the finale (held final frame)
  const count = expo(seg(hold, 0.35, 0.8));
  const visitors = Math.max(1, Math.round(1 + 23 * ease(seg(hold, 0.5, 4.2))));
  const press = Math.sin(Math.PI * seg(hold, PRESS[0], PRESS[1]));
  const cursor = along(hold, VISITOR);
  const cursorOn = Math.min(seg(hold, 0.2, 0.5), 1 - seg(hold, 4.2, 4.5));
  return (
    <div className="absolute inset-0">
      <BrowserBar
        h={40}
        lock={s > 1.65}
        url={
          <>
            {url}
            <Caret on={s > 1.25 && s < 1.7} color="#1a1714" />
          </>
        }
        right={
          // live status: a round ping on the dot, the pill itself stays still
          <span
            className="flex items-center gap-2 rounded-full bg-[#1f8f5f]/12 px-3 py-1 text-[12px] font-semibold text-[#1f8f5f]"
            style={fly(online, 12, 0, 6)}
          >
            <span className="relative grid size-2 place-items-center">
              {online > 0.5 && <span className="absolute inset-0 animate-ping rounded-full bg-[#1f8f5f]/60" />}
              <span className="relative size-2 rounded-full bg-[#1f8f5f]" />
            </span>
            {/* the finale: «Online» rolls over into a live visitor count */}
            <span className="grid overflow-hidden">
              <span className="col-start-1 row-start-1" style={swapOut(count)}>
                {L.online}
              </span>
              <span className="col-start-1 row-start-1 whitespace-nowrap tabular-nums" style={swapIn(count)}>
                {visitors} {L.visitors}
              </span>
            </span>
          </span>
        }
      />
      {/* the SAME page, with the panel's edits, now on its own domain (centred like a page with a max width) */}
      <div className="absolute origin-top-left" style={{ left: PAGE.x, top: PAGE.y, width: 480, height: 560, transform: `scale(${PAGE.k})` }}>
        <DesignScreen s={3} edits={ALL_EDITS} />
        {/* the first visitor's click on the hero button: a soft ring */}
        {press > 0 && (
          <span
            className="pointer-events-none absolute rounded-full"
            style={{
              ...box(HERO_BTN.x, HERO_BTN.y, HERO_BTN.w, HERO_BTN.h),
              boxShadow: `0 0 0 ${(press * 8).toFixed(1)}px rgb(26 23 20 / ${(press * 0.18).toFixed(3)})`,
            }}
          />
        )}
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
      {/* the first visitor's cursor */}
      {cursorOn > 0 && (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="absolute z-[4] [filter:drop-shadow(0_2px_3px_rgb(0_0_0/0.35))]"
          style={{ left: cursor.x - 4, top: cursor.y - 2, opacity: cursorOn, transform: `scale(${(1 - press * 0.12).toFixed(3)})`, transformOrigin: "4px 2px" }}
        >
          <path d="M4 2v17.2l4.1-3.9 2.9 6.6 2.9-1.25-2.85-6.45h5.9z" fill="#1a1714" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/** label roll: the old one leaves upwards as the new one rises in (k: 0 → 1) */
const swapOut = (k: number) => ({ transform: `translateY(${(-k * 110).toFixed(1)}%)`, opacity: 1 - k });
const swapIn = (k: number) => ({ transform: `translateY(${((1 - k) * 110).toFixed(1)}%)`, opacity: k });
