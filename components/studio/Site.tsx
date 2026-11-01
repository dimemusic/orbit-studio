"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import { useStudio } from "./engine";

/** the client's café site: one design that every window shows, from wireframe to live */
const C = { bg: "#f7f1e8", ink: "#2a1d15", muted: "#7b6a5e", accent: "#c8643b", card: "#fffaf3", ring: "#ead9c4", line: "#e6dccd" };

export type SiteState = {
  /** 0 wireframe → 1 designed */
  design: number;
  /** 0 desktop → 1 phone layout */
  phone: number;
  /** Капучино price edited (0 → 1) */
  price: number;
  /** seasonal item shown (0 → 1) */
  seasonal: number;
  /** «Вакансії» page added to the nav (0 → 1) */
  jobs: number;
};

/** a block that is a dashed grey placeholder at k=0 and its real content at k=1 */
function Block({ k, style, children, r = 10 }: { k: number; style: CSSProperties; children: ReactNode; r?: number }) {
  return (
    <div className="absolute" style={style}>
      {k < 1 && (
        <div
          className="absolute inset-0"
          style={{ borderRadius: r, background: "rgba(42,29,21,0.06)", border: "1.5px dashed rgba(42,29,21,0.22)", opacity: 1 - k }}
        />
      )}
      {k > 0 && <div style={{ opacity: k, height: "100%", filter: k < 1 ? `blur(${((1 - k) * 4).toFixed(1)}px)` : undefined }}>{children}</div>}
    </div>
  );
}

export const Cup = memo(function Cup({ size = 120, steam = true }: { size?: number; steam?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      {steam && (
        <g fill="none" stroke={C.muted} strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <path d="M48 30c-6-7 6-11 0-19" />
          <path d="M60 28c-6-7 6-11 0-19" />
          <path d="M72 30c-6-7 6-11 0-19" />
        </g>
      )}
      <ellipse cx="60" cy="98" rx="44" ry="9" fill="#d9c7b0" />
      <path d="M26 46h68l-6 40c-1 6-6 10-12 10H44c-6 0-11-4-12-10z" fill={C.card} stroke={C.ink} strokeWidth="3" />
      <path d="M93 54c12 0 14 18 0 20" fill="none" stroke={C.ink} strokeWidth="3" />
      <ellipse cx="60" cy="47" rx="33" ry="6" fill="#8a5a3c" stroke={C.ink} strokeWidth="3" />
    </svg>
  );
});

function Price({ base, next, k }: { base: string; next?: string; k: number }) {
  if (!next || k <= 0) return <>{base}</>;
  return (
    <span className="relative inline-grid">
      <span className="col-start-1 row-start-1" style={{ opacity: 1 - Math.min(1, k * 2), textDecoration: "line-through" }}>
        {base}
      </span>
      <span className="col-start-1 row-start-1 rounded px-1" style={{ opacity: Math.min(1, k * 1.6), color: C.accent, background: `rgba(200,100,59,${(0.18 * (1 - k)).toFixed(3)})` }}>
        {next}
      </span>
    </span>
  );
}

