import { ArrowRight, CheckCircle, Lightning, XCircle } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties, ReactNode } from "react";
import { box, fly, STAGE_SEC, useB } from "./shared";
import { useFit } from "./Stage";
import { expo, seg } from "./util";

/* ---------------- 1 · Brief & research ---------------- */

const BAD = "#fb7185";
const GOOD = "#34d399";
const PAPER = "#f4f0e8";

type R = { x: number; y: number; w: number; h: number };
/**
 * One idea, fast (~3 s, then held): three competitor sites get marked in coral where they lose customers
 * (hidden prices, a 9-field form, a slow load), an arrow, and the plan of YOUR site (a paper wireframe, the same
 * paper the design stage then draws on) gets the green answer to each, pinned to the block it changes.
 * Desktop: competitors left, the site right. Phones (centre crop 360..840): competitors in a row on top, the site below.
 */
const DESK = {
  label: [
    { x: 200, y: 56 },
    { x: 680, y: 56 },
  ],
  thumbs: [0, 1, 2].map((i) => ({ x: 200, y: 88 + i * 164, w: 260, h: 136 })),
  bad: (t: R) => ({ x: t.x + t.w - 60, y: t.y + t.h - 26 }),
  arrow: { x: 556, y: 318 } as { x: number; y: number } | null,
  site: { x: 680, y: 88, w: 240, h: 464 },
  good: (y: number, s: R) => ({ x: s.x + s.w - 28, y: s.y + y - 16 }),
};
const MOB: typeof DESK = {
  label: [
    { x: 380, y: 36 },
    { x: 380, y: 248 },
  ],
  thumbs: [0, 1, 2].map((i) => ({ x: 380 + i * 152, y: 64, w: 136, h: 92 })),
  bad: (t: R) => ({ x: t.x, y: t.y + t.h + 12 }),
  arrow: null,
  site: { x: 380, y: 276, w: 176, h: 296 },
  good: (y: number, s: R) => ({ x: s.x + s.w + 12, y: s.y + y - 16 }),
};

export function BriefStage({ s }: { s: number }) {
  const { BUILD } = useB();
  const B = BUILD.brief;
  const { mobile } = useFit();
  const L = mobile ? MOB : DESK;
  const sec = (s * STAGE_SEC[0]) / 3; // beats → seconds
  const at = (a: number, d = 0.35) => expo(seg(sec, a, a + d));
  const site = L.site;
  // where each answer pins on the wireframe (y inside the site card): the hero price, the form, the nav (speed)
  const pin = [site.h * 0.3, site.h * 0.47, site.h * 0.08];
  const siteIn = at(1.3, 0.45);

  return (
    <>
      <p className="tool-label leading-4" style={{ ...box(L.label[0].x, L.label[0].y), opacity: at(0) }}>
        {B.rivalsLabel}
      </p>
      <p className="tool-label leading-4" style={{ ...box(L.label[1].x, L.label[1].y), opacity: siteIn }}>
        {B.siteLabel}
      </p>

      {/* competitors: three small sites, each marked where it loses people */}
      {L.thumbs.map((t, i) => (
        <div key={i} style={{ ...box(t.x, t.y, t.w, t.h), ...fly(at(0.05 + i * 0.1, 0.45), mobile ? 0 : -50, mobile ? 20 : 0, 12) }}>
          <Rival i={i} mark={at(0.55 + i * 0.25, 0.3)} />
        </div>
      ))}
      {L.thumbs.map((t, i) => {
        const p = L.bad(t);
        return (
          <Note key={i} small={mobile} style={{ ...box(p.x, p.y), ...pop(at(0.6 + i * 0.25, 0.3)) }} icon={<XCircle size={16} weight="fill" style={{ color: BAD }} />}>
            {B.pairs[i].bad}
          </Note>
        );
      })}

      {/* the turn */}
      {L.arrow && (
        <div
          className="grid size-12 place-items-center rounded-full"
          style={{ ...box(L.arrow.x, L.arrow.y - 24, 48, 48), ...pop(at(1.2, 0.3)), background: "rgb(255 255 255 / 0.06)", color: "#f5f7fa", transformOrigin: "center" }}
        >
          <ArrowRight size={20} weight="bold" />
        </div>
      )}

      {/* your site: a paper wireframe; each answer lights the block it changes */}
      <div style={{ ...box(site.x, site.y, site.w, site.h), ...fly(siteIn, mobile ? 0 : 50, mobile ? 20 : 0, 12) }}>
        <Wire lit={[at(1.85), at(2.15), at(2.45)]} />
      </div>
      {B.pairs.map((p, i) => {
        const q = L.good(pin[i], site);
        return (
          <Note
            key={p.good}
            style={{ ...box(q.x, q.y), ...pop(at(1.85 + i * 0.3, 0.3)) }}
            icon={
              i === 2 ? (
                <Lightning size={16} weight="fill" style={{ color: GOOD }} />
              ) : (
                <CheckCircle size={16} weight="fill" style={{ color: GOOD }} />
              )
            }
          >
            {p.good}
          </Note>
        );
      })}
    </>
  );
}

/** a small pop-in: scale from .85 + fade (no filter: stays sharp when settled) */
const pop = (k: number): CSSProperties => ({
  opacity: k,
  transform: k < 1 ? `scale(${(0.85 + 0.15 * k).toFixed(3)})` : undefined,
  transformOrigin: "left center",
});

