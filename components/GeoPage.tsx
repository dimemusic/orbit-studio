"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useContent, useLang } from "./Lang";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { G } from "./ui/Bits";
import { Button } from "./ui/Button";
import { GuideBlocks } from "./ui/GuideBlocks";

/**
 * «Website development across Ukraine» (/website-development-ukraine, /en/…): the ONE page that answers searches from
 * every city (Nov 2026, asked). Real content, not a doorway: how we work remotely, the cities as one sentence, the four
 * services with prices, its own FAQ, the form. Copy: GEO in the content files. Same 80rem container as the service pages.
 */
export function GeoPage() {
  const { GEO, CTA, UI, NAV, SERVICES } = useContent();
  const lang = useLang();
  const home = lang === "en" ? "/en" : "/";
  const g = GEO.page;
  const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;
  return (
    <div className="mx-auto w-full max-w-[80rem]">
      <section aria-labelledby="geo-title" className="relative flex w-full flex-col px-gutter pb-12 pt-32 lg:pt-40">
        <nav aria-label={UI.crumbs} data-reveal data-in className="relative z-[1]">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-grey">
            <li>
              <Link href={home} className="transition-colors hover:text-fg">
                {SERVICES.pages.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={NAV[2].href} className="transition-colors hover:text-fg">
                {g.crumb}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-body">
              {GEO.link}
            </li>
          </ol>
        </nav>
        <h1 id="geo-title" data-reveal data-in className="legible relative z-[1] mt-6 text-mega font-semibold">
          {g.h1[0]} <G tone="violet">{g.h1[1]}</G>
        </h1>
        <p data-reveal data-in style={delay(1)} className="legible relative z-[1] mt-6 max-w-[44rem] text-lead text-body">
          {g.intro}
        </p>
        <div data-reveal data-in style={delay(2)} className="relative z-[1] mt-10 flex flex-wrap gap-3">
          <Button href="#contact">{CTA.primary}</Button>
          <Button href={NAV[1].href} variant="secondary">
            {CTA.work}
          </Button>
        </div>
      </section>

      <GuideBlocks blocks={g.blocks} />
      <Faq id="geo-faq" faq={GEO.faq} />
      <FinalCta />
    </div>
  );
}
