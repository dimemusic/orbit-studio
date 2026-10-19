"use client";

import { CaretUp } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState } from "react";
import { HOME_SECTIONS } from "./home";

const pad = (n: number) => String(n).padStart(2, "0");
const TOTAL = pad(HOME_SECTIONS.length);

/**
 * Home only: «02 / 07 · Як це працює», follows scroll; click opens a small list to jump between sections.
 * Hidden over the hero; slides in (no opacity: a faded ancestor would kill the .card blur).
 */
export function SectionProgress() {
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let idx = 0;
      HOME_SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setCur(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const section = HOME_SECTIONS[cur];
  const shown = cur > 0;

  // close the list when the pill hides again over the hero
  useEffect(() => {
    if (!shown) setOpen(false);
  }, [shown]);

  return (
    <div
      ref={root}
      inert={!shown}
      className={`fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 transition-[transform,visibility] duration-500 ease-[var(--ease)] ${
        shown ? "visible translate-y-0" : "invisible translate-y-[calc(100%+40px)]"
      }`}
    >
      <ul
        id={listId}
        hidden={!open}
        aria-label="Розділи сторінки"
        className="card absolute bottom-full left-1/2 mb-2 w-[248px] -translate-x-1/2 animate-[quote-in_0.3s_var(--ease)_both] rounded-2xl p-1.5"
      >
        {HOME_SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={i === cur ? "location" : undefined}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors hover:bg-white/[0.05] ${
                i === cur ? "text-fg" : "text-body"
              }`}
            >
              <span className={`w-6 text-[12px] font-semibold tabular-nums ${i === cur ? "text-blue" : "text-grey"}`}>{pad(i + 1)}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Розділ ${cur + 1} з ${HOME_SECTIONS.length}: ${section.label}. Відкрити список розділів`}
        onClick={() => setOpen((o) => !o)}
        className="card inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-2.5 text-[13px] tabular-nums text-body transition-colors hover:text-fg"
      >
        <span>
          <span className="font-semibold text-fg">{pad(cur + 1)}</span> / {TOTAL}
        </span>
        <span aria-hidden="true" className="text-faint">
          ·
        </span>
        <span key={section.id} className="animate-[quote-in_0.4s_var(--ease)_both]">
          {section.label}
        </span>
        <CaretUp size={12} aria-hidden="true" className={`text-grey transition-transform duration-300 ${open ? "" : "rotate-180"}`} />
      </button>
    </div>
  );
}
