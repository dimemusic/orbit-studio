"use client";

import { ChatCircleText, CheckCircle, Cookie, Prohibit, ShieldCheck, Trash } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useContent } from "./Lang";
import { ACCENT, type Accent } from "./ui/accent";
import { Button } from "./ui/Button";

type Icon = ComponentType<{ size?: number; weight?: "light" | "regular" | "fill"; className?: string }>;

/** the four promises on top, in the order of PRIVACY.summary */
const SUMMARY: { icon: Icon; a: Accent }[] = [
  { icon: ChatCircleText, a: "blue" },
  { icon: Cookie, a: "green" },
  { icon: Prohibit, a: "violet" },
  { icon: Trash, a: "cyan" },
];
/** «what data» rows: from the form / automatically / never */
const DATA_TONE = ["bg-green/12 text-green", "bg-blue/12 text-blue", "bg-white/[0.06] text-grey line-through decoration-white/30"];

const hair = "border-white/[0.08]";

/**
 * Privacy policy under the PageHero, laid out as a document: a sticky table of contents on the left (the section in
 * view is highlighted), one reading column on the right with sections divided by hairlines. Facts are shown as
 * structure, not prose: key / value rows, pills, a table of services, a grid of rights. Copy: PRIVACY (content files).
 */
export function PrivacyBody() {
  const { PRIVACY: P, BRAND } = useContent();

  const sections: { id: string; h: string; body: ReactNode }[] = [
    { id: "who", h: P.who.h, body: <Rows rows={P.who.rows} email={BRAND.email} /> },
    {
      id: "data",
      h: P.data.h,
      body: (
        <>
          <div className={`divide-y divide-white/[0.08] border-y ${hair}`}>
            {P.data.rows.map((r, i) => (
              <div key={r.k} className="grid gap-3 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
                <p className="text-[15px] font-semibold text-fg">{r.k}</p>
                <ul className="flex flex-wrap gap-2">
                  {r.items.map((t) => (
                    <li key={t} className={`rounded-full px-3 py-1.5 text-[14px] ${DATA_TONE[i]}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Note>{P.data.note}</Note>
        </>
      ),
    },
    {
      id: "purpose",
      h: P.purpose.h,
      body: (
        <>
          <ul className="flex flex-col gap-4">
            {P.purpose.items.map((t) => (
              <li key={t} className="flex gap-3 text-[17px] leading-relaxed text-fg">
                <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-green" />
                {t}
              </li>
            ))}
          </ul>
          <Note>{P.purpose.note}</Note>
        </>
      ),
    },
    {
      id: "basis",
      h: P.basis.h,
      body: (
        <>
          <p className="text-[16px] leading-relaxed text-body">{P.basis.intro}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {P.basis.items.map((it) => (
              <li key={it.t} className={`rounded-2xl border ${hair} p-5`}>
                <p className="text-[16px] font-semibold text-fg">{it.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-body">{it.d}</p>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "share",
      h: P.share.h,
      body: (
        <>
          <div className={`overflow-hidden rounded-2xl border ${hair}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${hair} text-[13px] text-grey`}>
                  {P.share.cols.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-medium sm:px-5">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {P.share.rows.map((r) => (
                  <tr key={r[0]} className="text-[15px]">
                    <th scope="row" className="px-4 py-4 align-top font-semibold text-fg sm:px-5">
                      {r[0]}
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-body sm:px-5">{r[1]}</td>
                    <td className="px-4 py-4 align-top text-body sm:px-5">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>{P.share.note}</Note>
        </>
      ),
    },
    {
      id: "cookies",
      h: P.cookies.h,
      body: (
        <div className={`flex gap-4 rounded-2xl border ${hair} p-6`}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green/12 text-green">
            <Cookie size={22} weight="light" />
          </span>
          <div>
            <p className="text-[17px] font-semibold text-fg">{P.cookies.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-body">{P.cookies.text}</p>
          </div>
        </div>
      ),
    },
    { id: "retention", h: P.retention.h, body: <Rows rows={P.retention.rows} email={BRAND.email} /> },
    {
      id: "rights",
      h: P.rights.h,
      body: (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {P.rights.items.map((t) => (
              <li key={t} className={`flex gap-3 rounded-2xl border ${hair} p-4 text-[15px] leading-relaxed text-fg`}>
                <ShieldCheck size={20} weight="light" className="mt-0.5 shrink-0 text-blue" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.03] px-6 py-5">
            <p className="text-[16px] text-body">
              {P.rights.how} <span className="text-fg">{BRAND.email}</span>
            </p>
            <Button variant="secondary" size="nav" href={`mailto:${BRAND.email}`}>
              {P.rights.cta}
            </Button>
          </div>
        </>
      ),
    },
    ...P.more.map((m, i) => ({
      id: `more-${i}`,
      h: m.h,
      body: <p className="max-w-[62ch] text-[16px] leading-relaxed text-body">{m.text}</p>,
    })),
  ];

  // table of contents: highlight the section in the reading zone
  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // the section ids are fixed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-label={P.title} className="w-full px-gutter pb-28 pt-6">
      <div className="mx-auto grid w-full max-w-[74rem] gap-x-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
        {/* contents (desktop) */}
        <nav aria-label={P.toc} className="hidden lg:block">
          <div className="sticky top-32">
            <p className="text-[13px] font-semibold text-grey">{P.toc}</p>
            <ol className={`mt-4 border-l ${hair}`}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "true" : undefined}
                    className={`-ml-px block border-l py-2 pl-4 text-[14px] transition-colors ${
                      active === s.id ? "border-blue text-fg" : "border-transparent text-grey hover:text-body"
                    }`}
                  >
                    {s.h}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 max-w-[52rem]">
          {/* key promises */}
          <ul data-reveal style={{ ["--d" as string]: "220ms" }} className="card grid grid-cols-2 md:grid-cols-4">
            {P.summary.map((it, i) => {
              const { icon: I, a } = SUMMARY[i];
              const c = ACCENT[a];
              return (
                <li
                  key={it.t}
                  className={`flex flex-col gap-3 p-5 sm:p-6 ${i % 2 ? `border-l ${hair}` : ""} ${i > 1 ? `border-t md:border-t-0 ${hair}` : ""} ${i === 2 ? `md:border-l` : ""}`}
                >
                  <span className={`grid size-10 place-items-center rounded-xl ${c.tint} ${c.text}`}>
                    <I size={20} weight="light" />
                  </span>
                  <span>
                    <span className="block text-[16px] font-semibold text-fg">{it.t}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-grey">{it.d}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-[14px] text-grey">{P.updated}</p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={`scroll-mt-32 border-t ${hair} pt-12 first-of-type:mt-10 [&+&]:mt-12`}>
              <h2 id={`${s.id}-h`} className="mb-6 text-[clamp(24px,2.2vw,30px)] font-semibold tracking-[-0.02em] text-fg">
                {s.h}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

/** key / value rows on hairlines; the studio email becomes a link, [placeholders] stay grey */
function Rows({ rows, email }: { rows: { k: string; v: string }[]; email: string }) {
  return (
    <dl className={`divide-y divide-white/[0.08] border-y ${hair}`}>
      {rows.map((r) => (
        <div key={r.k} className="grid gap-1 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
          <dt className="text-[15px] text-grey">{r.k}</dt>
          <dd className={`text-[16px] leading-relaxed ${r.v.startsWith("[") ? "text-grey" : "text-fg"}`}>
            {r.v === email ? (
              <a href={`mailto:${email}`} className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
                {email}
              </a>
            ) : (
              r.v
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-grey">{children}</p>;
}
