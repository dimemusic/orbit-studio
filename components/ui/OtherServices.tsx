"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Plan } from "@/lib/content";
import { GEO_SLUG, SLUG } from "@/lib/services";
import { useContent, useLang } from "../Lang";

/**
 * «Інші послуги»: internal links between the SEO pages, always four cards. On a service page (`current`) the three other
 * plans + the «all Ukraine» page; on the «all Ukraine» page (no `current`) the four plans.
 */
export function OtherServices({ current }: { current?: Plan["id"] }) {
  const { SERVICES, GEO, UI } = useContent();
  const base = useLang() === "en" ? "/en/" : "/";
  const money = (v: number) => `${SERVICES.currency}${v.toLocaleString(UI.locale)}`;
  const cards: { href: string; name: string; text: string; price?: number }[] = SERVICES.plans
    .filter((p) => p.id !== current)
    .map((p) => ({ href: `${base}${SLUG[p.id]}`, name: p.name, text: p.for, price: p.price }));
  if (current) cards.push({ href: `${base}${GEO_SLUG}`, name: GEO.link, text: GEO.card });

  return (
    <section aria-labelledby="others-title" className="relative flex w-full flex-col px-gutter pb-12 pt-24">
      <h2 id="others-title" className="legible relative z-[1] text-headline font-semibold text-fg">
        {SERVICES.pages.others}
      </h2>
      <ul className="relative z-[1] mt-8 grid w-full gap-4 md:grid-cols-2">
        {cards.map((c, i) => (
          <li key={c.href} data-reveal style={{ "--d": `${i * 80}ms` } as CSSProperties} className="flex">
            <Link href={c.href} className="card group flex w-full items-start justify-between gap-4 p-6">
              <span className="min-w-0">
                <span className="block text-title font-medium text-fg">{c.name}</span>
                <span className="mt-1 block text-sm text-body">{c.text}</span>
                {c.price !== undefined && (
                  <span className="mt-4 block text-sm text-grey">
                    {SERVICES.pricePrefix} <span className="font-semibold text-fg">{money(c.price)}</span>
                  </span>
                )}
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/[0.18] text-fg transition-colors duration-300 group-hover:border-[#2a6fe8] group-hover:bg-[#2a6fe8]">
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
