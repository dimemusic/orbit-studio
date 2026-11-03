"use client";

import type { ReactNode } from "react";
import { useContent } from "./Lang";

// emails and https links inside policy copy become links (trailing punctuation stays text)
const LINK = /(https:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINK).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part.startsWith("https") ? part : `mailto:${part}`} className="text-blue underline-offset-4 hover:underline" {...(part.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {part.replace(/^https:\/\//, "")}
      </a>
    ) : (
      part
    ),
  );
}

/** Privacy policy body: plain headings and paragraphs. */
export function Policy() {
  const { PRIVACY } = useContent();
  return (
    <section aria-label={PRIVACY.title} className="relative isolate w-full px-gutter pb-24 pt-12">
      {/* dark veil: solid behind the column, fading into the stars on every side (starts above the section, under the hero) */}
      <div aria-hidden="true" className="reading-veil absolute -top-48 -bottom-24 left-1/2 -z-10 w-[74rem] -translate-x-1/2" />
      <div data-boot className="legible mx-auto max-w-[42rem] text-base text-body">
        <p className="text-grey">{PRIVACY.updated}</p>
        {PRIVACY.sections.map((s) => (
          <div key={s.id}>
            <h2 className="mt-10 text-headline font-semibold text-fg">{s.title}</h2>
            {s.body.map((p, j) => (
              <p key={j} className="mt-3">
                {linkify(p)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
