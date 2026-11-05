"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Plan } from "@/lib/content";
import { SLUG } from "@/lib/services";
import { useContent, useLang } from "./Lang";
import { CardFilmSection } from "./explain/CardFilm";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { G } from "./ui/Bits";
import { GuideBlocks } from "./ui/GuideBlocks";
import { Button } from "./ui/Button";

/**
 * One SEO page per plan (/landing-page etc., same slug under /en): a keyword h1 with the city in the meta, the price
 * and timeline, how we work (the four film stages), the FAQ, the other
 * services, and the request form already set to this type. Copy: SERVICES.pages + the plan itself. A plan with
 * SERVICES.pages.guides[id] also gets plain explainer rows under the hero (heading left, text right, on hairlines).
 * The whole page sits in one centred 80rem container (asked; the only page with one).
 */
export function ServicePage({ id }: { id: Plan["id"] }) {
  const { SERVICES, BUILD, CTA, UI, NAV } = useContent();
  const lang = useLang();
  const P = SERVICES.pages;
  const idx = SERVICES.plans.findIndex((p) => p.id === id);
  const plan = SERVICES.plans[idx];
  const pg = P.items[id];
  const guide = P.guides[id];
  const home = lang === "en" ? "/en" : "/";
  const base = lang === "en" ? "/en/" : "/";
  const money = (v: number) => `${SERVICES.currency}${v.toLocaleString(UI.locale)}`;
  const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;

  return (
    <div className="mx-auto w-full max-w-[80rem]">
      {/* hero: what, for whom, price, timeline */}
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
        <dl data-reveal data-in style={delay(2)} className="relative z-[1] mt-10 flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <dt className="text-sm text-grey">{P.priceLabel}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-fg tabular-nums lg:text-3xl">
              {SERVICES.pricePrefix} {money(plan.price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-grey">{P.termLabel}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-fg lg:text-3xl">
              {SERVICES.term} {UI.days(plan.days)}
            </dd>
          </div>
        </dl>
        <div data-reveal data-in style={delay(3)} className="relative z-[1] mt-10 flex flex-wrap gap-3">
          <Button href="#contact">{CTA.primary}</Button>
          <Button href={NAV[1].href} variant="secondary">
            {CTA.work}
          </Button>
        </div>
      </section>

      {/* explainer film: what this type of site is, shown on a mock site (only the business card so far) */}
      {id === "card" && <CardFilmSection />}

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

      <Faq />

      {/* the other services: internal links between the service pages */}
      <section aria-labelledby="others-title" className="relative flex w-full flex-col px-gutter pb-12 pt-24">
        <h2 id="others-title" className="legible relative z-[1] text-headline font-semibold text-fg">
          {P.others}
        </h2>
        <ul className="relative z-[1] mt-8 grid w-full gap-4 md:grid-cols-3">
          {SERVICES.plans
            .filter((p) => p.id !== id)
            .map((p, i) => (
              <li key={p.id} data-reveal style={delay(i)} className="flex">
                <Link href={`${base}${SLUG[p.id]}`} className="card group flex w-full items-start justify-between gap-4 p-6">
                  <span className="min-w-0">
                    <span className="block text-title font-medium text-fg">{p.name}</span>
                    <span className="mt-1 block text-sm text-body">{p.for}</span>
                    <span className="mt-4 block text-sm text-grey">
                      {SERVICES.pricePrefix} <span className="font-semibold text-fg">{money(p.price)}</span>
                    </span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/[0.18] text-fg transition-colors duration-300 group-hover:border-[#2a6fe8] group-hover:bg-[#2a6fe8]">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FinalCta preset={idx} />
    </div>
  );
}