/** `small` on phones: the three coral notes must each fit under their 136px thumbnail */
function Note({ style, icon, small, children }: { style: CSSProperties; icon: ReactNode; small?: boolean; children: ReactNode }) {
  return (
    <div
      className={`tool tool-dense flex items-center whitespace-nowrap font-medium leading-4 text-fg ${small ? "h-7 gap-1 pl-1 pr-2 text-[12px]" : "h-8 gap-2 pl-2 pr-3 text-[13px]"}`}
      style={{ ...style, borderRadius: 999 }}
    >
      {icon}
      {children}
    </div>
  );
}

/**
 * A competitor's site as a tiny browser window, each with its own layout and its own problem,
 * outlined in coral once `mark` runs: 0 = a hero with no price, 1 = a long form, 2 = still loading.
 */
function Rival({ i, mark }: { i: number; mark: number }) {
  const ring: CSSProperties = { outline: `1.5px dashed rgb(251 113 133 / ${mark.toFixed(3)})`, outlineOffset: 3, borderRadius: 4 };
  const bar = "rounded-sm bg-white/[0.14]";
  return (
    <div className="tool-cell flex size-full flex-col overflow-hidden" style={{ borderRadius: 12 }}>
      <div className="flex h-4 shrink-0 items-center gap-1 border-b border-white/[0.06] px-2">
        {[0, 1, 2].map((d) => (
          <span key={d} className="size-1 rounded-full bg-white/20" />
        ))}
        {i === 2 && (
          // the slow one: the loading bar is still crawling
          <span className="ml-2 h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <span className="block h-full rounded-full" style={{ width: `${(20 + 20 * mark).toFixed(1)}%`, background: BAD }} />
          </span>
        )}
      </div>
      <div className="flex flex-1 gap-2 p-2">
        {i === 0 && (
          <>
            <div className="flex flex-1 flex-col gap-1 pt-1" style={ring}>
              <span className={`h-2 w-4/5 ${bar}`} />
              <span className={`h-2 w-3/5 ${bar}`} />
              <span className="mt-1 h-1 w-4/5 rounded-sm bg-white/[0.07]" />
              <span className="mt-auto h-3 w-2/5 rounded-full bg-white/[0.18]" />
            </div>
            <div className="w-2/5 rounded-md bg-white/[0.07]" />
          </>
        )}
        {i === 1 && (
          <>
            <div className="w-1/3 rounded-md bg-white/[0.07]" />
            <div className="grid flex-1 grid-cols-2 gap-1" style={ring}>
              {Array.from({ length: 9 }, (_, n) => (
                <span key={n} className={`rounded-sm bg-white/[0.09] ${n === 8 ? "col-span-2" : ""}`} />
              ))}
            </div>
          </>
        )}
        {i === 2 && (
          <div className="flex flex-1 flex-col gap-1" style={ring}>
            <div className="flex-1 rounded-md bg-white/[0.04]" />
            <div className="flex gap-1">
              {[0, 1, 2].map((n) => (
                <span key={n} className="h-2 flex-1 rounded-sm bg-white/[0.04]" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The plan of the new site as a paper wireframe: nav, hero with the price, a 2-field form, benefits, plans.
 * lit = [price, form, speed (the nav)]: that block gets a green ring + tint when its answer arrives.
 */
function Wire({ lit }: { lit: number[] }) {
  const ink = "rgb(5 7 13 / 0.14)";
  const ink2 = "rgb(5 7 13 / 0.07)";
  const glow = (k: number): CSSProperties =>
    k > 0 ? { boxShadow: `0 0 0 ${(2 * k).toFixed(2)}px rgb(52 211 153 / ${k.toFixed(3)})`, background: `rgb(52 211 153 / ${(0.2 * k).toFixed(3)})` } : {};
  return (
    <div className="flex size-full flex-col gap-[4%] overflow-hidden p-[7%]" style={{ background: PAPER, borderRadius: 12 }}>
      {/* nav: fast load */}
      <div className="-mx-1 flex h-[5%] items-center gap-2 rounded-md px-1" style={glow(lit[2])}>
        <span className="aspect-square h-3/5 rounded-full" style={{ background: "rgb(5 7 13 / 0.6)" }} />
        <span className="h-1/3 w-1/4 rounded-sm" style={{ background: ink }} />
        <span className="ml-auto h-3/5 w-1/4 rounded-full" style={{ background: "rgb(5 7 13 / 0.8)" }} />
      </div>
      {/* hero: headline + the price right there */}
      <div className="flex flex-col justify-center gap-[7%]" style={{ height: "19%" }}>
        <span className="h-[18%] w-11/12 rounded-sm" style={{ background: "rgb(5 7 13 / 0.72)" }} />
        <span className="h-[18%] w-2/3 rounded-sm" style={{ background: "rgb(5 7 13 / 0.72)" }} />
        <span className="h-[26%] w-2/5 rounded-full" style={{ background: ink, ...glow(lit[0]) }} />
      </div>
      {/* the 2-field request */}
      <div className="flex flex-col gap-[8%] rounded-lg p-[5%]" style={{ height: "17%", background: ink2, ...glow(lit[1]) }}>
        <span className="flex-1 rounded-sm bg-white" />
        <span className="flex-1 rounded-sm bg-white" />
        <span className="flex-1 rounded-full" style={{ background: "#2a6fe8" }} />
      </div>
      {/* benefits */}
      <div className="flex gap-[5%]" style={{ height: "13%" }}>
        {[0, 1, 2].map((n) => (
          <span key={n} className="flex-1 rounded-md" style={{ background: ink2 }} />
        ))}
      </div>
      {/* plans */}
      <div className="flex flex-1 gap-[5%]">
        {[0, 1, 2].map((n) => (
          <span key={n} className="flex-1 rounded-md" style={{ background: n === 1 ? ink : ink2 }} />
        ))}
      </div>
    </div>
  );
}
