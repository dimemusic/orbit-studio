"use client";

import {
  ArrowsClockwise,
  Baby,
  Buildings,
  ChatCircleText,
  ClockCountdown,
  Cookie,
  Database,
  HandPalm,
  LockKey,
  Prohibit,
  Scales,
  ShareNetwork,
  ShieldCheck,
  Target,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType, ReactNode } from "react";
import { useContent } from "./Lang";
import { ACCENT, type Accent } from "./ui/accent";

type Icon = ComponentType<{ size?: number; weight?: "light" | "regular" }>;

/** the four promises on top: icon + accent, in the order of PRIVACY.summary */
const SUMMARY: { icon: Icon; a: Accent }[] = [
  { icon: ChatCircleText, a: "blue" },
  { icon: Cookie, a: "green" },
  { icon: Prohibit, a: "violet" },
  { icon: Trash, a: "cyan" },
];
/** one icon per titled section, in the order they appear in PRIVACY.sections */
const ICONS: Icon[] = [Buildings, Database, Target, Scales, ShareNetwork, Cookie, ClockCountdown, HandPalm, LockKey, Baby, ArrowsClockwise];

/**
 * Privacy policy under the PageHero: four key promises as cards, then every section on its own glass card
 * (masonry columns on wide screens) so the page reads at a glance instead of as one long narrow column.
 * Copy lives in PRIVACY (content files); a section with an empty `h` continues the one before it.
 */
export function PrivacyBody() {
  const { PRIVACY, BRAND } = useContent();

  // the studio email inside the copy becomes a mailto link
  const rich = (t: string): ReactNode[] =>
    t.split(BRAND.email).flatMap((part, k) =>
      k === 0
        ? [part]
        : [
            <a key={k} href={`mailto:${BRAND.email}`} className="text-fg underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
              {BRAND.email}
            </a>,
            part,
          ],
    );

  // fold continuation blocks (empty heading) into the titled section before them
  type Block = { p: string[]; li: string[] };
  const groups: { h: string; blocks: Block[] }[] = [];
  for (const s of PRIVACY.sections) {
    if (s.h || !groups.length) groups.push({ h: s.h, blocks: [] });
    groups[groups.length - 1].blocks.push({ p: s.p, li: s.li });
  }

  return (
    <section aria-label={PRIVACY.title} className="w-full px-gutter pb-28 pt-4">
      {/* key promises */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PRIVACY.summary.map((it, i) => {
          const { icon: I, a } = SUMMARY[i];
          const c = ACCENT[a];
          return (
            <li key={it.t} data-reveal style={{ ["--d" as string]: `${200 + i * 70}ms` }} className="card flex items-start gap-4 p-6">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${c.tint} ${c.text}`}>
                <I size={22} weight="light" />
              </span>
              <span>
                <span className="block text-[17px] font-semibold text-fg">{it.t}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-body">{it.d}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-14 flex items-center gap-2 text-[14px] text-grey">
        <ShieldCheck size={18} weight="light" className="text-green" />
        {PRIVACY.updated}
      </p>

      {/* the full text, one card per section */}
      <div className="mt-5 gap-4 lg:columns-2 wide:columns-3">
        {groups.map((g, i) => {
          const I = ICONS[i] ?? ShieldCheck;
          return (
            <article key={g.h || i} data-reveal className="card mb-4 break-inside-avoid p-[clamp(22px,2.4vw,32px)] text-left">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-body">
                  <I size={20} weight="light" />
                </span>
                <h2 className="text-title font-semibold text-fg">{g.h}</h2>
              </div>
              {g.blocks.map((b, j) => (
                <div key={j}>
                  {b.p.map((t, k) => (
                    <p key={k} className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-body">
                      {rich(t)}
                    </p>
                  ))}
                  {b.li.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {b.li.map((t, k) => (
                        <li key={k} className="flex gap-3 text-[16px] leading-relaxed text-body">
                          <span aria-hidden="true" className="mt-[0.68em] size-1.5 shrink-0 rounded-full bg-blue" />
                          <span>{rich(t)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </section>
  );
}
