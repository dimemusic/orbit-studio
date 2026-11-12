"use client";

import { useContent } from "./Lang";
import { G } from "./ui/Bits";
import { Button } from "./ui/Button";

/** 404: one screen in the site's own frame (nav, stars, footer) with a way back; copy in NOT_FOUND */
export function NotFoundPage() {
  const { CTA, NOT_FOUND } = useContent();
  return (
    <section aria-labelledby="page-title" className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-gutter pb-24 pt-36 text-center">
      <div className="plate flex flex-col items-center px-4 py-6">
        <h1 id="page-title" data-reveal className="legible text-mega font-semibold">
          {NOT_FOUND.title[0]} <G tone="violet">{NOT_FOUND.title[1]}</G>
        </h1>
        <p data-reveal style={{ ["--d" as string]: "80ms" }} className="legible mt-6 max-w-[32rem] text-lead text-body">
          {NOT_FOUND.lead}
        </p>
      </div>
      <div data-reveal style={{ ["--d" as string]: "160ms" }} className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button href={CTA.home} className="w-full sm:w-64">
          {NOT_FOUND.home}
        </Button>
        <Button href={CTA.primaryHref} variant="secondary" className="w-full sm:w-64">
          {CTA.primary}
        </Button>
      </div>
    </section>
  );
}
