"use client";

import { ArrowUpRight, CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { WORK, type Case } from "@/lib/content";
import { homeNum } from "../home";
import { Eyebrow, G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { DeviceShot } from "../ui/DeviceShot";

const CASES = WORK.cases;
const N = CASES.length;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Work, right after the hero:
 * 1) an endless marquee of project names (click a name → jumps to its slide),
 * 2) desktop: a pinned horizontal showcase — the page sticks and vertical scroll slides the projects in
 *    from the right, each with a little parallax between its title and its device;
 *    phones: a native swipe carousel with snap.
 * Every slide opens the case window (native <dialog>).
 */
export function Work() {
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // scroll-linked horizontal track (desktop only; the pinned block is display:none on phones)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const p0 = pin.current;
      const t = track.current;
      if (!p0 || !t || p0.offsetParent === null) return;
      const total = p0.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -p0.getBoundingClientRect().top / total));
      // one step = slide width + gap, so every scroll stop lands a slide exactly at the left gutter
      const kids = Array.from(t.children) as HTMLElement[];
      const step = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : 0;
      t.style.transform = `translate3d(${(-p * (N - 1) * step).toFixed(1)}px, 0, 0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      // per-slide offset from its resting place, in steps (0 = in place, 1 = next in line) drives the parallax
      const rest = kids[0] ? kids[0].offsetLeft : 0;
      for (const el of kids) {
        const left = el.getBoundingClientRect().left;
        const o = step ? Math.max(-1, Math.min(1, (left - rest) / step)) : 0;
        el.style.setProperty("--o", o.toFixed(3));
      }
      setActive(Math.round(p * (N - 1)));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
    };
  }, []);

  /** marquee name → its slide (desktop: scroll position inside the pin; phones: the carousel) */
  const goTo = (i: number) => {
    const p0 = pin.current;
    if (p0 && p0.offsetParent !== null) {
      const total = p0.offsetHeight - window.innerHeight;
      const top = p0.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (total * i) / (N - 1), behavior: "smooth" });
    } else {
      document.getElementById(`case-m-${i}`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const show = (i: number, el: HTMLElement) => {
    opener.current = el;
    setOpen(i);
  };

  const header = (
    <div className="plate flex flex-col items-start">
      <Eyebrow color="green">
        <span className="tabular-nums">{homeNum("work")} · </span>
        {WORK.label}
      </Eyebrow>
      <h2 id="work-title" className="legible mt-4 text-[clamp(32px,3.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.045em]">
        {WORK.title[0]} <G tone="aurora">{WORK.title[1]}</G>
      </h2>
    </div>
  );

  return (
    <section id="work" aria-labelledby="work-title" className="relative w-full">
      <Marquee onPick={goTo} />

      {/* desktop: pinned horizontal showcase */}
      <div ref={pin} className="relative hidden md:block" style={{ height: `${N * 90 + 30}vh` }}>
        <div className="sticky top-0 flex h-[100dvh] flex-col justify-center gap-[clamp(20px,3.5vh,40px)] overflow-hidden pt-20">
          <div className="flex items-end justify-between gap-8 px-gutter">
            {header}
            <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
              <p className="text-[15px] tabular-nums text-body" aria-live="polite">
                <span className="text-fg">{pad(active + 1)}</span> / {pad(N)}
              </p>
              <span aria-hidden="true" className="block h-px w-40 bg-white/15">
                <span ref={bar} className="block h-full origin-left bg-gradient-to-r from-[#5aa2ff] to-violet" style={{ transform: "scaleX(0)" }} />
              </span>
            </div>
          </div>
          <div ref={track} className="flex w-max gap-[3vw] px-gutter will-change-transform">
            {CASES.map((c, i) => (
              <Slide key={c.id} c={c} i={i} onOpen={show} className="h-[min(62vh,600px)] w-[min(1180px,78vw)]" />
            ))}
          </div>
        </div>
      </div>

      {/* phones: swipe carousel */}
      <div className="py-16 md:hidden">
        <div className="px-gutter">{header}</div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-4 [scrollbar-width:none]">
          {CASES.map((c, i) => (
            <Slide key={c.id} id={`case-m-${i}`} c={c} i={i} onOpen={show} className="w-[86vw] shrink-0 snap-center" />
          ))}
        </div>
      </div>

      <CaseDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

/** Endless strip of project names: filled and outlined in turn, a coloured dot between. Pauses on hover. */
function Marquee({ onPick }: { onPick: (i: number) => void }) {
  const row = (copy: number) =>
    CASES.map((c, i) => (
      <li key={`${copy}-${c.id}`} className="flex shrink-0 items-center gap-[clamp(24px,3vw,48px)] pr-[clamp(24px,3vw,48px)]">
        <button
          type="button"
          tabIndex={copy ? -1 : 0}
          aria-hidden={copy ? true : undefined}
          onClick={() => onPick(i)}
          translate="no"
          className={`whitespace-nowrap text-[clamp(44px,7vw,120px)] font-semibold leading-none tracking-[-0.05em] transition-colors duration-300 ${
            i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_rgb(245_247_250/0.45)] hover:[-webkit-text-stroke-color:var(--fg)]" : "text-fg/90 hover:text-fg"
          }`}
        >
          {c.name}
        </button>
        <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: c.color }} />
      </li>
    ));
  return (
    <div className="group/mq relative overflow-hidden border-y border-white/[0.07] py-[clamp(20px,3vw,40px)]">
      <ul aria-label="Наші проєкти" className="marquee-track flex w-max">
        {row(0)}
        {row(1)}
      </ul>
    </div>
  );
}

function Slide({
  c,
  i,
  onOpen,
  className = "",
  id,
}: {
  c: Case;
  i: number;
  onOpen: (i: number, el: HTMLElement) => void;
  className?: string;
  id?: string;
}) {
  return (
    <article id={id} style={{ ["--c" as string]: c.color }} className={`case-slide card group grid overflow-hidden text-left md:grid-cols-[1fr_1.3fr] ${className}`}>
      <div className="slide-text order-2 flex flex-col p-6 sm:p-8 md:order-1 lg:p-12">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[14px] tabular-nums text-grey">
            {pad(i + 1)} / {pad(N)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-semibold leading-none text-fg/90">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: c.color }} />
            {c.status}
          </span>
        </div>
        <h3 className="mt-6 text-[clamp(34px,4.4vw,76px)] font-semibold leading-[0.95] tracking-[-0.05em] md:mt-auto" translate="no">
          {c.name}
        </h3>
        <p className="mt-3 text-[14px] text-grey">{c.kind}</p>
        <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-body">{c.text}</p>
        <ul aria-label="Теги" className="mt-5 flex flex-wrap gap-1.5">
          {c.tags.map((t, k) => (
            <li key={t}>
              <Tag color={k === 0 ? c.accent : undefined}>{t}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-5 md:mt-auto md:pt-8">
          <Button variant="secondary" size="nav" aria-haspopup="dialog" onClick={(e) => onOpen(i, e.currentTarget)}>
            {WORK.open}
          </Button>
          <a href="#contact" className="group/l inline-flex items-center gap-1 rounded-full py-1 text-[15px] font-medium text-blue transition-colors hover:text-fg">
            {WORK.cta}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover/l:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => onOpen(i, e.currentTarget)}
        aria-haspopup="dialog"
        aria-label={`${WORK.open}: ${c.name}`}
        className="slide-media relative order-1 block aspect-[16/11] overflow-hidden border-b border-white/[0.07] md:order-2 md:aspect-auto md:border-b-0 md:border-l"
      >
        <DeviceShot src={c.media} color={c.color} variant={i === 0 ? "monitor" : "laptop"} sizes="(min-width: 768px) 640px, 86vw" />
      </button>
    </article>
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
