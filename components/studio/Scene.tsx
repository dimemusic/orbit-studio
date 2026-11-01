"use client";

import {
  ArrowsClockwise,
  Bell,
  ChatCircleText,
  Check,
  CheckCircle,
  Code,
  Coffee,
  Globe,
  Lock,
  PaintBrushBroad,
  ReadCvLogo,
  ShoppingBag,
  SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { along } from "../build/util";
import { useContent } from "../Lang";
import { Site } from "./Site";
import { at, expo, HOLD, life, lerp, local, mix, seg, smooth, START, STEP, stepAt, TOTAL, Typed, typed, useStudio, type Rect } from "./engine";

type Icon = ComponentType<{ size?: number; weight?: "light" | "regular" | "bold" | "fill"; className?: string; style?: CSSProperties }>;
const STEP_ICON: Icon[] = [ChatCircleText, PaintBrushBroad, Code, SlidersHorizontal, Globe, ArrowsClockwise];

const box = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });
const B = START; // step starts, absolute seconds: brief, design, code, admin, launch, care

/* ---------- layout (stage 1200 × 620) ---------- */
const W = {
  chat: { x: 290, y: 56, w: 410, h: 430 },
  brief: { x: 742, y: 108, w: 400, h: 340 },
  figma: { x: 284, y: 14, w: 902, h: 592 },
  code: { x: 284, y: 30, w: 512, h: 560 },
  prev: { x: 818, y: 40, w: 366, h: 540 },
  admin: { x: 284, y: 40, w: 540, h: 540 },
  browser: { x: 284, y: 18, w: 610, h: 584 },
  checks: { x: 918, y: 30, w: 266, h: 196 },
  stats: { x: 918, y: 244, w: 266, h: 214 },
  ask: { x: 306, y: 446, w: 360, h: 136 },
};
/** where the client's site sits in each window */
const R = {
  design: { x: 513, y: 72, w: 440, h: 518 },
  prev: { x: 819, y: 75, w: 364, h: 504 },
  phone: { x: 920, y: 64, w: 232, h: 496 },
  browser: { x: 285, y: 55, w: 608, h: 546 },
};

/* ---------- building blocks ---------- */

/** a glass app window that opens (rise + focus) and closes (drift + blur) */
function Win({ r, t, open, close, title, icon: I, right, bar, children, drift = -40, className = "" }: {
  r: Rect;
  t: number;
  open: number;
  close?: number;
  title: string;
  icon?: Icon;
  right?: ReactNode;
  /** replaces the centred title (e.g. a browser address bar) */
  bar?: ReactNode;
  children: ReactNode;
  drift?: number;
  className?: string;
}) {
  const { k, out, on } = life(t, open, close);
  if (!on) return null;
  const e = expo(seg(t, open, open + 0.8));
  const moving = e < 0.999 || out > 0;
  return (
    <div
      className={`tool tool-dense absolute flex flex-col overflow-hidden ${className}`}
      style={{
        ...box(r),
        opacity: Math.min(1, k * 1.4) * (1 - out),
        transform: moving ? `translate(${(out * drift).toFixed(1)}px, ${((1 - e) * 26).toFixed(1)}px) scale(${(0.955 + 0.045 * e - out * 0.03).toFixed(4)})` : undefined,
        filter: moving && (1 - e) * 10 + out * 10 > 0.3 ? `blur(${((1 - e) * 10 + out * 10).toFixed(1)}px)` : undefined,
      }}
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        {bar ?? (
          <>
            <span className="flex min-w-0 flex-1 items-center justify-center gap-2 text-[12.5px] font-medium text-grey">
              {I && <I size={14} weight="regular" />}
              <span className="truncate">{title}</span>
            </span>
            <span className="flex w-[52px] justify-end text-[11px] text-faint">{right}</span>
          </>
        )}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** a small rounded check that pops in */
function Tick({ k, color = "#34d399", size = 20 }: { k: number; color?: string; size?: number }) {
  const p = expo(k);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: k > 0 ? `color-mix(in srgb, ${color} ${Math.round(p * 22)}%, transparent)` : "transparent",
        boxShadow: `inset 0 0 0 1.5px ${k > 0 ? color : "rgba(255,255,255,.16)"}`,
        color,
      }}
    >
      {k > 0 && <Check size={size * 0.55} weight="bold" style={{ transform: `scale(${p.toFixed(3)})` }} />}
    </span>
  );
}

