"use client";

import { ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { CTA, WORK, type Case } from "@/lib/content";
import { CASE_HOVER } from "../home";
import { G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";

// anchors for the case nodes in the particle network (IvyScene snaps each one to the nearest ivy particle);
// they sit in the side margins, alternating left / right, at these heights of the section
const NODE_AT = ["22%", "38%", "56%", "72%"];

const hover = (i: number | null) => window.dispatchEvent(new CustomEvent(CASE_HOVER, { detail: i }));

/** 02: the most important section. Four cases + a closing tile, all in the same card system. */
export function Work() {
  return (
    <HomeSection
      id="work"
      label={WORK.label}
      color="green"
      title={
        <>
          <span className="text-[0.88em]">
            {WORK.title[0]} <G tone="aurora">{WORK.title[1]}</G>
          </span>
        </>
      }
      lead={WORK.lead}
    >
      {NODE_AT.map((top, i) => (
        <span
          key={top}
          aria-hidden="true"
          data-case-node={i}
          className={`pointer-events-none absolute hidden size-px xl:block ${
            i % 2 ? "right-[calc((100%-1120px)/4)]" : "left-[calc((100%-1120px)/4)]"
          }`}
          style={{ top }}
        />
      ))}

      <ul data-work-grid className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {WORK.cases.map((c, i) => (
          <CaseCard key={c.id} c={c} i={i} />
        ))}
        <li data-reveal style={{ ["--d" as string]: "200ms" }} className="md:col-span-3">
          <div className="card flex flex-col items-center gap-4 px-6 py-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
            <div className="flex items-center gap-5">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full border border-dashed border-white/25 text-fg/80">
                <Plus size={22} weight="light" />
              </span>
              <div>
                <h3 className="text-title font-semibold">{WORK.closing.title}</h3>
                <p className="mt-1 text-[15px] text-body">{WORK.closing.text}</p>
              </div>
            </div>
            <Button href="#contact" className="shrink-0">
              {CTA.primary}
            </Button>
          </div>
        </li>
      </ul>

      {/* hint only where the case nodes exist: fine pointer + wide margins */}
      <p className="legible mt-8 hidden text-[14px] text-body xl:[@media(hover:hover)_and_(pointer:fine)]:block">{WORK.nodeHint}</p>
    </HomeSection>
  );
}

function CaseCard({ c, i }: { c: Case; i: number }) {
  const featured = i === 0;
  return (
    <li data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className={`min-w-0 ${featured ? "md:col-span-3" : ""}`}>
      <article
        data-case-card={i}
        onPointerEnter={() => hover(i)}
        onPointerLeave={() => hover(null)}
        onFocus={() => hover(i)}
        onBlur={() => hover(null)}
        style={{ ["--c" as string]: c.color }}
        className={`card group flex h-full flex-col overflow-hidden text-left transition-[border-color] duration-500 data-[hot]:border-[color:color-mix(in_srgb,var(--c)_55%,transparent)] ${
          featured ? "md:grid md:grid-cols-[1.4fr_1fr]" : ""
        }`}
      >
        <CasePreview c={c} featured={featured} />
        <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : "p-5"}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]" translate="no">
              {c.name}
            </h3>
            <span className="text-[12px] text-grey">{c.kind}</span>
          </div>
          <p className={`mt-2 text-[14px] leading-snug text-body ${featured ? "" : "line-clamp-2"}`}>{c.text}</p>
          <ul aria-label="Теги" className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.map((t, k) => (
              <li key={t}>
                <Tag color={k === 0 ? c.accent : undefined}>{t}</Tag>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4" />
          <div className="flex items-end justify-between gap-4 border-t border-white/[0.07] pt-3">
            {featured && (
              <p>
                <span className="block text-[12px] text-grey">Результат</span>
                <span className="mt-0.5 block text-[18px] font-semibold tracking-[-0.02em] text-fg">{c.result}</span>
              </p>
            )}
            {c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
              >
                Відкрити сайт <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ) : (
              <a
                href="#contact"
                aria-label={`${WORK.cta}: ${c.name}`}
                className="group/l inline-flex items-center gap-1 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
              >
                {WORK.cta}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover/l:translate-x-0.5">
                  →
                </span>
              </a>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

/** Real screenshot from public/cases when there is one; otherwise a placeholder browser window in the case colour. */
function CasePreview({ c, featured }: { c: Case; featured: boolean }) {
  return (
    <div
      className={`relative overflow-hidden border-white/[0.07] [background:radial-gradient(80%_90%_at_50%_100%,color-mix(in_srgb,var(--c)_22%,transparent),transparent_70%)] ${
        featured ? "aspect-[16/7] border-b md:border-b-0 md:border-r" : "aspect-[16/10] border-b"
      }`}
    >
      {c.media ? (
        <Image
          src={c.media}
          alt={`${c.name}: превʼю сайту`}
          fill
          sizes={featured ? "(min-width: 768px) 653px, 100vw" : "(min-width: 768px) 370px, 100vw"}
          className="object-cover object-top transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-x-[8%] bottom-0 top-[14%] translate-y-3 rounded-t-xl border border-b-0 border-white/10 bg-[rgb(6_8_14/0.7)] transition-transform duration-700 ease-[var(--ease)] group-hover:translate-y-0 motion-reduce:transition-none"
        >
          <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.07] px-3">
            <i className="size-2 rounded-full bg-white/15" />
            <i className="size-2 rounded-full bg-white/15" />
            <i className="size-2 rounded-full bg-white/15" />
          </div>
          <div className="flex h-[calc(100%-2rem)] flex-col items-center justify-center gap-3 px-6 text-center">
            <span
              translate="no"
              className="text-[clamp(24px,3vw,40px)] font-semibold leading-none tracking-[-0.045em] text-fg transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
            >
              {c.name}
            </span>
            <span className="h-1.5 w-1/3 rounded-full bg-white/[0.08]" />
            <span className="h-1.5 w-1/4 rounded-full bg-white/[0.06]" />
            <span className="mt-1 h-6 w-20 rounded-full" style={{ background: "color-mix(in srgb, var(--c) 30%, transparent)" }} />
          </div>
        </div>
      )}
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[rgb(6_8_14/0.7)] px-3 py-1.5 text-[12px] font-semibold leading-none text-fg/85">
        <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: c.color }} />
        {c.status}
      </span>
    </div>
  );
}
