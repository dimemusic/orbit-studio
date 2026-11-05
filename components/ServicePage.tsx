"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Plan } from "@/lib/content";
import { useContent, useLang } from "./Lang";
import { G } from "./ui/Bits";
import { GuideBlocks } from "./ui/GuideBlocks";
import { OtherServices } from "./ui/OtherServices";

/**
 * One SEO page per plan (/landing-page etc., same slug under /en): a keyword h1 with the city in the meta, explainer rows from
 * SERVICES.pages.guides[id] (heading left, text right, on hairlines), how we work (the four film stages) and the other
 * services. No FAQ or form here (asked). Copy: SERVICES.pages + the plan itself.
 * The whole page sits in one centred 80rem container (asked; the only page with one).
 */
export function ServicePage({ id }: { id: Plan["id"] }) {
  const { SERVICES, BUILD, UI, NAV } = useContent();
  const lang = useLang();
  const P = SERVICES.pages;
  const plan = SERVICES.plans.find((p) => p.id === id)!;
  const pg = P.items[id];
  const guide = P.guides[id];
  const home = lang === "en" ? "/en" : "/";
  const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;

  return (
    <div className="mx-auto w-full max-w-[80rem]">
      {/* hero: what, for whom */}
      <section aria-labelledby="service-title" className="relative flex w-full flex-col px-gutter pb-12 pt-32 lg:pt-40">
        <nav aria-label={UI.crumbs} data-reveal data-in className="relative z-[1]">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-grey">
            <li>
              <Link href={home} className="transition-colors hover:text-fg">
                {P.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={NAV[2].href} className="transition-colors hover:text-fg">
                {P.crumb}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-body">
              {plan.name}
            </li>
          </ol>
        </nav>
        <h1 id="service-title" data-reveal data-in className="legible relative z-[1] mt-6 text-mega font-semibold">
          {pg.h1[0]} <G tone="violet">{pg.h1[1]}</G>
        </h1>
        <p data-reveal data-in style={delay(1)} className="legible relative z-[1] mt-6 max-w-[44rem] text-lead text-body">
          {pg.intro}
        </p>
      </section>

      {/* what this type of site is, who it suits, what it gives */}
      {guide && <GuideBlocks blocks={guide} />}

      {/* how we work: the same four stages as the film on the home page */}
      <section aria-labelledby="process-title" className="relative flex w-full flex-col px-gutter pb-12 pt-24">
        <h2 id="process-title" className="legible relative z-[1] text-headline font-semibold text-fg">
          {P.process}
        </h2>
        <ol className="relative z-[1] mt-8 w-full border-b border-white/[0.09]">
          {BUILD.stages.map((s, i) => (
            <li key={s.id} data-reveal style={delay(i)} className="grid gap-x-8 gap-y-2 border-t border-white/[0.09] py-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
              <p className="legible text-title font-medium" style={{ color: s.color }}>
                {String(i + 1).padStart(2, "0")} {s.step}
              </p>
              <p className="legible text-base text-body">{s.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <OtherServices current={id} />
    </div>
  );
}