/** a named cursor gliding along a timed path, with a press ring on clicks */
function Cursor({ t, path, name, color, clicks = [] }: { t: number; path: [number, number, number][]; name: string; color: string; clicks?: number[] }) {
  const show = seg(t, path[0][0] - 0.2, path[0][0]) * (1 - seg(t, path[path.length - 1][0] + 0.4, path[path.length - 1][0] + 0.7));
  if (show <= 0) return null;
  const p = along(t, path);
  const press = clicks.map((c) => seg(t, c, c + 0.45)).find((v) => v > 0 && v < 1) ?? 0;
  return (
    <div className="pointer-events-none absolute z-40" style={{ left: p.x, top: p.y, opacity: show }}>
      {press > 0 && (
        <span
          className="absolute -left-4 -top-4 size-8 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${color}`, opacity: 1 - press, transform: `scale(${(0.4 + press * 1.1).toFixed(3)})` }}
        />
      )}
      <svg width="20" height="22" viewBox="0 0 20 22" style={{ transform: press > 0 && press < 0.35 ? "scale(0.88)" : undefined }}>
        <path d="M2 2l15 8.5-6.6 1.6L7 19z" fill={color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-4 top-5 whitespace-nowrap rounded-md rounded-tl-none px-2 py-0.5 text-[11px] font-semibold text-[#05070d]" style={{ background: color }}>
        {name}
      </span>
    </div>
  );
}

/* ---------- the project sidebar: the six steps of the studio's process ---------- */
function Sidebar({ t, done }: { t: number; done: number }) {
  const S = useStudio();
  const cur = stepAt(t);
  const all = t >= TOTAL - 0.2;
  return (
    <div className="tool absolute flex flex-col p-5" style={{ left: 0, top: 0, width: 256, height: 620 }}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#c8643b] text-white shadow-[0_8px_20px_-8px_rgb(200_100_59/0.8)]">
          <Coffee size={22} weight="fill" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-fg">{S.project.name}</span>
          <span className="block text-[12.5px] text-grey">{S.project.kind}</span>
        </span>
      </div>
      <ol className="mt-6 flex flex-col gap-1">
        {S.steps.map((st, i) => {
          const I = STEP_ICON[i];
          const isDone = all || i < cur;
          const active = !all && i === cur;
          const p = local(t, i);
          const open = active ? expo(seg(at(t, i), 0, 0.6)) * (1 - smooth(seg(at(t, i), STEP[i] - 0.35, STEP[i]))) : 0;
          return (
            <li
              key={st.id}
              className="relative overflow-hidden rounded-xl px-3 py-2.5 transition-colors duration-300"
              style={{ background: active ? "rgb(255 255 255 / 0.055)" : "transparent" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300"
                  style={{ background: active || isDone ? `color-mix(in srgb, ${st.color} 16%, transparent)` : "rgb(255 255 255 / 0.04)", color: active || isDone ? st.color : "#5b616c" }}
                >
                  <I size={17} weight="regular" />
                </span>
                <span className={`flex-1 text-[14px] font-medium transition-colors duration-300 ${active ? "text-fg" : isDone ? "text-body" : "text-faint"}`}>{st.name}</span>
                {isDone ? <Tick k={1} color={st.color} size={18} /> : active ? <Ring p={p} color={st.color} /> : null}
              </div>
              {open > 0 && (
                <p className="overflow-hidden pl-11 text-[13.5px] leading-snug text-body" style={{ maxHeight: 80 * open, opacity: open, marginTop: 6 * open }}>
                  {st.get}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-auto">
        <div className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-3">
          <span className="flex -space-x-2">
            {[
              ["Д", "#a78bfa"],
              ["Р", "#3d8bff"],
              ["К", "#2dd4bf"],
            ].map(([l, c]) => (
              <span key={l} className="grid size-7 place-items-center rounded-full text-[11px] font-bold text-[#05070d] ring-2 ring-[#0b0c11]" style={{ background: c }}>
                {l}
              </span>
            ))}
          </span>
          <span className="text-[12px] text-grey">{S.project.team}</span>
        </div>
        <div
          className="mt-3 flex items-center gap-2 overflow-hidden rounded-xl bg-green/10 px-3 text-[13px] font-semibold text-green"
          style={{ height: 40 * done, opacity: done, marginTop: 12 * done }}
        >
          <CheckCircle size={18} weight="fill" />
          {S.care.final}
        </div>
      </div>
    </div>
  );
}

function Ring({ p, color }: { p: number; color: string }) {
  const c = 2 * Math.PI * 7;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90">
      <circle cx="9" cy="9" r="7" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
      <circle cx="9" cy="9" r="7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={`${(c * p).toFixed(2)} ${c.toFixed(2)}`} />
    </svg>
  );
}

/* ---------- step windows ---------- */

function ChatWin({ t }: { t: number }) {
  const S = useStudio().chat;
  const msgK = seg(t, 0.6, 1.9);
  const dots = seg(t, 2.0, 2.15) * (1 - seg(t, 2.45, 2.55));
  const reply = expo(seg(t, 2.5, 3.0));
  return (
    <Win r={W.chat} t={t} open={0.05} close={B[1] + 0.35} title={S.app} icon={ChatCircleText} drift={-60}>
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <span className="grid size-10 place-items-center rounded-full bg-[#c8643b] text-[15px] font-bold text-white">О</span>
        <span>
          <span className="block text-[14px] font-semibold text-fg">{S.who}</span>
          <span className="flex items-center gap-1.5 text-[12px] text-green">
            <span className="size-1.5 rounded-full bg-green" />
            {S.online}
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="max-w-[86%] self-start rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3 text-[15px] leading-snug text-fg" style={{ opacity: seg(t, 0.45, 0.7) }}>
          <Typed text={S.msg} k={msgK} caret={msgK > 0 && msgK < 1} />
        </div>
        {dots > 0 && (
          <div className="flex gap-1 self-end rounded-2xl bg-[#2a6fe8]/80 px-4 py-3" style={{ opacity: dots }}>
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-1.5 rounded-full bg-white" style={{ opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 7 - d)) }} />
            ))}
          </div>
        )}
        {reply > 0 && (
          <div
            className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-[#2a6fe8] px-4 py-3 text-[15px] leading-snug text-white"
            style={{ opacity: reply, transform: `translateY(${((1 - reply) * 10).toFixed(1)}px)` }}
          >
            {S.reply}
          </div>
        )}
      </div>
    </Win>
  );
}

function BriefWin({ t }: { t: number }) {
  const S = useStudio().brief;
  return (
    <Win r={W.brief} t={t} open={2.55} close={B[1] + 0.5} title={S.app} icon={ReadCvLogo} drift={40}>
      <div className="p-6">
        <p className="text-[19px] font-semibold tracking-[-0.01em] text-fg">{S.title}</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {S.items.map((it, i) => {
            const k = seg(t, 2.95 + i * 0.18, 3.2 + i * 0.18);
            return (
              <li key={it} className="flex items-center gap-3 text-[14.5px] text-body" style={{ opacity: 0.35 + 0.65 * Math.min(1, k * 2) }}>
                <Tick k={k} color="#22d3ee" />
                {it}
              </li>
            );
          })}
        </ul>
        <div className="tool-cell mt-5 px-4 py-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-grey">{S.pages}</p>
          <p className="mt-1 text-[13.5px] text-fg">{typed(S.pagesVal, seg(t, 3.5, 3.9))}</p>
        </div>
      </div>
    </Win>
  );
}

function FigmaWin({ t }: { t: number }) {
  const S = useStudio().figma;
  const d0 = B[1];
  const layerOn = (i: number) => seg(t, d0 + 0.7 + i * 0.16, d0 + 0.85 + i * 0.16);
  const sel = Math.min(S.layers.length - 1, Math.max(0, Math.floor(at(t, 1) * 1.3 - 1.4)));
  const sw = ["#f7f1e8", "#2a1d15", "#c8643b", "#ead9c4"];
  const swPick = seg(t, d0 + 1.75, d0 + 1.9);
  return (
    <Win r={W.figma} t={t} open={d0 + 0.05} close={B[2] + 0.4} title={S.file} icon={PaintBrushBroad} right="100%">
      {/* layers */}
      <div className="absolute inset-y-0 left-0 w-[188px] border-r border-white/[0.06] p-4">
        <p className="tool-label">{S.layersLabel}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {S.layers.map((l, i) => (
            <li
              key={l}
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] transition-colors duration-200"
              style={{ opacity: layerOn(i), background: sel === i && at(t, 1) > 1 ? "rgb(167 139 250 / 0.16)" : "transparent", color: sel === i ? "#f5f7fa" : "#8b919c" }}
            >
              <span className="size-3 rounded-[3px] border border-current opacity-70" />
              {l}
            </li>
          ))}
        </ul>
      </div>
      {/* canvas */}
      <div className="absolute inset-y-0 left-[188px] right-[214px] bg-[#0b0c11]/60 [background-image:radial-gradient(rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* props */}
      <div className="absolute inset-y-0 right-0 w-[214px] border-l border-white/[0.06] p-4">
        <p className="tool-label">{S.fill}</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {sw.map((c, i) => (
            <span
              key={c}
              className="aspect-square rounded-lg"
              style={{
                background: c,
                opacity: seg(t, d0 + 0.9 + i * 0.1, d0 + 1.1 + i * 0.1),
                boxShadow: i === 2 && swPick > 0 ? `0 0 0 2px #0b0c11, 0 0 0 ${(2 + swPick * 1.5).toFixed(1)}px #a78bfa` : "inset 0 0 0 1px rgb(255 255 255 / 0.12)",
              }}
            />
          ))}
        </div>
        <p className="tool-label mt-6">{S.font}</p>
        <div className="tool-cell mt-3 flex h-10 items-center justify-between px-3 text-[13.5px] text-fg" style={{ opacity: seg(t, d0 + 1.2, d0 + 1.5) }}>
          {S.fontVal}
          <span className="text-grey">Bold</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2" style={{ opacity: seg(t, d0 + 1.3, d0 + 1.6) }}>
          <span className="tool-cell flex h-10 items-center px-3 text-[13px] text-body">29</span>
          <span className="tool-cell flex h-10 items-center px-3 text-[13px] text-body">−2%</span>
        </div>
        <p className="tool-label mt-6">{S.autoLabel}</p>
        <div className="mt-3 flex gap-2" style={{ opacity: seg(t, d0 + 1.4, d0 + 1.7) }}>
          <span className="tool-glow grid size-9 place-items-center rounded-lg bg-violet text-white">↓</span>
          <span className="tool-cell flex h-9 flex-1 items-center px-3 text-[13px] text-body">24</span>
        </div>
      </div>
    </Win>
  );
}

function CodeWin({ t }: { t: number }) {
  const S = useStudio().code;
  const c0 = B[2];
  const total = S.lines.join("").length;
  let n = Math.round(total * seg(t, c0 + 0.6, c0 + 2.5));
  const KW = /(export|default|function|return)/g;
  return (
    <Win r={W.code} t={t} open={c0 + 0.05} close={B[3] + 0.35} title={S.file} icon={Code} drift={-50}>
      <div className="p-5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[13.5px] leading-[2]">
        {S.lines.map((line, i) => {
          const shown = line.slice(0, Math.max(0, n));
          n -= line.length;
          const cur = shown.length > 0 && shown.length < line.length;
          return (
            <div key={i} className="flex gap-4 whitespace-pre">
              <span className="w-4 text-right text-faint">{i + 1}</span>
              <span className="text-[#c4cad4]">
                {shown.split(KW).map((part, j) =>
                  KW.test(part) ? (
                    <span key={j} className="text-[#c792ea]">
                      {part}
                    </span>
                  ) : (
                    <span key={j}>
                      {part.split(/(<\/?[A-Za-z]+|"[^"]*")/).map((x, q) => (
                        <span key={q} className={x.startsWith("<") ? "text-[#7fdbca]" : x.startsWith('"') ? "text-[#ecc48d]" : undefined}>
                          {x}
                        </span>
                      ))}
                    </span>
                  ),
                )}
                {cur && <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[#3d8bff]" />}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-x-5 bottom-5 flex gap-2">
        {S.checks.map((c, i) => {
          const k = seg(t, c0 + 2.9 + i * 0.25, c0 + 3.15 + i * 0.25);
          return (
            <span key={c} className="tool-cell flex h-11 flex-1 items-center gap-2.5 px-3 text-[13px] text-fg" style={{ opacity: 0.4 + 0.6 * Math.min(1, k * 2) }}>
              <Tick k={k} color="#3d8bff" size={18} />
              {c}
            </span>
          );
        })}
      </div>
    </Win>
  );
}

function AdminWin({ t }: { t: number }) {
  const S = useStudio();
  const A = S.admin;
  const a0 = B[3];
  const sel = seg(t, a0 + 0.9, a0 + 1.05) * (1 - seg(t, a0 + 1.9, a0 + 2.0));
  const typing = seg(t, a0 + 1.2, a0 + 1.6);
  const toggle = smooth(seg(t, a0 + 2.15, a0 + 2.4));
  const row = expo(seg(t, a0 + 2.35, a0 + 2.9));
  const saved = expo(seg(t, a0 + 2.9, a0 + 3.3));
  const items = S.site.items;
  return (
    <Win r={W.admin} t={t} open={a0 + 0.05} close={B[4] + 0.35} title={A.app} icon={SlidersHorizontal} drift={-50}>
      <div className="flex items-center justify-between px-6 pt-5">
        <p className="text-[20px] font-semibold tracking-[-0.01em] text-fg">{A.section}</p>
        <span className="flex items-center gap-3 text-[13px] text-body">
          {A.seasonal}
          <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: toggle > 0.5 ? "#2dd4bf" : "rgb(255 255 255 / 0.14)" }}>
            <span className="absolute top-0.5 size-5 rounded-full bg-white shadow" style={{ left: 2 + toggle * 20 }} />
          </span>
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2 px-6">
        {row > 0 && (
          <div className="tool-cell flex items-center gap-3 overflow-hidden px-3" style={{ height: 54 * row, opacity: row, borderColor: "rgb(45 212 191 / 0.4)" }}>
            <span className="grid size-9 place-items-center rounded-lg bg-[#2dd4bf]/15 text-[#2dd4bf]">✦</span>
            <span className="flex-1 text-[14px] font-medium text-fg">{S.site.seasonal.n}</span>
            <span className="text-[13.5px] tabular-nums text-body">{S.site.seasonal.p}</span>
          </div>
        )}
        {items.map((it, i) => (
          <div key={it.n} className="tool-cell flex h-[54px] items-center gap-3 px-3">
            <span className="grid size-9 place-items-center rounded-lg bg-white/[0.05] text-body">
              <Coffee size={18} weight="light" />
            </span>
            <span className="flex-1 text-[14px] font-medium text-fg">{it.n}</span>
            <span
              className="flex h-9 w-[92px] items-center justify-end rounded-lg px-3 text-[13.5px] tabular-nums"
              style={{
                background: i === 0 && sel > 0 ? "rgb(45 212 191 / 0.12)" : "rgb(255 255 255 / 0.03)",
                boxShadow: i === 0 && sel > 0 ? "inset 0 0 0 1.5px #2dd4bf" : "inset 0 0 0 1px rgb(255 255 255 / 0.07)",
                color: "#f5f7fa",
              }}
            >
              {i === 0 && typing > 0 ? (
                <>
                  {typed("np" in it ? (it.np as string) : it.p, typing)}
                  {typing < 1 && <span className="ml-px inline-block h-[1em] w-[2px] bg-[#2dd4bf]" />}
                </>
              ) : (
                it.p
              )}
            </span>
          </div>
        ))}
      </div>
      <div
        className="absolute inset-x-6 bottom-6 flex h-12 items-center gap-2.5 rounded-xl bg-[#2dd4bf]/12 px-4 text-[14px] font-medium text-[#2dd4bf]"
        style={{ opacity: saved, transform: `translateY(${((1 - saved) * 14).toFixed(1)}px)` }}
      >
        <CheckCircle size={18} weight="fill" />
        {A.saved}
      </div>
    </Win>
  );
}

function BrowserWin({ t }: { t: number }) {
  const S = useStudio().launch;
  const l0 = B[4];
  const url = seg(t, l0 + 0.55, l0 + 1.2);
  const live = expo(seg(t, l0 + 1.35, l0 + 1.8));
  return (
    <Win
      r={W.browser}
      t={t}
      open={l0 + 0.05}
      title={S.app}
      bar={
      <div className="flex flex-1 items-center gap-3">
        <span className="flex h-7 flex-1 items-center gap-2 rounded-lg bg-white/[0.06] px-3 text-[12.5px] text-body">
          <Lock size={13} weight="bold" className="text-green" style={{ opacity: live }} />
          {typed(S.url, url)}
          {url > 0 && url < 1 && <span className="inline-block h-3.5 w-[1.5px] bg-fg" />}
        </span>
        <span className="flex h-7 items-center gap-1.5 rounded-full bg-green/12 px-3 text-[12px] font-semibold text-green" style={{ opacity: live }}>
          <span className="size-1.5 animate-pulse rounded-full bg-green" />
          {S.online}
        </span>
      </div>
      }
    >
      <span />
    </Win>
  );
}

function ChecksWin({ t }: { t: number }) {
  const S = useStudio();
  const l0 = B[4];
  return (
    <Win r={W.checks} t={t} open={l0 + 0.3} close={B[5] + 0.2} title={S.steps[4].name} icon={Globe} drift={40}>
      <ul className="flex flex-col gap-3 p-5">
        {S.launch.checks.map((c, i) => {
          const k = seg(t, l0 + 0.8 + i * 0.35, l0 + 1.05 + i * 0.35);
          return (
            <li key={c} className="flex items-center gap-3 text-[14.5px] text-fg" style={{ opacity: 0.4 + 0.6 * Math.min(1, k * 2) }}>
              <Tick k={k} />
              {c}
            </li>
          );
        })}
      </ul>
    </Win>
  );
}

const SPARK = [6, 9, 8, 14, 13, 19, 18, 26, 24, 31, 35, 42];
function StatsWin({ t }: { t: number }) {
  const S = useStudio().launch;
  const locale = useContent().UI.locale;
  const l0 = B[4];
  const k = smooth(seg(t, l0 + 1.9, l0 + 3.4));
  const move = smooth(seg(t, B[5], B[5] + 0.7));
  const r = { ...W.stats, y: lerp(W.stats.y, W.checks.y, move) };
  const n = Math.round(1248 * k);
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * 226},${70 - v * 1.5}`).join(" ");
  return (
    <Win r={r} t={t} open={l0 + 1.7} title={S.stats} icon={Globe} drift={40}>
      <div className="px-5 pt-4">
        <p className="text-[34px] font-semibold tabular-nums tracking-[-0.03em] text-fg">{n.toLocaleString(locale)}</p>
        <p className="text-[12.5px] text-grey">{S.week}</p>
        <svg width="226" height="76" viewBox="0 0 226 76" className="mt-3 overflow-visible" style={{ clipPath: `inset(0 ${((1 - k) * 100).toFixed(1)}% 0 0)` }}>
          <polyline points={`0,76 ${pts} 226,76`} fill="rgb(52 211 153 / 0.12)" stroke="none" />
          <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </Win>
  );
}

const EVENT_ICON: Icon[] = [ShoppingBag, ArrowsClockwise, Bell];
const EVENT_COLOR = ["#34d399", "#3d8bff", "#fb7185"];
function Toasts({ t }: { t: number }) {
  const S = useStudio().care;
  const c0 = B[5];
  const times = [c0 + 0.7, c0 + 1.5, c0 + 2.9];
  return (
    <>
      {S.events.map((e, i) => {
        const k = expo(seg(t, times[i], times[i] + 0.7));
        if (k <= 0) return null;
        const I = EVENT_ICON[i];
        return (
          <div
            key={e.t}
            className="tool tool-dense absolute z-20 flex items-center gap-3 px-4"
            style={{
              left: W.checks.x,
              top: 262 + i * 76,
              width: W.checks.w,
              height: 64,
              opacity: Math.min(1, k * 1.5),
              transform: k < 0.999 ? `translateX(${((1 - k) * 60).toFixed(1)}px)` : undefined,
            }}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${EVENT_COLOR[i]}22`, color: EVENT_COLOR[i] }}>
              <I size={19} weight="regular" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold text-fg">{e.t}</span>
              <span className="block truncate text-[12.5px] text-grey">{e.d}</span>
            </span>
          </div>
        );
      })}
    </>
  );
}

function AskWin({ t }: { t: number }) {
  const S = useStudio();
  const c0 = B[5];
  const ask = expo(seg(t, c0 + 1.1, c0 + 1.6));
  const done = expo(seg(t, c0 + 2.2, c0 + 2.6));
  return (
    <Win r={W.ask} t={t} open={c0 + 0.9} close={TOTAL + HOLD - 1.2} title={S.chat.app} icon={ChatCircleText} drift={0} className="z-20">
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-white/[0.08] px-3.5 py-2 text-[13.5px] text-fg" style={{ opacity: ask }}>
          {S.care.ask}
        </div>
        <div
          className="flex items-center gap-1.5 self-end rounded-2xl rounded-br-md bg-[#2a6fe8] px-3.5 py-2 text-[13.5px] text-white"
          style={{ opacity: done, transform: `translateY(${((1 - done) * 8).toFixed(1)}px)` }}
        >
          <Check size={14} weight="bold" />
          {S.care.done}
        </div>
      </div>
    </Win>
  );
}

/* ---------- the client's site, handed from window to window ---------- */
function SiteLayer({ t }: { t: number }) {
  const d0 = B[1];
  const appear = smooth(seg(t, d0 + 0.6, d0 + 1.2));
  if (appear <= 0) return null;
  // where it is
  let r: Rect = R.design;
  r = mix(r, R.prev, smooth(seg(t, B[2], B[2] + 0.8)));
  const toPhone = smooth(seg(t, B[2] + 2.4, B[2] + 3.2));
  r = mix(r, R.phone, toPhone);
  const toBrowser = smooth(seg(t, B[4], B[4] + 0.8));
  r = mix(r, R.browser, toBrowser);
  const phone = toPhone * (1 - toBrowser);
  const moving = (t > B[2] && t < B[2] + 0.8) || (t > B[2] + 2.4 && t < B[2] + 3.2) || (t > B[4] && t < B[4] + 0.8);
  const s = {
    design: smooth(seg(t, d0 + 1.9, d0 + 3.2)),
    phone,
    price: smooth(seg(t, B[3] + 1.6, B[3] + 2.0)),
    seasonal: smooth(seg(t, B[3] + 2.4, B[3] + 3.0)),
    jobs: smooth(seg(t, B[5] + 2.3, B[5] + 2.8)),
  };
  const bezel = phone * 9;
  return (
    <div
      className="absolute z-10"
      style={{
        left: r.x - bezel,
        top: r.y - bezel,
        padding: bezel,
        opacity: appear,
        borderRadius: 12 + phone * 30,
        background: phone > 0 ? "#0d0e13" : undefined,
        boxShadow: `0 30px 70px -30px rgb(0 0 0 / 0.9)${phone > 0 ? `, inset 0 0 0 1px rgb(255 255 255 / ${(0.14 * phone).toFixed(3)})` : ""}`,
        filter: moving ? "blur(0.4px)" : undefined,
      }}
    >
      <Site w={r.w} h={r.h} s={s} radius={8 + phone * 24} />
      {phone > 0 && <span className="absolute left-1/2 top-[16px] h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-[#0d0e13]" style={{ opacity: phone }} />}
    </div>
  );
}

function PrevWin({ t }: { t: number }) {
  const S = useStudio().code;
  return (
    <Win r={W.prev} t={t} open={B[2] + 0.1} close={B[2] + 2.3} title={S.url} icon={Globe} drift={0}>
      <span />
    </Win>
  );
}

/* ---------- the whole frame ---------- */
export function Scene({ t, fin }: { t: number; fin: number }) {
  const S = useStudio();
  const done = expo(seg(t, TOTAL - 0.6, TOTAL + 0.2));
  const a0 = B[3];
  const d0 = B[1];
  const designer: [number, number, number][] = [
    [d0 + 0.8, 760, 420],
    [d0 + 1.6, 1090, 110],
    [d0 + 2.2, 640, 250],
    [d0 + 3.4, 820, 470],
  ];
  const owner: [number, number, number][] = [
    [a0 + 0.4, 600, 420],
    [a0 + 0.9, 760, 186],
    [a0 + 1.9, 740, 120],
    [a0 + 2.15, 774, 82],
    [a0 + 3.2, 640, 300],
  ];
  return (
    <div className="absolute inset-0" style={fin > 0 ? { opacity: 1 - fin, filter: `blur(${(fin * 10).toFixed(1)}px)` } : undefined}>
      <Sidebar t={t} done={done} />
      <ChatWin t={t} />
      <BriefWin t={t} />
      <FigmaWin t={t} />
      <CodeWin t={t} />
      <PrevWin t={t} />
      <AdminWin t={t} />
      <BrowserWin t={t} />
      <ChecksWin t={t} />
      <StatsWin t={t} />
      <SiteLayer t={t} />
      <AskWin t={t} />
      <Toasts t={t} />
      <Cursor t={t} path={designer} name={S.cursors.designer} color="#a78bfa" clicks={[d0 + 1.75]} />
      <Cursor t={t} path={owner} name={S.cursors.client} color="#2dd4bf" clicks={[a0 + 0.95, a0 + 2.15]} />
    </div>
  );
}

