"use client";

import { siFigma, siGithub, siHtml5, siJavascript, siNextdotjs, siReact, siResend, siSanity, siTailwindcss, siTypescript, siVercel } from "simple-icons";
import type { CSSProperties } from "react";
import { useContent } from "../Lang";

/** brand marks (Simple Icons, single-path SVGs); hover shows the brand colour, dark brands stay white */
const ICON = {
  figma: siFigma,
  nextjs: siNextdotjs,
  react: siReact,
  typescript: siTypescript,
  javascript: siJavascript,
  tailwind: siTailwindcss,
  html: siHtml5,
  sanity: siSanity,
  vercel: siVercel,
  github: siGithub,
  resend: siResend,
} as const;

/** too dark to read on the page background: keep these white on hover */
const DARK = new Set(["000000", "181717", "FFFFFF"]);

/**
 * «Стек технологій» under the cases (asked, Nov 2026, from a reference with grouped logo rows): a title + lead,
 * then one row per group on hairlines: group name left, logo tiles (mark + name) right. Marks are grey at rest
 * and take their brand colour on hover. Only tools the studio really uses (WORK.stack, DRAFT).
 */
export function Stack() {
  const { WORK } = useContent();
  const S = WORK.stack;
  return (
    <div className="relative z-[1] mt-24 w-full min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h3 data-reveal className="legible text-headline font-semibold text-fg">
          {S.title}
        </h3>
        <p data-reveal className="legible max-w-[26rem] text-base text-body">
          {S.lead}
        </p>
      </div>
      <ul className="mt-8 border-b border-white/[0.09]">
        {S.groups.map((g, i) => (
          <li
            key={g.title}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as CSSProperties}
            className="grid gap-x-8 gap-y-5 border-t border-white/[0.09] py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center"
          >
            <p className="legible text-title font-medium text-fg">{g.title}</p>
            <ul className="flex flex-wrap gap-3">
              {g.items.map((t) => {
                const icon = ICON[t.id as keyof typeof ICON];
                const hex = icon && !DARK.has(icon.hex.toUpperCase()) ? `#${icon.hex}` : "#f5f7fa";
                return (
                  <li
                    key={t.id}
                    style={{ "--brand": hex } as CSSProperties}
                    className="group/tech flex h-14 items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.03] pl-4 pr-5 transition-colors duration-300 hover:border-white/20"
                  >
                    {icon && (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 fill-[#8b919c] transition-colors duration-300 group-hover/tech:fill-[var(--brand)]">
                        <path d={icon.path} />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-body transition-colors duration-300 group-hover/tech:text-fg">{t.name}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
