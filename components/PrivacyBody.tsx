"use client";

import { useContent } from "./Lang";

/**
 * Privacy policy text under the PageHero: one readable column in a `.card`.
 * Copy lives in PRIVACY.sections (content files); a section with an empty `h` continues the one before it.
 */
export function PrivacyBody() {
  const { PRIVACY, BRAND } = useContent();
  // the studio email inside the copy becomes a mailto link
  const rich = (t: string) =>
    t.split(BRAND.email).flatMap((part, k) =>
      k === 0
        ? [part]
        : [
            <a key={k} href={`mailto:${BRAND.email}`} className="text-fg underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
              {BRAND.email}
            </a>,
            part,
          ],
    );
  return (
    <section aria-label={PRIVACY.title} className="flex w-full justify-center px-gutter pb-24 pt-6">
      <div data-reveal style={{ ["--d" as string]: "240ms" }} className="card w-full max-w-[46rem] p-[clamp(24px,4vw,48px)] text-left">
        <p className="text-[14px] text-grey">{PRIVACY.updated}</p>
        {PRIVACY.sections.map((s, i) => (
          <div key={i} className={s.h ? "mt-9" : "mt-3"}>
            {s.h && <h2 className="text-title font-semibold text-fg">{s.h}</h2>}
            {s.p.map((t, j) => (
              <p key={j} className="mt-3 text-[16px] leading-relaxed text-body">
                {rich(t)}
              </p>
            ))}
            {s.li.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {s.li.map((t, j) => (
                  <li key={j} className="flex gap-3 text-[16px] leading-relaxed text-body">
                    <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-blue" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