function Desktop({ s }: { s: SiteState }) {
  const S = useStudio().site;
  const b = (i: number) => Math.min(1, Math.max(0, s.design * 1.7 - i * 0.14));
  return (
    <div className="absolute left-0 top-0" style={{ width: 480, height: 600, background: C.bg, color: C.ink }}>
      <Block k={b(0)} style={{ left: 20, top: 14, width: 440, height: 28 }} r={6}>
        <div className="flex h-full items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-bold">
            <span className="grid size-6 place-items-center rounded-full text-[11px] text-white" style={{ background: C.accent }}>
              З
            </span>
            {S.brand}
          </span>
          <span className="flex items-center gap-4 text-[11.5px]" style={{ color: C.muted }}>
            {S.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
            {s.jobs > 0 && (
              <span className="rounded-full px-2 py-0.5 font-semibold" style={{ opacity: s.jobs, color: C.accent, background: `rgba(200,100,59,${(0.14 * s.jobs).toFixed(3)})` }}>
                {S.jobs}
              </span>
            )}
          </span>
        </div>
      </Block>
      <Block k={b(1)} style={{ left: 24, top: 78, width: 232, height: 104 }}>
        <p className="text-[29px] font-bold leading-[1.05] tracking-[-0.02em]">{S.h1}</p>
      </Block>
      <Block k={b(2)} style={{ left: 24, top: 194, width: 220, height: 36 }}>
        <p className="text-[12.5px] leading-snug" style={{ color: C.muted }}>
          {S.sub}
        </p>
      </Block>
      <Block k={b(3)} style={{ left: 24, top: 244, width: 118, height: 38 }} r={19}>
        <span className="flex h-full items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: C.ink }}>
          {S.cta}
        </span>
      </Block>
      <Block k={b(2)} style={{ left: 270, top: 70, width: 190, height: 220 }} r={95}>
        <div className="relative grid h-full place-items-center">
          <div className="absolute size-[186px] rounded-full" style={{ background: C.ring }} />
          <div className="relative">
            <Cup size={150} />
          </div>
        </div>
      </Block>
      <Block k={b(4)} style={{ left: 24, top: 316, width: 120, height: 24 }} r={6}>
        <p className="text-[18px] font-bold">{S.menu}</p>
      </Block>
      {S.items.map((it, i) => (
        <Block key={it.n} k={b(4 + i * 0.4)} style={{ left: 24 + i * 148, top: 352, width: 136, height: 118 }} r={14}>
          <div className="flex h-full flex-col justify-between rounded-[14px] p-3" style={{ background: C.card, boxShadow: `0 0 0 1px ${C.line}` }}>
            <span className="grid size-10 place-items-center rounded-full" style={{ background: C.ring }}>
              <Cup size={30} steam={false} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold">{it.n}</span>
              <span className="block text-[12.5px] tabular-nums" style={{ color: C.muted }}>
                <Price base={it.p} next={"np" in it ? (it.np as string) : undefined} k={i === 0 ? s.price : 0} />
              </span>
            </span>
          </div>
        </Block>
      ))}
      <div
        className="absolute flex items-center justify-between rounded-[14px] px-4"
        style={{
          left: 24,
          top: 486,
          width: 432,
          height: 52,
          background: C.ink,
          color: C.bg,
          opacity: s.seasonal,
          transform: `translateY(${((1 - s.seasonal) * 12).toFixed(1)}px)`,
        }}
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="rounded-full px-2 py-0.5 text-[10.5px]" style={{ background: C.accent, color: "#fff" }}>
            ✦
          </span>
          {S.seasonal.n}
        </span>
        <span className="text-[13px] tabular-nums">{S.seasonal.p}</span>
      </div>
    </div>
  );
}

function Phone({ s }: { s: SiteState }) {
  const S = useStudio().site;
  return (
    <div className="absolute left-0 top-0" style={{ width: 280, height: 600, background: C.bg, color: C.ink }}>
      <div className="flex items-center justify-between px-4 pt-8">
        <span className="flex items-center gap-1.5 text-[14px] font-bold">
          <span className="grid size-5 place-items-center rounded-full text-[10px] text-white" style={{ background: C.accent }}>
            З
          </span>
          {S.brand}
        </span>
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-4 rounded" style={{ background: C.ink }} />
          <span className="block h-[2px] w-4 rounded" style={{ background: C.ink }} />
        </span>
      </div>
      <div className="relative mx-auto mt-4 grid size-[118px] place-items-center">
        <div className="absolute inset-0 rounded-full" style={{ background: C.ring }} />
        <div className="relative">
          <Cup size={96} />
        </div>
      </div>
      <p className="mt-4 px-5 text-center text-[21px] font-bold leading-[1.08] tracking-[-0.02em]">{S.h1}</p>
      <div className="mx-5 mt-4 flex h-9 items-center justify-center rounded-full text-[12.5px] font-semibold text-white" style={{ background: C.ink }}>
        {S.cta}
      </div>
      <p className="mt-6 px-5 text-[15px] font-bold">{S.menu}</p>
      <div className="mx-4 mt-2 flex flex-col gap-1.5">
        {s.seasonal > 0 && (
          <div
            className="flex items-center justify-between overflow-hidden rounded-xl px-3 text-[12px] font-semibold"
            style={{ background: C.ink, color: C.bg, height: 38 * s.seasonal, opacity: s.seasonal }}
          >
            <span>✦ {S.seasonal.n}</span>
            <span className="tabular-nums">{S.seasonal.p}</span>
          </div>
        )}
        {S.items.map((it, i) => (
          <div key={it.n} className="flex h-[38px] items-center justify-between rounded-xl px-3 text-[12px]" style={{ background: C.card, boxShadow: `0 0 0 1px ${C.line}` }}>
            <span className="font-semibold">{it.n}</span>
            <span className="tabular-nums" style={{ color: C.muted }}>
              <Price base={it.p} next={"np" in it ? (it.np as string) : undefined} k={i === 0 ? s.price : 0} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** the site scaled to a w × h viewport (content clipped), cross-fading desktop ↔ phone layouts */
export function Site({ w, h, s, radius = 12 }: { w: number; h: number; s: SiteState; radius?: number }) {
  const showD = s.phone < 1;
  const showP = s.phone > 0;
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: radius, background: C.bg }}>
      {showD && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${(w / 480).toFixed(4)})`, opacity: 1 - s.phone }}>
          <Desktop s={s} />
        </div>
      )}
      {showP && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${(w / 280).toFixed(4)})`, opacity: s.phone }}>
          <Phone s={s} />
        </div>
      )}
    </div>
  );
}
