"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useContent } from "../Lang";

/** Inner page hero: breadcrumb «Головна / …», heading, one line. Shorter than the home hero. */
export function PageHero({ crumb, title, lead }: { crumb: string; title: ReactNode; lead: ReactNode }) {
  const { CTA, UI } = useContent();
  return (
    <section
      aria-labelledby="page-title"
      className="flex w-full flex-col items-center px-gutter pb-[clamp(8px,2vw,24px)] pt-[clamp(140px,16vw,220px)] text-center"
    >
      <div className="plate flex flex-col items-center px-4 py-6">
        <nav aria-label={UI.crumbs} data-reveal>
          <ol className="flex items-center gap-2 text-[14px]">
            <li>
              <Link href={CTA.home} className="legible text-body transition-colors hover:text-fg">
                {UI.home}
              </Link>
            </li>
            <li aria-hidden="true" className="text-faint">
              /
            </li>
            <li aria-current="page" className="legible text-fg">
              {crumb}
            </li>
          </ol>
        </nav>
        <h1 id="page-title" data-reveal style={{ ["--d" as string]: "80ms" }} className="legible mt-6 max-w-[16ch] text-display font-semibold">
          {title}
        </h1>
        <p data-reveal style={{ ["--d" as string]: "160ms" }} className="legible mt-6 max-w-[48ch] text-lead text-body">
          {lead}
        </p>
      </div>
    </section>
  );
}
