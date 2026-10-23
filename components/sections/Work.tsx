"use client";

import { ArrowUpRight, CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { WORK, type Case } from "@/lib/content";
import { G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";

/** Work: Maina featured on top, three cases below. A click opens the case window (native <dialog>). */
export function Work() {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const show = (i: number, el: HTMLButtonElement) => {
    opener.current = el;
    setOpen(i);
  };
  const hide = () => {
    setOpen(null);
    opener.current?.focus();
  };

  const c = open !== null ? WORK.cases[open] : null;

  return (
    <HomeSection
      id="work"
      label={WORK.label}
      color="green"
      title={
        <>
          {WORK.title[0]} <G tone="aurora">{WORK.title[1]}</G>
        </>
      }
      lead={WORK.lead}
    >
      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {WORK.cases.map((item, i) => (
          <CaseCard key={item.id} c={item} i={i} onOpen={show} />
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="case-dialog"
        aria-labelledby="case-title"
        onClose={() => open !== null && hide()}
        onClick={(e) => e.target === e.currentTarget && hide()}
      >
        {c && (
          <div className="case-panel card overflow-hidden text-left">
            <div className="relative aspect-[16/7] max-h-[38vh] w-full border-b border-white/[0.07] bg-bg">
              <Image src={c.media} alt={`${c.name}: превʼю сайту`} fill sizes="960px" className="object-cover object-top" />
              <button
                type="button"
                onClick={hide}
                aria-label={WORK.close}
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-[rgb(6_8_14/0.75)] text-fg transition-colors hover:bg-[rgb(6_8_14/0.95)]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-8 p-6 sm:p-9 md:grid-cols-[1.3fr_1fr]">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 id="case-title" className="text-headline font-semibold" translate="no">
                    {c.name}
                  </h3>
                  <span className="text-[13px] text-grey">{c.kind}</span>
                </div>
                <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">{WORK.taskLabel}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-body">{c.task}</p>
                <ul aria-label="Теги" className="mt-5 flex flex-wrap gap-1.5">
                  {c.tags.map((t, k) => (
                    <li key={t}>
                      <Tag color={k === 0 ? c.accent : undefined}>{t}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">{WORK.doneLabel}</p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {c.done.map((d) => (
                      <li key={d} className="flex items-center gap-2.5 text-[15px] text-body">
                        <CheckCircle size={18} weight="fill" aria-hidden="true" className="shrink-0" style={{ color: c.color }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  {c.facts.map((f) => (
                    <div key={f.label} className="rounded-xl border border-white/[0.07] px-4 py-3">
                      <dt className="text-[12px] text-grey">{f.label}</dt>
                      <dd className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] text-fg">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-4">
                  <Button href="#contact" onClick={() => setOpen(null)}>
                    {WORK.cta}
                  </Button>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full py-1 text-[15px] font-medium text-blue transition-colors hover:text-fg"
                    >
                      {WORK.visit} <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </HomeSection>
  );
}

function CaseCard({ c, i, onOpen }: { c: Case; i: number; onOpen: (i: number, el: HTMLButtonElement) => void }) {
  const featured = i === 0;
  return (
    <li data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className={`min-w-0 ${featured ? "md:col-span-3" : ""}`}>
      <button
        type="button"
        onClick={(e) => onOpen(i, e.currentTarget)}
        aria-haspopup="dialog"
        aria-label={`${WORK.open}: ${c.name}`}
        style={{ ["--c" as string]: c.color }}
        className={`card group flex h-full w-full flex-col overflow-hidden text-left transition-[border-color] duration-500 hover:border-[color:color-mix(in_srgb,var(--c)_50%,transparent)] ${
          featured ? "md:grid md:grid-cols-[1.4fr_1fr]" : ""
        }`}
      >
        <span
          className={`relative block overflow-hidden border-white/[0.07] ${
            featured ? "aspect-[16/8] border-b md:aspect-auto md:min-h-[320px] md:border-b-0 md:border-r" : "aspect-[16/10] border-b"
          }`}
        >
          <Image
            src={c.media}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 653px, 100vw" : "(min-width: 768px) 370px, 100vw"}
            className="object-cover object-top transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[rgb(6_8_14/0.75)] px-3 py-1.5 text-[12px] font-semibold leading-none text-fg/90">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: c.color }} />
            {c.status}
          </span>
        </span>
        <span className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : "p-5"}`}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="text-[22px] font-semibold leading-tight tracking-[-0.02em]" translate="no">
              {c.name}
            </span>
            <span className="text-[12px] text-grey">{c.kind}</span>
          </span>
          <span className={`mt-2 block text-[14px] leading-snug text-body ${featured ? "" : "line-clamp-2"}`}>{c.text}</span>
          <span className="mt-auto flex items-center justify-between gap-4 pt-5">
            <span className="flex flex-wrap gap-1.5">
              {c.tags.slice(0, featured ? 3 : 2).map((t, k) => (
                <Tag key={t} color={k === 0 ? c.accent : undefined}>
                  {t}
                </Tag>
              ))}
            </span>
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-fg transition-colors duration-300 group-hover:border-transparent group-hover:bg-[color:var(--c)] group-hover:text-bg"
            >
              <ArrowUpRight size={16} />
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
