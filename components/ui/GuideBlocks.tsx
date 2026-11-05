"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { GuideBlock } from "@/lib/content";
import { SLUG } from "@/lib/services";
import { useLang } from "../Lang";

/**
 * Plain explainer rows on hairlines: heading left, text right (paragraphs and / or a list whose items may link to a
 * service page). Shared by the service pages (SERVICES.pages.guides) and the «all Ukraine» page (GEO.page.blocks).
 */
export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  const base = useLang() === "en" ? "/en/" : "/";
  return (
    <div className="relative z-[1] flex w-full flex-col px-gutter pb-12 pt-24">
      <div className="border-b border-white/[0.09]">
        {blocks.map((b, i) => (
          <section key={b.title} aria-labelledby={`guide-${i}`} className="grid gap-x-8 gap-y-6 border-t border-white/[0.09] py-12 lg:grid-cols-2">
            <h2 id={`guide-${i}`} data-reveal className="legible text-headline font-semibold text-fg">
              {b.title}
            </h2>
            <div data-reveal className="flex max-w-[44rem] flex-col gap-6">
              {b.paras?.map((t) => (
                <p key={t} className="legible text-lead text-body">
                  {t}
                </p>
              ))}
              {b.items && (
                <ul className="flex flex-col gap-6">
                  {b.items.map((t) => (
                    <li key={t.title}>
                      {t.to ? (
                        <Link href={`${base}${SLUG[t.to]}`} className="legible inline-flex items-center gap-2 text-title font-medium text-fg transition-colors hover:text-blue">
                          {t.title}
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                      ) : (
                        <p className="legible text-title font-medium text-fg">{t.title}</p>
                      )}
                      <p className="legible mt-1 text-base text-body">{t.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
