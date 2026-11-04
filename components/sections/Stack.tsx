"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useContent } from "../Lang";

/**
 * «Стек технологій» under the cases (asked, Nov 2026, from a reference with grouped logo rows): a title + lead,
 * then one row per group on hairlines: group name left, logo tiles (mark + name) right. Marks are the full-colour
 * original logos (public/stack/<id>.svg, from devicon; asked: like the real logos, static, no hover). Black marks
 * (GitHub, Resend) are recoloured white so they read on the dark page. Only tools the studio really uses (WORK.stack, DRAFT).
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
                return (
                  <li key={t.id} className="flex h-14 items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.03] pl-4 pr-5">
                    <Image src={`/stack/${t.id}.svg`} alt="" width={24} height={24} unoptimized className="size-6 shrink-0" />
                    <span className="text-sm font-medium text-fg">{t.name}</span>
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
