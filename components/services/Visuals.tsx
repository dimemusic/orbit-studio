"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Content } from "@/lib/content";

type V = Content["SERVICES"]["vis"];

/**
 * Small looping UI films for the «Наші послуги» cards (CSS keyframes only, `.sv-*` in globals.css).
 * Each one is drawn on a fixed stage (whole pixels) and scaled to its box; it plays only while on screen
 * (`data-play`), and under reduced motion shows its finished frame (`data-still`).
 */
const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Stage({ w, h, color, children, label }: { w: number; h: number; color: string; children: ReactNode; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  const [play, setPlay] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setK(el.clientWidth / w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return () => ro.disconnect();
    }
    const io = new IntersectionObserver(([e]) => setPlay(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [w]);
  return (
    <div
      ref={box}
      role="img"
      aria-label={label}
      className="sv relative w-full overflow-hidden"
      style={{ aspectRatio: `${w} / ${h}`, ["--ac" as string]: color }}
      data-play={play ? "" : undefined}
      data-still={still ? "" : undefined}
    >
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${k})`, visibility: k ? "visible" : "hidden" }}>
        {children}
      </div>
    </div>
  );
}

const Cursor = ({ name, className = "" }: { name: string; className?: string }) => (
  <div className={`sv-cur ${className}`}>
    <svg width="18" height="20" viewBox="0 0 26 28" aria-hidden="true">
      <path d="M2 2l20 9-9 3-4 9z" fill="#fff" stroke="rgba(0,0,0,.35)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
    <span>{name}</span>
  </div>
);

/* ───────────── directions (480 × 320) ───────────── */

export function DesignVis({ v }: { v: V }) {
  return (
    <>
      <div className="sv-board">
        <div className="sv-drop sv-b" style={{ ...i(0), left: 16, top: 14, width: 268, height: 12, borderRadius: 4, background: "#1b1410", opacity: 0.85 }} />
        <div className="sv-drop sv-b" style={{ ...i(1), left: 16, top: 44, width: 150, height: 16, borderRadius: 5, background: "#1b1410" }} />
        <div className="sv-drop sv-b" style={{ ...i(1.3), left: 16, top: 66, width: 116, height: 16, borderRadius: 5, background: "#1b1410" }} />
        <div className="sv-drop sv-b" style={{ ...i(2), left: 16, top: 98, width: 88, height: 26, borderRadius: 99, background: "#c8642b" }} />
        <div className="sv-drop sv-b sv-cup" style={{ ...i(2.6), left: 180, top: 40, width: 96, height: 96 }} />
        {[0, 1, 2].map((n) => (
          <div key={n} className="sv-drop sv-b" style={{ ...i(3.4 + n * 0.3), left: 16 + n * 92, top: 158, width: 84, height: 96, borderRadius: 10, background: "#fffaf3" }} />
        ))}
        <div className="sv-sel" style={{ ...i(1), left: 12, top: 40, width: 158, height: 46 }} />
        <div className="sv-sel" style={{ ...i(2), left: 12, top: 94, width: 96, height: 34 }} />
        <div className="sv-sel" style={{ ...i(3), left: 176, top: 36, width: 104, height: 104 }} />
        <div className="sv-sel" style={{ ...i(4), left: 12, top: 154, width: 276, height: 104 }} />
        <Cursor name={v.designer} className="sv-cur-design" />
      </div>
      <div className="sv-panel" style={{ left: 340, top: 24, width: 116 }}>
        <p className="sv-lab">{v.color}</p>
        <div className="flex flex-wrap gap-2">
          {["#c8642b", "#1b1410", "#f3ede4", "var(--ac)"].map((c, n) => (
            <span key={n} className="sv-pop sv-sw" style={{ ...i(n * 0.4 + 0.5), background: c }} />
          ))}
        </div>
        <p className="sv-lab mt-4">{v.font}</p>
        <p className="sv-pop sv-t13 font-semibold text-fg" style={i(2.5)}>Geologica</p>
        <p className="sv-lab mt-4">{v.gap}</p>
        <p className="sv-pop sv-t13 text-fg" style={i(3)}>24 px</p>
      </div>
    </>
  );
}

export function DevVis() {
  const lines = [
    ["<Hero", ' title="Кава…" />'],
    ["<Menu", " items={cms} />"],
    ["<Order", ' to="telegram" />'],
  ];
  return (
    <>
      <div className="sv-panel sv-mono" style={{ left: 20, top: 26, width: 222, height: 268 }}>
        <p className="sv-lab">page.tsx</p>
        {lines.map(([a, b], n) => (
          <p key={n} className="sv-type" style={i(n)}>
            <span style={{ color: "#c4a1ff" }}>{a}</span>
            <span>{b}</span>
          </p>
        ))}
        <p className="sv-type" style={{ ...i(3), color: "#34d399" }}>✓ build passed</p>
        <div className="sv-bar mt-4">
          <i className="sv-fill" />
        </div>
      </div>
      <div className="sv-browser" style={{ left: 258, top: 26, width: 202, height: 268 }}>
        <div className="sv-chrome">
          <i />
          <i />
          <i />
        </div>
        <div className="relative h-full bg-[#f3ede4]">
          {[
            [10, 12, 120, 12],
            [10, 34, 90, 12],
            [10, 58, 60, 20],
            [120, 14, 70, 70],
            [10, 104, 54, 70],
            [72, 104, 54, 70],
            [134, 104, 56, 70],
          ].map(([l, t, ww, hh], n) => (
            <div key={n} className="absolute" style={{ left: l, top: t, width: ww, height: hh }}>
              <div className="absolute inset-0 rounded-md border border-dashed border-black/25" />
              <div className="sv-real absolute inset-0 rounded-md" style={{ ...i(n < 3 ? 0 : n < 4 ? 0.5 : 1), background: n === 2 ? "#c8642b" : n === 3 ? "#8c4d26" : n > 3 ? "#fffaf3" : "#1b1410", borderRadius: n === 2 || n === 3 ? 99 : 6 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function AdminVis({ v }: { v: V }) {
  return (
    <>
      <div className="sv-panel" style={{ left: 20, top: 26, width: 236, height: 268 }}>
        <p className="sv-lab">{v.product}</p>
        <p className="sv-lab mt-3">{v.price}</p>
        <div className="sv-field">
          <span className="sv-roll">
            <span>75 ₴</span>
            <span style={{ color: "var(--ac)" }}>65 ₴</span>
          </span>
        </div>
        <div className="sv-field mt-3 justify-between">
          {v.stock}
          <span className="sv-toggle">
            <i />
          </span>
        </div>
        <div className="sv-save mt-4">{v.save}</div>
      </div>
      <div className="sv-product" style={{ left: 276, top: 50, width: 184, height: 212 }}>
        <div className="mx-auto mt-4 size-20 rounded-full" style={{ background: "radial-gradient(circle,#6b3a1d 0 34%,#e9dccb 35% 55%,#efe6da 56%)" }} />
        <p className="mt-3 text-center sv-t15 font-semibold text-[#1b1410]">{v.coffee}</p>
        <p className="mt-1 text-center sv-t15 font-semibold text-[#c8642b]">
          <span className="sv-roll sv-roll-late">
            <span>75 ₴</span>
            <span>65 ₴</span>
          </span>
        </p>
        <span className="sv-ring" />
      </div>
      <div className="sv-toast" style={{ left: 252, top: 252 }}>
        <span className="sv-dot" /> {v.saved}
      </div>
    </>
  );
}

export function SupportVis({ v }: { v: V }) {
  return (
    <>
      <div className="sv-panel" style={{ left: 20, top: 26, width: 440, height: 128 }}>
        <p className="sv-lab flex items-center gap-2">
          <span className="sv-live" /> {v.up}
        </p>
        <svg className="sv-draw mt-2" width="404" height="70" viewBox="0 0 404 70" aria-hidden="true">
          <polyline points="0,52 40,48 80,50 120,30 160,36 200,22 240,28 280,14 320,20 360,10 404,14" fill="none" stroke="var(--ac)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="sv-panel" style={{ left: 20, top: 168, width: 440, height: 128 }}>
        {v.done.map((t, n) => (
          <p key={t} className="flex h-9 items-center gap-3 sv-t14 text-fg">
            <span className="sv-check" style={i(n)}>
              ✓
            </span>
            {t}
          </p>
        ))}
      </div>
    </>
  );
}

/* ───────────── plans (360 × 220) ───────────── */

export function CardVis() {
  return (
    <div className="sv-page" style={{ left: 100, top: 16, width: 160, height: 220 }}>
      <div className="mx-auto mt-5 size-14 rounded-full" style={{ background: "var(--ac)", opacity: 0.85 }} />
      <div className="mx-auto mt-3 h-3 w-24 rounded bg-[#1b1d2a]" />
      <div className="mx-auto mt-2 h-2 w-16 rounded bg-black/20" />
      {[0, 1, 2].map((n) => (
        <div key={n} className="sv-pop mx-auto mt-3 h-6 w-28 rounded-full" style={{ ...i(n * 0.5 + 0.5), background: n === 0 ? "var(--ac)" : "#e9ebf2" }} />
      ))}
      <span className="sv-tap" />
    </div>
  );
}

export function LandingVis() {
  return (
    <div className="sv-page" style={{ left: 90, top: 14, width: 180, height: 206 }}>
      <div className="sv-scroll">
        <div className="h-3 w-24 rounded bg-[#1b1d2a]" />
        <div className="mt-2 h-3 w-16 rounded bg-[#1b1d2a]" />
        <div className="mt-3 h-14 rounded-lg" style={{ background: "var(--ac)", opacity: 0.3 }} />
        {[0, 1, 2].map((n) => (
          <div key={n} className="mt-3 flex gap-2">
            <div className="size-8 rounded-md bg-[#e9ebf2]" />
            <div className="flex-1">
              <div className="h-2 w-20 rounded bg-black/25" />
              <div className="mt-2 h-2 w-14 rounded bg-black/15" />
            </div>
          </div>
        ))}
        <div className="mt-3 h-16 rounded-lg bg-[#e9ebf2]" />
        <div className="sv-cta mt-3 h-7 rounded-full" style={{ background: "var(--ac)" }} />
      </div>
    </div>
  );
}

export function ShopVis() {
  return (
    <>
      <div className="sv-page" style={{ left: 40, top: 20, width: 280, height: 186 }}>
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="h-3 w-14 rounded bg-[#1b1d2a]" />
          <span className="sv-cart">
            🛒
            <b className="sv-badge">
              <span className="sv-roll sv-roll-cart">
                <span>1</span>
                <span>2</span>
              </span>
            </b>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 px-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-28 rounded-lg bg-[#f2f3f8] p-2">
              <div className="h-14 rounded-md" style={{ background: n === 1 ? "var(--ac)" : "#dfe2ec", opacity: n === 1 ? 0.55 : 1 }} />
              <div className="mt-2 h-2 w-12 rounded bg-black/25" />
              <div className="mt-2 h-2 w-8 rounded" style={{ background: "var(--ac)" }} />
            </div>
          ))}
        </div>
      </div>
      <div className="sv-fly" style={{ left: 150, top: 74 }} />
    </>
  );
}

export function CorpVis({ v }: { v: V }) {
  return (
    <div className="sv-page" style={{ left: 30, top: 18, width: 300, height: 190 }}>
      <div className="relative flex gap-4 px-3 pt-3 sv-t11 font-medium text-[#4b5060]">
        {v.tabs.map((t) => (
          <span key={t}>{t}</span>
        ))}
        <span className="sv-tab" />
      </div>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className={`sv-tabpage absolute inset-x-3 top-12 ${n === 0 ? "sv-first" : ""}`} style={i(n)}>
          <div className="h-3 rounded" style={{ width: 120 - n * 14, background: "#1b1d2a" }} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-20 rounded-lg" style={{ background: n % 2 ? "#e9ebf2" : "var(--ac)", opacity: n % 2 ? 1 : 0.35 }} />
            <div>
              <div className="h-2 w-full rounded bg-black/20" />
              <div className="mt-2 h-2 w-3/4 rounded bg-black/15" />
              <div className="mt-2 h-2 w-1/2 rounded bg-black/15" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
