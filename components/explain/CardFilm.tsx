"use client";

import { ChatCircleDots, Check, Lock, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import type { CardFilm as CardCopy } from "@/lib/content";
import { useContent } from "../Lang";
import { BrowserBar, fly, INK, MB, blur, Visual } from "../build/shared";
import { along, ease, expo, seg, smooth, Typed } from "../build/util";
import { ExplainFilm, type StageProps, type Timing } from "./Film";

/**
 * «Що таке сайт-візитівка?»: one made-up workshop's small site, from the visitor's side.
 *  1 Пошук: a search panel, the query is typed, results arrive, the visitor clicks the workshop.
 *  2 Знайомство: its site opens in a browser; callouts point at who they are and the facts that build trust.
 *  3 Ціни: the page scrolls to services and prices; a chat asks «скільки коштує?» and is answered by the page itself.
 *  4 Заявка: the visitor fills in the short form; the owner's phone gets the request.
 * Slow on purpose (6–7s a scene). Stage 1200×620; the page scrolls inside the browser, nothing is rebuilt.
 */
const TIMING: Timing = {
  intro: 1.8,
  sec: [6.5, 6, 6, 7],
  hold: 5,
  focus: [
    { x: 320, y: 50, w: 560, h: 500 },
    { x: 140, y: 20, w: 640, h: 560 },
    { x: 140, y: 20, w: 640, h: 560 },
    { x: 140, y: 20, w: 640, h: 560 },
  ],
};

export function CardFilmSection() {
  const film = useContent().SERVICES.pages.films.card;
  if (!film) return null;
  return <ExplainFilm id="explain" intro={film.intro} label={film.label} scenes={film.scenes} timing={TIMING} Stage={CardStage} />;
}

// browser frame on the stage; the page inside is 640 wide, its viewport 526 tall (under the 34px bar)
const BR = { x: 140, y: 20, w: 640, h: 560, bar: 34 };
const VIEW = BR.h - BR.bar;
// page layout (y inside the page)
const P = { hero: 70, facts: 312, services: 424, rows: 466, row: 48, form: 712, height: 1110 };
const scrollAt = (t: number) => smooth(seg(t, 12.7, 14.0)) * 384 + smooth(seg(t, 18.7, 20.0)) * 188;
/** stage y of a page y at time t */
const sy = (y: number, t: number) => BR.y + BR.bar + y - scrollAt(t);

const tint = (rgb: string) => ({ "--tint": rgb }) as CSSProperties;

function CardStage({ t, hold, fin, mobile }: StageProps) {
  const M = useContent().SERVICES.pages.films.card!.mock;
  // the whole stage whips out at the end of the lap
  const out = fin;
  return (
    <div
      className="absolute inset-0"
      style={out > 0 ? { transform: `translate(${(-out * out * 140).toFixed(1)}px, 0)`, filter: blur(out * 12), opacity: 1 - smooth(Math.min(1, out * 1.4)) } : undefined}
    >
      <Search t={t} M={M} />
      <Browser t={t} M={M} />
      <Callouts t={t} M={M} mobile={mobile} />
      <Chat t={t} M={M} />
      <Owner t={t} hold={hold} M={M} mobile={mobile} />
      <Pointer t={t} />
    </div>
  );
}

type MProps = { t: number; M: CardCopy["mock"] };

/* ---------------- 1 · search ---------------- */
function Search({ t, M }: MProps) {
  if (t > 7.2) return null;
  const enter = expo(seg(t, 0, 0.9));
  const ex = seg(t, 6.0, 6.9);
  const style: CSSProperties =
    ex > 0
      ? { transform: `translate(${(-ex * ex * 160).toFixed(1)}px, 0) scale(${(1 - ex * 0.03).toFixed(4)})`, filter: blur(ex * 14), opacity: 1 - smooth(Math.min(1, ex * 1.5)), willChange: MB ? "transform, filter, opacity" : "transform, opacity" }
      : fly(enter, 0, 30, 14);
  const pick = smooth(seg(t, 3.9, 4.5));
  const press = seg(t, 5.15, 5.3) - seg(t, 5.3, 5.5);
  return (
    <div className="tool absolute p-6" style={{ left: 330, top: 60, width: 540, height: 480, ...tint("90 162 255"), ...style }}>
      <div className="tool-cell flex h-12 items-center gap-3 px-4 text-[16px] text-[#f5f7fa]">
        <MagnifyingGlass size={18} className="text-[#8b919c]" />
        <span className="flex-1 whitespace-nowrap">
          <Typed text={M.query} k={seg(t, 0.9, 2.5)} caret={t > 0.8 && t < 3.2} />
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {M.results.map((r, i) => {
          const k = expo(seg(t, 2.7 + i * 0.28, 3.5 + i * 0.28));
          const hot = i === 0;
          const f = fly(k, 0, 14, 6);
          return (
            <div
              key={r.url}
              className="rounded-xl px-4 py-3"
              style={{
                ...f,
                background: hot ? `rgb(90 162 255 / ${(pick * 0.1).toFixed(3)})` : undefined,
                boxShadow: hot && pick > 0 ? `inset 0 0 0 1px rgb(90 162 255 / ${(pick * 0.45).toFixed(3)})` : undefined,
                opacity: (f.opacity as number) * (hot ? 1 : 1 - pick * 0.5),
                transform: hot && press > 0 ? `scale(${(1 - press * 0.015).toFixed(4)})` : f.transform,
              }}
            >
              <p className="text-[12px] text-[#8b919c]">{r.url}</p>
              <p className="mt-1 truncate text-[16px] font-semibold text-[#8ab4ff]">{r.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-[18px] text-[#c4cad4]">{r.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 2–4 · the site in a browser ---------------- */
function Browser({ t, M }: MProps) {
  if (t < 5.9) return null;
  const enter = expo(seg(t, 6.0, 7.1));
  const sc = scrollAt(t);
  // everything on the page arrives once, a little staggered, as the page "loads"
  const at = (a: number) => expo(seg(t, a, a + 0.8));
  return (
    <div
      className="absolute overflow-hidden rounded-[14px] bg-[#f6f2ea] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
      style={{
        left: BR.x,
        top: BR.y,
        width: BR.w,
        height: BR.h,
        ...(enter < 1
          ? { transform: `translate(${((1 - enter) * 170).toFixed(1)}px, 0) scale(${(1 - (1 - enter) * 0.03).toFixed(4)})`, filter: blur((1 - enter) * 14), opacity: Math.min(1, enter * 1.3), willChange: MB ? "transform, filter, opacity" : "transform, opacity" }
          : null),
      }}
    >
      <BrowserBar url={M.domain} lock h={BR.bar} />
      <div className="relative overflow-hidden" style={{ height: VIEW }}>
        <div className="absolute inset-x-0 top-0 text-[#1a1714]" style={{ height: P.height, transform: sc ? `translateY(${(-sc).toFixed(1)}px)` : undefined }}>
          <Page M={M} k={{ nav: at(6.5), h1: at(6.75), p: at(6.95), btn: at(7.15), img: smooth(seg(t, 6.8, 7.8)), facts: [at(7.5), at(7.65), at(7.8)] }} />
          <Services M={M} t={t} />
          <Form M={M} t={t} />
        </div>
      </div>
    </div>
  );
}

type PageK = { nav: number; h1: number; p: number; btn: number; img: number; facts: number[] };
function Page({ M, k }: { M: CardCopy["mock"]; k: PageK }) {
  return (
    <>
      <div className="absolute left-8 right-8 top-[18px] flex h-7 items-center justify-between text-[12px]" style={fly(k.nav, 0, -8, 4)}>
        <span className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em]">
          <span className="grid size-[18px] place-items-center rounded-[6px] bg-[#6b4a2b]">
            <span className="size-[6px] rounded-full bg-[#f4f0e8]" />
          </span>
          {M.brand}
        </span>
        <span className="flex gap-4 text-[#5c564c]">
          {M.nav.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </div>
      <p className="absolute left-8 w-[300px] text-[30px] font-semibold leading-[34px] tracking-[-0.04em]" style={{ top: P.hero, ...fly(k.h1, 0, 14, 8) }}>
        {M.h1}
      </p>
      <p className="absolute left-8 w-[290px] text-[14px] leading-[20px] text-[#5c564c]" style={{ top: P.hero + 96, ...fly(k.p, 0, 10, 6) }}>
        {M.p}
      </p>
      <span className="absolute left-8 grid h-10 w-[170px] place-items-center rounded-full bg-[#6b4a2b] text-[13px] font-semibold text-white" style={{ top: P.hero + 160, ...fly(k.btn, 0, 10, 6) }}>
        {M.btn}
      </span>
      <div
        className="absolute overflow-hidden rounded-[14px]"
        style={{ left: 360, top: P.hero, width: 248, height: 212, clipPath: `inset(${((1 - k.img) * 100).toFixed(2)}% 0 0 0 round 14px)` }}
      >
        <div className="absolute inset-0" style={{ transform: `scale(${(1.12 - k.img * 0.12).toFixed(4)})` }}>
          <Visual v={2} />
        </div>
      </div>
      <div className="absolute left-8 right-8 grid grid-cols-3 gap-3" style={{ top: P.facts }}>
        {M.facts.map(([v, l], i) => (
          <div key={l} className="rounded-xl bg-white px-4 py-3 shadow-[0_8px_20px_-14px_rgb(40_30_20/0.5)]" style={fly(k.facts[i], 0, 12, 6)}>
            <p className="text-[20px] font-semibold tracking-[-0.03em]">{v}</p>
            <p className="text-[12px] text-[#7a7368]">{l}</p>
          </div>
        ))}
      </div>
      <div className="absolute left-8 right-8 h-px bg-black/[0.08]" style={{ top: P.facts + 84 }} />
    </>
  );
}

function Services({ M, t }: { M: CardCopy["mock"]; t: number }) {
  return (
    <>
      <p className="absolute left-8 text-[20px] font-semibold tracking-[-0.03em]" style={{ top: P.services }}>
        {M.servicesTitle}
      </p>
      {M.services.map(([name, price], i) => {
        const hl = smooth(seg(t, 14.4 + i * 0.75, 14.75 + i * 0.75)) * (1 - smooth(seg(t, 15.2 + i * 0.75, 15.6 + i * 0.75)));
        return (
          <div
            key={name}
            className="absolute left-6 right-6 flex items-center justify-between rounded-xl px-3 text-[15px]"
            style={{ top: P.rows + i * P.row, height: P.row - 6, background: hl > 0 ? `rgb(107 74 43 / ${(hl * 0.1).toFixed(3)})` : undefined }}
          >
            <span>{name}</span>
            <span className="font-semibold">{price}</span>
          </div>
        );
      })}
    </>
  );
}

function Form({ M, t }: { M: CardCopy["mock"]; t: number }) {
  const nameOn = t > 20.45;
  const phoneOn = t > 21.75;
  const press = seg(t, 23.45, 23.6) - seg(t, 23.6, 23.8);
  const sent = smooth(seg(t, 23.7, 24.1));
  const field = (on: boolean) =>
    `flex h-10 items-center rounded-lg border bg-[#fbf9f5] px-3 text-[14px] ${on ? "border-[#6b4a2b]" : "border-black/10"}`;
  return (
    <div className="absolute left-8 right-8 rounded-2xl bg-white p-6 shadow-[0_14px_34px_-20px_rgb(40_30_20/0.55)]" style={{ top: P.form, height: 300 }}>
      <p className="text-[20px] font-semibold tracking-[-0.03em]">{M.formTitle}</p>
      <p className="mt-4 text-[12px] text-[#7a7368]">{M.nameLabel}</p>
      <div className={`mt-1 ${field(nameOn && !phoneOn)}`}>
        <Typed text={M.name} k={seg(t, 20.6, 21.3)} caret={nameOn && !phoneOn} color={INK} />
      </div>
      <p className="mt-3 text-[12px] text-[#7a7368]">{M.phoneLabel}</p>
      <div className={`mt-1 ${field(phoneOn && sent === 0)}`}>
        <Typed text={M.phone} k={seg(t, 21.9, 23.0)} caret={phoneOn && t < 23.4} color={INK} />
      </div>
      <span
        className="mt-4 flex h-11 w-[220px] items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white"
        style={{ background: sent > 0.5 ? "#1f8f5f" : "#6b4a2b", transform: press > 0 ? `scale(${(1 - press * 0.05).toFixed(4)})` : undefined, transition: "background-color .3s" }}
      >
        {sent > 0.5 && <Check size={16} weight="bold" />}
        {sent > 0.5 ? M.sent : M.send}
      </span>
    </div>
  );
}

/* ---------------- callouts (scene 2–3): glass tags at the right of the browser ---------------- */
function Tag({ k, y, text, color }: { k: number; y: number; text: string; color: string }) {
  if (k <= 0) return null;
  return (
    <>
      {/* a short connector from the page edge to the tag, drawn with scaleX */}
      <span className="absolute h-px origin-left" style={{ left: BR.x + BR.w - 14, top: y, width: 60, background: color, transform: `scaleX(${ease(Math.min(1, k * 1.6)).toFixed(3)})` }} />
      <span className="absolute size-2 rounded-full" style={{ left: BR.x + BR.w - 18, top: y - 3.5, background: color, opacity: Math.min(1, k * 2) }} />
      <span
        className="tool tool-dense absolute flex h-11 items-center gap-2 whitespace-nowrap px-4 text-[15px] font-semibold text-[#f5f7fa]"
        style={{ left: BR.x + BR.w + 46, top: y - 22, ...fly(k, 18, 0, 6) }}
      >
        <span className="size-2 rounded-full" style={{ background: color }} />
        {text}
      </span>
    </>
  );
}

function Callouts({ t, M, mobile }: MProps & { mobile: boolean }) {
  const gone = (a: number, b: number) => 1 - smooth(seg(t, a, b));
  const who = expo(seg(t, 8.3, 9.1)) * gone(12.2, 12.7);
  const trust = expo(seg(t, 9.9, 10.7)) * gone(12.2, 12.7);
  const price = expo(seg(t, 14.9, 15.7)) * gone(18.2, 18.7);
  // the page's own outlines around what the tag points at
  const ring = (k: number, y: number, h: number, color: string) =>
    k > 0 ? (
      <span
        className="absolute rounded-xl"
        style={{ left: BR.x + 20, top: y, width: BR.w - 40, height: h, boxShadow: `0 0 0 2px ${color}`, opacity: Math.min(1, k * 1.5) * 0.9 }}
      />
    ) : null;
  return (
    <>
      {ring(who, sy(P.hero - 10, t), 232, "#a78bfa")}
      {ring(trust, sy(P.facts - 8, t), 78, "#a78bfa")}
      {ring(price, sy(P.rows - 6, t), P.row * 4 + 6, "#2dd4bf")}
      {/* phones: the crop shows only the page, the note under the film says it in words */}
      {!mobile && <Tag k={who} y={sy(P.hero + 100, t)} text={M.callouts.who} color="#a78bfa" />}
      {!mobile && <Tag k={trust} y={sy(P.facts + 31, t)} text={M.callouts.trust} color="#a78bfa" />}
      {!mobile && <Tag k={price} y={sy(P.rows + 70, t)} text={M.callouts.price} color="#2dd4bf" />}
    </>
  );
}

/* ---------------- scene 3: the question nobody has to ask ---------------- */
function Chat({ t, M }: MProps) {
  if (t < 13.6 || t > 19) return null;
  const k = expo(seg(t, 13.7, 14.6)) * (1 - smooth(seg(t, 18.2, 18.7)));
  const ask = expo(seg(t, 14.4, 15.1));
  const answered = smooth(seg(t, 16.4, 16.9));
  const ans = expo(seg(t, 16.6, 17.3));
  return (
    <div className="tool absolute p-5" style={{ left: 846, top: 300, width: 314, height: 200, ...tint("45 212 191"), ...fly(k, 24, 0, 12) }}>
      <p className="tool-label flex items-center gap-2">
        <ChatCircleDots size={14} />
        Telegram · Viber
      </p>
      <div
        className="mt-4 max-w-[250px] rounded-2xl rounded-tl-md bg-white/[0.08] px-4 py-3 text-[14px] leading-[20px] text-[#f5f7fa]"
        style={{ ...fly(ask, -12, 0, 4), opacity: Math.min(1, ask * 1.6) * (1 - answered * 0.55), textDecorationLine: answered > 0.5 ? "line-through" : "none", textDecorationColor: "rgb(245 247 250 / 0.5)" }}
      >
        {M.chat.ask}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-[#2dd4bf]" style={fly(ans, 0, 8, 4)}>
        <span className="grid size-6 place-items-center rounded-full bg-[#2dd4bf]/15">
          <Check size={14} weight="bold" />
        </span>
        {M.chat.answer}
      </div>
    </div>
  );
}

/* ---------------- scene 4: the owner's phone (desktop) / a toast over the page (phones) ---------------- */
const Owner = function Owner({ t, hold, M, mobile }: MProps & { hold: number; mobile: boolean }) {
  if (t < 18.9) return null;
  const k = expo(seg(t, 19.0, 20.0));
  const toast = expo(seg(t, 24.1, 24.9));
  // a soft pulse on the toast while the final frame is held
  const pulse = hold > 0 ? 0.5 - 0.5 * Math.cos(Math.min(1, hold / 1.2) * Math.PI) : 0;
  const card = (
    <div
      className="tool tool-dense flex items-start gap-3 p-4"
      style={{ ...tint("52 211 153"), ...fly(toast, 0, -24, 10), boxShadow: pulse ? `0 0 0 ${(1 + pulse * 2).toFixed(2)}px rgb(52 211 153 / ${(0.5 - pulse * 0.4).toFixed(3)}), 0 34px 70px -28px rgb(0 0 0 / 0.9)` : undefined }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#34d399] text-[#05070d]">
        <ChatCircleDots size={20} weight="fill" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[#f5f7fa]">{M.toast.title}</span>
          <span className="text-[12px] text-[#8b919c]">{M.toast.time}</span>
        </span>
        <span className="mt-1 block text-[13px] leading-[18px] text-[#c4cad4]">{M.toast.text}</span>
      </span>
    </div>
  );
  if (mobile) {
    return toast > 0 ? (
      <div className="absolute" style={{ left: BR.x + 24, top: BR.y + BR.bar + 14, width: BR.w - 48 }}>
        {card}
      </div>
    ) : null;
  }
  return (
    <div
      className="absolute overflow-hidden rounded-[42px] bg-[#0b0d12] p-[10px] shadow-[0_0_0_2px_#2a2e37,0_40px_80px_-30px_rgb(0_0_0/0.95)]"
      style={{ left: 860, top: 40, width: 270, height: 540, ...fly(k, 40, 0, 14) }}
    >
      <div className="relative h-full overflow-hidden rounded-[33px] bg-[radial-gradient(120%_80%_at_30%_0%,#1d2a44_0%,#0b0f19_60%)]">
        <span className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        <p className="mt-16 flex items-center justify-center gap-1.5 text-[12px] text-[#c4cad4]">
          <Lock size={12} weight="fill" />
        </p>
        <p className="mt-1 text-center text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#f5f7fa]">10:24</p>
        <div className="absolute inset-x-3 top-[190px]">{card}</div>
      </div>
    </div>
  );
};

/* ---------------- the visitor's cursor ---------------- */
function Pointer({ t }: { t: number }) {
  // timed path [t, x, y]; clicks: search result (5.2), name (20.4), phone (21.7), send (23.5)
  const path: [number, number, number][] = [
    [3.5, 1000, 600],
    [4.9, 560, 226],
    [5.7, 560, 226],
    [7.9, 900, 560],
    [9.0, 330, 250],
    [10.4, 420, 390],
    [13.9, 420, 420],
    [14.4, 640, 160],
    [16.9, 640, 300],
    [19.6, 560, 520],
    [20.3, 330, sy(P.form + 108, 20.3) + 18],
    [21.5, 330, sy(P.form + 108, 21.5) + 18],
    [21.65, 330, sy(P.form + 176, 21.65) + 18],
    [23.1, 330, sy(P.form + 176, 23.1) + 18],
    [23.4, 300, sy(P.form + 234, 23.4) + 22],
  ];
  const on = (t > 3.4 && t < 6.0) || (t > 7.8 && t < 24.6);
  if (!on) return null;
  const { x, y } = along(t, path);
  const vis = Math.min(seg(t, 3.4, 3.8) + seg(t, 7.8, 8.2), 1) * (1 - seg(t, 5.7, 6.0) * (t < 7 ? 1 : 0)) * (1 - seg(t, 24.2, 24.6));
  const clicks = [5.2, 20.4, 21.7, 23.5];
  const press = Math.max(...clicks.map((c) => seg(t, c - 0.1, c) - seg(t, c, c + 0.2)));
  return (
    <svg
      width="22"
      height="26"
      viewBox="0 0 22 26"
      className="absolute"
      style={{ left: x, top: y, opacity: vis, transform: press > 0 ? `scale(${(1 - press * 0.15).toFixed(3)})` : undefined, transformOrigin: "2px 2px" }}
    >
      <path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.6 15 L17.5 15 Z" fill="#ffffff" stroke="#1a1714" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
