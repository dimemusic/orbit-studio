"use client";

import { ArrowRight, ArrowUpRight, CheckCircle, Plus, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WORK, type Case } from "@/lib/content";
import { homeNum } from "../home";
import { Eyebrow, G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { DeviceShot } from "../ui/DeviceShot";

const CASES = WORK.cases;
/** ms per screenshot on the hovered row's thumbnail */
const SHOT_MS = 900;

/** one row = [thumbnail | name + kind | what we did | arrow]; below lg the «did» items move into the text block */
const GRID =
  "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 lg:grid-cols-[auto_minmax(0,1fr)_21rem_auto] md:gap-x-[clamp(20px,2.4vw,40px)]";
/** the row's own surface: only a soft tint on hover (fine pointers); content stays inside the row, nothing bleeds out */
const ROW =
  "work-row group/row relative w-full min-w-0 py-4 text-left transition-colors duration-300 md:h-full md:rounded-2xl md:py-0 md:px-5 md:hover:bg-white/[0.03]";
/** thumbnail width: up to 280px, but never taller than the row can hold (5 rows share the screen height) */
const THUMB_W = "w-24 md:w-[min(clamp(200px,16vw,280px),17dvh)]";
/** content that mutes while another row is hovered; the hovered row keeps full strength */
const DIM = "work-dim transition-opacity duration-300";
const NAME = "block text-[clamp(26px,2.8vw,42px)] font-medium leading-tight tracking-[-0.03em] text-fg";
const KIND = "mt-1.5 block text-[14px] leading-snug text-grey";

/**
 * Work: one full screen, a table of projects. Header (eyebrow + Build-size title, link to the form on the right),
 * then 4 case rows + «your site», sharing the remaining height equally. A row is photo → name → what we did → arrow.
 * Hover (fine pointers): the row tints, the others mute, the thumbnail grows and cycles the case's screens,
 * the arrow slides and its button fills. Click opens the case window; the last row goes to #contact.
 * Hover states only exist while hovered: nothing keeps a transform / filter / will-change when settled.
 */
export function Work() {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col md:h-[100dvh]"
    >
      <header className="relative z-[1] w-full min-w-0 px-gutter pt-[clamp(88px,12vh,128px)]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Eyebrow color="green">
            <span className="tabular-nums">{homeNum("work")} · </span>
            {WORK.label}
          </Eyebrow>
          <a
            href="#contact"
            className="group/more inline-flex items-center gap-2 rounded-full py-2 text-[15px] font-medium text-blue transition-colors hover:text-fg"
          >
            {WORK.more}
            <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover/more:translate-x-1" />
          </a>
        </div>
        <h2
          id="work-title"
          className="legible mt-5 text-[clamp(44px,7.4vw,116px)] font-semibold leading-[1] tracking-[-0.05em]"
        >
          {WORK.title[0]} <G tone="aurora">{WORK.title[1]}</G>
        </h2>
      </header>

      <ul
        aria-label={WORK.listLabel}
        className="work-list group/list relative z-[1] w-full min-w-0 mt-[clamp(20px,3.5vh,40px)] flex flex-col px-gutter pb-[clamp(24px,4.5vh,48px)] md:min-h-0 md:flex-1"
      >
        {CASES.map((c, i) => (
          <li
            key={c.id}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as CSSProperties}
            className="flex min-w-0 border-t border-white/[0.09] md:min-h-0 md:flex-1"
          >
            <CaseRow
              c={c}
              onOpen={(el) => {
                opener.current = el;
                setOpen(i);
              }}
            />
          </li>
        ))}
        <li
          data-reveal
          style={{ "--d": `${CASES.length * 80}ms` } as CSSProperties}
          className="flex min-w-0 border-y border-white/[0.09] md:min-h-0 md:flex-1"
        >
          <a href="#contact" aria-label={`${WORK.next.name}. ${WORK.next.kind}`} className={`${ROW} ${GRID}`}>
            <span className={`card grid aspect-[16/10] place-items-center rounded-xl text-grey transition-colors duration-300 md:group-hover/row:text-fg ${THUMB_W}`}>
              <Plus size={28} weight="light" aria-hidden="true" />
            </span>
            <span className="min-w-0 lg:col-span-2">
              <span className="block text-[clamp(22px,2.2vw,32px)] font-medium leading-tight tracking-[-0.03em] text-grey transition-colors duration-300 md:group-hover/row:text-fg">{WORK.next.name}</span>
              <span className={KIND}>{WORK.next.kind}</span>
            </span>
            <ArrowButton />
          </a>
        </li>
      </ul>

      <CaseDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

function CaseRow({ c, onOpen }: { c: Case; onOpen: (el: HTMLElement) => void }) {
  const [hot, setHot] = useState(false);
  const mouse = (e: React.PointerEvent) => e.pointerType === "mouse";
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      onPointerEnter={(e) => mouse(e) && setHot(true)}
      onPointerLeave={(e) => mouse(e) && setHot(false)}
      aria-haspopup="dialog"
      aria-label={`${WORK.open}: ${c.name}, ${c.kind}`}
      className={`${ROW} ${GRID}`}
    >
      <Thumb c={c} hot={hot} />
      <span className={`min-w-0 ${DIM}`}>
        <span className={NAME} translate="no">
          {c.name}
        </span>
        <span className={KIND}>{c.kind}</span>
        <span className="mt-2 block text-[14px] leading-snug text-body lg:hidden">{c.did.join(" · ")}</span>
      </span>
      <ul className={`hidden min-w-0 gap-x-5 gap-y-1.5 lg:grid lg:grid-flow-col lg:grid-cols-[auto_auto] lg:grid-rows-2 lg:justify-start ${DIM}`}>
        {c.did.map((d) => (
          <li key={d} className="flex min-w-0 items-center gap-2.5 whitespace-nowrap text-[15px] leading-snug text-body">
            <span aria-hidden="true" className="size-1 shrink-0 rounded-full" style={{ background: c.color }} />
            {d}
          </li>
        ))}
      </ul>
      <ArrowButton />
    </button>
  );
}

/** 16:10 first screen of the case; while the row is hovered it grows and the case's screens crossfade every SHOT_MS */
function Thumb({ c, hot }: { c: Case; hot: boolean }) {
  const [i, setI] = useState(0);
  const n = c.shots.length;

  useEffect(() => {
    if (!hot || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setI(0);
      return;
    }
    const id = setInterval(() => setI((v) => (v + 1) % n), SHOT_MS);
    return () => clearInterval(id);
  }, [hot, n]);

  return (
    <span aria-hidden="true" className={`relative block aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.09] bg-bg ${THUMB_W} ${DIM}`}>
      <span className="absolute inset-0 transition-[scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover/row:scale-[1.04]">
        {c.shots.map((src, k) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 280px, 96px"
            className="object-cover object-top transition-opacity duration-500"
            style={{ opacity: k === i ? 1 : 0 }}
          />
        ))}
      </span>
    </span>
  );
}

/** fixed 48px round button at the row's end: it never moves, on hover it fills with the accent and only the arrow inside shifts 3px */
function ArrowButton() {
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center rounded-full border border-white/[0.18] text-fg transition-colors duration-300 md:group-hover/row:border-blue md:group-hover/row:bg-blue md:group-hover/row:text-white"
    >
      <ArrowRight size={24} weight="light" />
    </span>
  );
}

function CaseDialog({ open, onClose, returnFocus }: { open: number | null; onClose: () => void; returnFocus: React.RefObject<HTMLElement | null> }) {
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
                <Button href="#contact" onClick={onClose}>
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
