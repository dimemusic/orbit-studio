"use client";

import { ArrowRight, ArrowUpRight, CheckCircle, Code, Storefront, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Case } from "@/lib/content";
import { useContent } from "../Lang";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { DeviceShot } from "../ui/DeviceShot";
import { RevealWords } from "../ui/RevealWords";

/**
 * Work: one full screen (lg+), header + 4 case cards in a row (2 on tablets, 1 on phones).
 * A card = browser-like frame with the site's full-page screenshot and a site-type pill, name, kind, a short
 * description, tags and a full-width «Переглянути» button (the whole card is the button).
 * Hover (fine pointers): the screenshot scrolls top → bottom inside the frame like a mini preview
 * (speed follows the page length), and slides back on leave. Click opens the case window.
 * Cases without a full-page shot show their cover, no scroll. Reduced motion: no scroll.
 */
/** icon + tint per info column */
const INFO = {
  niches: { Icon: Storefront, tone: "bg-[#fb7185]/12 text-[#fb7185]" },
  stack: { Icon: Code, tone: "bg-blue/12 text-blue" },
  always: { Icon: CheckCircle, tone: "bg-green/12 text-green" },
} as const;

export function Work() {
  const { WORK } = useContent();
  const CASES = WORK.cases;
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative flex w-full flex-col px-gutter pb-12 pt-24"
    >
      <header data-parallax="0.06" className="relative z-[1] flex w-full min-w-0 flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 id="work-title" className="legible text-mega font-semibold">
          <RevealWords text={WORK.title[0]} accent={WORK.title[1]} tone="amber" />
        </h2>
        <div data-boot className="mb-2">
          <a
            href="#contact"
            className="group/more inline-flex items-center gap-2 rounded-full py-2 text-base font-medium text-blue transition-colors hover:text-fg"
          >
            {WORK.more}
            <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover/more:translate-x-1" />
          </a>
        </div>
      </header>

      <ul
        aria-label={WORK.listLabel}
        className="work-grid relative z-[1] mt-12 grid w-full min-w-0 gap-6 xl:gap-8 md:grid-cols-2 xl:grid-cols-4"
      >
        {CASES.map((c, i) => (
          <li key={c.id} data-reveal style={{ "--d": `${i * 80}ms` } as CSSProperties} className="flex min-w-0">
            <CaseCard
              c={c}
              onOpen={(el) => {
                opener.current = el;
                setOpen(i);
              }}
            />
          </li>
        ))}
      </ul>

      {/* general info under the cases: niches we know, the tech we build with, what every project gets */}
      <div data-reveal style={{ "--d": "120ms" } as CSSProperties} className="relative z-[1] mt-6 w-full min-w-0 xl:mt-8">
        <div className="card grid lg:grid-cols-3">
          {WORK.info.map((b, i) => {
            const { Icon, tone } = INFO[b.id as keyof typeof INFO];
            return (
              <div key={b.id} className={`p-6 lg:p-8 ${i ? "border-t border-white/[0.08] lg:border-l lg:border-t-0" : ""}`}>
                <p className="flex items-center gap-3 text-base font-semibold text-fg">
                  <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
                    <Icon size={20} weight="light" aria-hidden="true" />
                  </span>
                  {b.title}
                </p>
                {b.id === "always" ? (
                  <ul className="mt-6 flex flex-col gap-3">
                    {b.items.map((t) => (
                      <li key={t} className="flex items-center gap-3 text-base text-body">
                        <CheckCircle size={20} weight="fill" aria-hidden="true" className="shrink-0 text-green" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {b.items.map((t) => (
                      <li key={t} className="rounded-full bg-white/[0.06] px-3 py-2 text-sm text-fg">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CaseDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

function CaseCard({ c, onOpen }: { c: Case; onOpen: (el: HTMLElement) => void }) {
  const { WORK } = useContent();
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`${WORK.open}: ${c.name}, ${c.kind}`}
      className="card work-card group/card flex h-full w-full min-w-0 flex-col overflow-hidden rounded-3xl text-left"
    >
      {/* the screenshot runs edge to edge at the top of the card: no inner frame, no browser bar (asked) */}
      {/* 16:10 frame: at rest the whole first screen; on hover the page scrolls down smoothly (asked) */}
      <span
        aria-hidden="true"
        className="work-view relative block aspect-[16/10] overflow-hidden [container-type:size] border-b border-white/[0.07] bg-bg"
      >
        {c.full ? (
          // one tall image: the sharp first screen on top, then the rest of the page; hover scrolls it, nothing swaps
          <Image
            src={c.full.src}
            alt={`${c.name}: ${c.type}`}
            width={c.full.w}
            height={c.full.h}
            quality={85}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, calc(100vw - 48px)"
            className="work-scroll absolute left-0 top-0 h-auto w-full"
            style={{ "--dur": `${Math.max(3, (c.full.h / c.full.w) * 1.6).toFixed(1)}s` } as CSSProperties}
          />
        ) : (
          <Image
            src={c.media}
            alt={`${c.name}: ${c.type}`}
            fill
            quality={85}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, calc(100vw - 48px)"
            className="object-cover object-top"
          />
        )}
      </span>

      <span className="flex flex-1 flex-col p-6">
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0">
            <span className="block text-title font-medium text-fg" translate="no">
              {c.name}
            </span>
            <span className="mt-1 block text-sm text-grey">{c.kind}</span>
          </span>
          {/* the whole card is the button; the arrow only shows it */}
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/[0.18] text-fg transition-colors duration-300 md:group-hover/card:border-[#2a6fe8] md:group-hover/card:bg-[#2a6fe8]">
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </span>
        <span className="mt-4 block text-sm text-body">{c.short}</span>
        <span className="mt-auto block pt-5">
          <span className="block border-t border-white/[0.08] pt-4">
            <span className="flex flex-wrap gap-2">
              {c.tags.map((t, k) => (
                <Tag key={t} color={k === 0 ? c.accent : undefined}>
                  {t}
                </Tag>
              ))}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

function CaseDialog({ open, onClose, returnFocus }: { open: number | null; onClose: () => void; returnFocus: React.RefObject<HTMLElement | null> }) {
  const { WORK, UI } = useContent();
  const CASES = WORK.cases;
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);
  const hide = () => {
    onClose();
    returnFocus.current?.focus({ preventScroll: true });
  };
  const c = open !== null ? CASES[open] : null;
  return (
    <dialog
      ref={dialog}
      className="case-dialog"
      aria-labelledby="case-title"
      onClose={() => open !== null && hide()}
      onClick={(e) => e.target === e.currentTarget && hide()}
    >
      {c && (
        <div className="case-panel card overflow-hidden text-left">
          <div className="relative aspect-[16/8] max-h-[42vh] w-full border-b border-white/[0.07] bg-bg">
            <DeviceShot src={c.media} color={c.color} variant="monitor" sizes="620px" />
            <button
              type="button"
              onClick={hide}
              aria-label={WORK.close}
              className="group/x absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/10 bg-[rgb(6_8_14/0.75)] text-body transition-[background-color,border-color,color] duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:text-fg"
            >
              <X size={18} aria-hidden="true" className="transition-transform duration-300 ease-[var(--ease)] group-hover/x:rotate-90" />
            </button>
          </div>
          <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 id="case-title" className="text-headline font-semibold" translate="no">
                  {c.name}
                </h3>
                <span className="text-sm text-grey">{c.kind}</span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-grey">{WORK.taskLabel}</p>
              <p className="mt-2 text-base text-body">{c.task}</p>
              <ul aria-label={UI.tags} className="mt-5 flex flex-wrap gap-2">
                {c.tags.map((t, k) => (
                  <li key={t}>
                    <Tag color={k === 0 ? c.accent : undefined}>{t}</Tag>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey">{WORK.doneLabel}</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {c.done.map((d) => (
                    <li key={d} className="flex items-center gap-3 text-base text-body">
                      <CheckCircle size={18} weight="fill" aria-hidden="true" className="shrink-0" style={{ color: c.color }} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                {c.facts.map((f) => (
                  <div key={f.label} className="rounded-xl border border-white/[0.07] px-4 py-3">
                    <dt className="text-xs text-grey">{f.label}</dt>
                    <dd className="mt-1 text-lg font-semibold tracking-[-0.02em] text-fg">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex flex-col items-center gap-4">
                <Button href="#contact" onClick={onClose} className="w-full">
                  {WORK.cta}
                </Button>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full py-1 text-base font-medium text-blue transition-colors hover:text-fg"
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
  );
}
