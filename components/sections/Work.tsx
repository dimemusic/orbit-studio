"use client";

import { ArrowRight, ArrowUpRight, Buildings, CheckCircle, IdentificationCard, Rocket, ShoppingBag, X } from "@phosphor-icons/react/dist/ssr";
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
 * A card = browser-like frame with the site's full-page screenshot, name, kind, one line, tags, arrow.
 * Hover (fine pointers): the screenshot scrolls top → bottom inside the frame like a mini preview
 * (speed follows the page length), and slides back on leave. Click opens the case window.
 * Cases without a full-page shot show their cover, no scroll. Reduced motion: no scroll.
 */
const KIND_ICON = { landing: Rocket, shop: ShoppingBag, card: IdentificationCard, corp: Buildings };

export function Work() {
  const { WORK } = useContent();
  const CASES = WORK.cases;
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col justify-center px-gutter pb-[clamp(24px,4.5vh,48px)] pt-[clamp(88px,12vh,128px)] lg:h-[100dvh]"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 id="work-title" className="legible text-mega font-semibold">
          <RevealWords text={WORK.title[0]} accent={WORK.title[1]} tone="amber" />
        </h2>
        <a
          href="#contact"
          className="group/more mb-[0.4em] inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-blue transition-colors hover:text-fg"
        >
          {WORK.more}
          <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover/more:translate-x-1" />
        </a>
      </header>

      <ul
        aria-label={WORK.listLabel}
        className="work-grid relative z-[1] mt-[clamp(24px,4.5vh,48px)] grid w-full min-w-0 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-4"
      >
        {CASES.map((c, i) => (
          <li key={c.id} data-reveal style={{ "--d": `${i * 80}ms` } as CSSProperties} className="min-w-0">
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

      {/* the kinds of sites we make: four columns on hairlines, no cards */}
      <div className="relative z-[1] mt-[clamp(20px,3.5vh,48px)] w-full min-w-0 border-t border-white/[0.09] pt-[clamp(16px,2.5vh,28px)]">
        <h3 data-reveal className="legible text-[15px] font-medium text-grey">
          {WORK.kinds.title}
        </h3>
        <ul className="mt-[clamp(12px,2vh,20px)] grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {WORK.kinds.items.map((k, i) => {
            const Ic = KIND_ICON[k.icon];
            return (
              <li key={k.name} data-reveal style={{ "--d": `${i * 70}ms` } as CSSProperties} className="flex min-w-0 gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Ic size={22} weight="light" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[18px] font-medium tracking-[-0.02em] text-fg">{k.name}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-body">{k.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <CaseDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

function CaseCard({ c, onOpen }: { c: Case; onOpen: (el: HTMLElement) => void }) {
  const { WORK } = useContent();
  // ~1.3s of scroll per screen-width of page length, never under 2.5s
  const dur = c.full ? Math.max(2.5, (c.full.h / c.full.w) * 1.3) : 0;
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`${WORK.open}: ${c.name}, ${c.kind}`}
      className="work-card group/card block w-full min-w-0 text-left"
    >
      <span
        aria-hidden="true"
        className="work-frame relative block overflow-hidden rounded-2xl border border-white/[0.09] bg-bg transition-colors duration-300 md:group-hover/card:border-white/25"
      >
        {/* browser bar */}
        <span className="relative z-[1] flex h-7 items-center gap-1.5 border-b border-white/[0.07] bg-[#0b0e15] px-3">
          {[0, 1, 2].map((k) => (
            <span key={k} className="size-2 rounded-full bg-white/15" />
          ))}
        </span>
        <span className="work-view relative block overflow-hidden">
          {c.full ? (
            <Image
              src={c.full.src}
              alt=""
              width={c.full.w}
              height={c.full.h}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="work-scroll absolute left-0 top-0 h-auto w-full"
              style={{ "--dur": `${dur.toFixed(1)}s` } as CSSProperties}
            />
          ) : (
            <Image src={c.media} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover object-top" />
          )}
        </span>
      </span>

      <span className="mt-5 flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-[clamp(22px,1.8vw,28px)] font-medium leading-tight tracking-[-0.03em] text-fg" translate="no">
            {c.name}
          </span>
          <span className="mt-1 block text-[14px] text-grey">{c.kind}</span>
        </span>
        <ArrowButton />
      </span>
      {/* on short desktop screens the one-liner gives way so the kinds strip fits the snap screen */}
      <span className="mt-3 block text-[15px] leading-snug text-body lg:hidden lg:[@media(min-height:62rem)]:block">{c.text}</span>
      <span className="mt-4 flex flex-wrap gap-1.5">
        {c.tags.map((t, k) => (
          <Tag key={t} color={k === 0 ? c.accent : undefined}>
            {t}
          </Tag>
        ))}
      </span>
    </button>
  );
}

/** 44px round button: on card hover it fills with the accent, only the arrow inside shifts */
function ArrowButton() {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full border border-white/[0.18] text-fg transition-colors duration-300 md:group-hover/card:border-blue md:group-hover/card:bg-blue md:group-hover/card:text-white"
    >
      <ArrowUpRight size={20} weight="light" />
    </span>
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
              <ul aria-label={UI.tags} className="mt-5 flex flex-wrap gap-1.5">
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
              <div className="mt-auto flex flex-col items-center gap-4">
                <Button href="#contact" onClick={onClose} className="w-full">
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
  );
}
