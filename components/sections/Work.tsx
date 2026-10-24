"use client";

import { ArrowUpRight, CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WORK, type Case } from "@/lib/content";
import { homeNum } from "../home";
import { Eyebrow, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { DeviceShot } from "../ui/DeviceShot";
import { expo, seg } from "../process/util";

const CASES = WORK.cases;
const N = CASES.length;
const pad = (n: number) => String(n).padStart(2, "0");
/** seconds each case stays before the next one comes in (desktop, in view, not hovered) */
const DWELL = 5;
/** seconds of the device swap: the old one whips out left, the new one flies in from the right */
const SWAP = 0.9;
/** seconds per screenshot while a case with several shots is active */
const SHOT_SEC = 1.4;
/** seconds a single tall screenshot takes to scroll from top to bottom */
const SCROLL_SEC = 5;

/** list item: phones = swipe card; md+ = one equal share of the column height, and a size container for META */
const LI =
  "w-[78vw] max-w-[360px] shrink-0 snap-center md:flex md:min-h-0 md:w-auto md:max-w-none md:flex-1 md:[container-type:size]";
/** the bottom meta line of a row (kind + tags / CTA): dropped when the row is too short to hold it (short laptop screens) */
const META = "flex md:[@container(max-height:7.25rem)]:hidden";

/** motion blur for the device swap; settled layers get no transform / filter / will-change (sharpness rule) */
const out = (k: number): CSSProperties => ({
  transform: `translate(${(-k * 160).toFixed(1)}px, 0) scale(${(1 - k * 0.04).toFixed(4)})`,
  filter: `blur(${(k * 14).toFixed(2)}px)`,
  opacity: 1 - k,
  willChange: "transform, filter, opacity",
});
const inn = (k: number): CSSProperties =>
  k >= 1
    ? {}
    : {
        transform: `translate(${((1 - k) * 200).toFixed(1)}px, 0) scale(${(1 - (1 - k) * 0.04).toFixed(4)})`,
        filter: `blur(${((1 - k) * 14).toFixed(2)}px)`,
        opacity: Math.min(1, k * 1.6),
        willChange: "transform, filter, opacity",
      };

/**
 * Work: one full screen, in the language of Build. Centred eyebrow + big title, then one composition:
 * the active case on a laptop (left ≈60%, opens the case window) and the list of cases + «your site» (right ≈40%).
 * Desktop: cases advance by themselves every DWELL s while the section is in view (paused off screen, on list hover
 * and while the case window is open); the active row's bar shows the time left. Phones: case on top, the rows swipe
 * sideways with snap, no autoplay. Reduced motion: no autoplay, no swap animation.
 */
export function Work() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [swap, setSwap] = useState<{ from: number; n: number } | null>(null);
  const [k, setK] = useState(1);
  const [auto, setAuto] = useState(false);
  /** off screen or reduced motion: the laptop shows the first shot, still */
  const [still, setStill] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cur = useRef(0);
  const elapsed = useRef(0);
  const hover = useRef(false);
  const dialogOpen = useRef(false);
  dialogOpen.current = open !== null;

  const go = (i: number) => {
    elapsed.current = 0;
    if (i === cur.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      // k resets in the same render as the swap starts, so the new case never flashes in settled for a frame
      setK(0);
      setSwap((s) => ({ from: cur.current, n: (s?.n ?? 0) + 1 }));
    }
    cur.current = i;
    setActive(i);
  };

  // the swap tween
  useEffect(() => {
    if (!swap) return;
    let raf = 0;
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const v = Math.min(1, (now - t0) / 1000 / SWAP);
      setK(v);
      if (v < 1) raf = requestAnimationFrame(step);
      else setSwap(null);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [swap]);

  // autoplay: desktop + motion allowed, only while ≥45% in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desk = window.matchMedia("(min-width: 48rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let vis = false;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (!hover.current && !dialogOpen.current) {
        elapsed.current += dt;
        if (elapsed.current >= DWELL) go((cur.current + 1) % N);
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, elapsed.current / DWELL).toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      const on = desk.matches && !reduced.matches;
      setAuto(on);
      // screens start only once the section is on screen, so the first case doesn't play its scroll unseen
      setStill(reduced.matches || !vis);
      if (on && vis) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        vis = e.isIntersecting;
        sync();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    desk.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      io.disconnect();
      desk.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      cancelAnimationFrame(raf);
    };
    // go only touches refs and stable setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = (i: number, el: HTMLElement) => {
    opener.current = el;
    setOpen(i);
  };

  const c = CASES[active];
  const kOut = swap ? expo(seg(k, 0, 0.5)) : 1;
  const kIn = swap ? expo(seg(k, 0.2, 1)) : 1;

  return (
    <section
      ref={ref}
      id="work"
      aria-labelledby="work-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col md:h-[100dvh]"
    >
      <header className="relative z-[1] flex flex-col items-center px-gutter pt-[clamp(88px,12vh,128px)] text-center">
        <Eyebrow color="green">
          <span className="tabular-nums">{homeNum("work")} · </span>
          {WORK.label}
        </Eyebrow>
        <h2
          id="work-title"
          className="legible mt-5 text-[clamp(44px,7.4vw,116px)] font-semibold leading-[1] tracking-[-0.05em]"
        >
          {WORK.title[0]}{" "}
          <span className="transition-colors duration-700" style={{ color: c.color }}>
            {WORK.title[1]}
          </span>
        </h2>
      </header>

      <div className="relative z-[1] grid grid-cols-[minmax(0,1fr)] gap-4 px-gutter pb-[clamp(24px,5vh,56px)] pt-[clamp(24px,4.5vh,48px)] md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-[clamp(16px,2vw,28px)]">
        {/* active case on a laptop: click opens the case window */}
        <div data-tilt-inner className="card group relative aspect-[16/11] overflow-hidden md:aspect-auto md:min-h-0">
          <button
            type="button"
            onClick={(e) => show(active, e.currentTarget)}
            aria-haspopup="dialog"
            aria-label={`${WORK.open}: ${c.name}`}
            className="absolute inset-0 block rounded-[inherit]"
          >
            {swap && swap.from !== active && (
              <span key={`o${swap.n}`} className="absolute inset-0" style={out(kOut)}>
                <Shot c={CASES[swap.from]} live={false} />
              </span>
            )}
            <span key={c.id} className="absolute inset-0" style={swap ? inn(kIn) : undefined}>
              <Shot c={c} live={!still} />
            </span>
          </button>
        </div>

        {/* the list: phones swipe it sideways, desktop stacks it to the laptop's height */}
        <ul
          aria-label={WORK.listLabel}
          onPointerEnter={() => (hover.current = true)}
          onPointerLeave={() => (hover.current = false)}
          className="mx-[calc(var(--gutter)*-1)] flex min-w-0 snap-x snap-mandatory gap-2.5 overflow-x-auto md:gap-2 px-gutter pb-1 [scrollbar-width:none] md:mx-0 md:min-h-0 md:snap-none md:flex-col md:overflow-visible md:p-0"
        >
          {CASES.map((cs, i) => (
            <li key={cs.id} className={LI}>
              <Row c={cs} i={i} on={i === active} auto={auto} bar={i === active ? bar : undefined} onPick={() => go(i)} />
            </li>
          ))}
          <li className={LI}>
            <a
              href="#contact"
              className="card group/n flex h-full w-full flex-col justify-center gap-1.5 overflow-hidden px-5 py-3 text-left"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[clamp(18px,1.5vw,22px)] font-semibold tracking-[-0.03em] text-fg">{WORK.next.name}</span>
                <span className="shrink-0 text-[13px] text-grey">{WORK.next.kind}</span>
              </span>
              <span className="line-clamp-2 text-[14px] leading-snug text-body">{WORK.next.text}</span>
              <span className={`${META} items-center gap-1 text-[14px] font-medium text-blue transition-colors group-hover/n:text-fg`}>
                {WORK.next.cta}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover/n:translate-x-0.5">
                  →
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>

      <CaseDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

/** case media on a laptop; neutral placeholder when the case has no screenshot yet */
function Shot({ c, live }: { c: Case; live: boolean }) {
  const sizes = "(min-width: 768px) 60vw, 92vw";
  if (c.shots.length)
    return (
      <DeviceShot
        src={c.shots[0]}
        color={c.color}
        variant="laptop"
        sizes={sizes}
        screen={<Screens shots={c.shots} live={live} sizes={sizes} />}
      />
    );
  return (
    <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[clamp(28px,4vw,56px)] font-semibold tracking-[-0.05em] text-faint" translate="no">
      {c.name}
    </span>
  );
}

/**
 * The laptop screen while its case is active: several shots take turns every SHOT_SEC (crossfade + 12px rise),
 * a single shot scrolls slowly from top to bottom over SCROLL_SEC. Remounts per case, so it always starts at shot 1.
 * The shown shot carries no transform once settled (sharpness rule). Not live (reduced motion / leaving): first shot, still.
 */
function Screens({ shots, live, sizes }: { shots: string[]; live: boolean; sizes: string }) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [down, setDown] = useState(false);
  const idx = useRef(0);
  const single = shots.length < 2;

  useEffect(() => {
    if (!live) return;
    if (single) {
      // start from the top on the first paint, then glide down
      const id = setTimeout(() => setDown(true), 60);
      return () => clearTimeout(id);
    }
    const id = setInterval(() => {
      setPrev(idx.current);
      idx.current = (idx.current + 1) % shots.length;
      setI(idx.current);
    }, SHOT_SEC * 1000);
    return () => clearInterval(id);
  }, [live, single, shots.length]);

  return shots.map((src, k) => {
    const on = k === i;
    const was = k === prev && !on;
    return (
      <Image
        key={src}
        src={src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        style={
          single
            ? {
                objectPosition: down ? "50% 100%" : "50% 0%",
                transition: `object-position ${SCROLL_SEC}s cubic-bezier(0.45, 0, 0.55, 1)`,
              }
            : {
                objectPosition: "50% 0%",
                opacity: on ? 1 : 0,
                transform: on ? undefined : was ? "translateY(-12px)" : "translateY(12px)",
                // only the incoming and outgoing shots animate; the rest jump back below while invisible
                transition: on || was ? "opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }
        }
      />
    );
  });
}

function Row({
  c,
  i,
  on,
  auto,
  bar,
  onPick,
}: {
  c: Case;
  i: number;
  on: boolean;
  auto: boolean;
  bar?: React.RefObject<HTMLSpanElement | null>;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      className="card relative flex h-full w-full flex-col justify-center gap-1.5 overflow-hidden px-5 py-3 text-left"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-3">
          <span className={`text-[13px] tabular-nums transition-colors duration-500 ${on ? "text-fg" : "text-faint"}`}>{pad(i + 1)}</span>
          <span
            translate="no"
            className={`truncate text-[clamp(18px,1.5vw,22px)] font-semibold tracking-[-0.03em] transition-colors duration-500 ${on ? "text-fg" : "text-grey"}`}
          >
            {c.name}
          </span>
        </span>
        <span className={`shrink-0 text-[13px] font-medium transition-colors duration-500 ${on ? "text-fg" : "text-grey"}`}>{c.result}</span>
      </span>
      <span className="line-clamp-2 text-[14px] leading-snug text-body">{c.text}</span>
      <span className={`${META} min-w-0 items-center gap-1.5 overflow-hidden`}>
        <span className={`shrink-0 text-[13px] transition-colors duration-500 ${on ? "text-body" : "text-grey"}`}>{c.kind}</span>
        {on ? (
          c.tags.map((t, k) => (
            <span key={t} className="shrink-0">
              <Tag color={k === 0 ? c.accent : undefined}>{t}</Tag>
            </span>
          ))
        ) : (
          <span className="truncate text-[13px] text-grey">· {c.tags.join(" · ")}</span>
        )}
      </span>
      {/* time to the next case */}
      {on && auto && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.06]">
          <span ref={bar} className="block h-full origin-left" style={{ background: c.color, transform: "scaleX(0)" }} />
        </span>
      )}
    </button>
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
