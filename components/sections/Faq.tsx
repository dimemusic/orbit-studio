"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { ACCENT, type Accent } from "../ui/accent";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { FAQ } from "@/lib/content";

// The 5 questions that matter most (copy in lib/content.ts); short answers, max 2 lines each.
const FAQ_ITEMS: { q: string; a: string; color: Accent }[] = FAQ.items;

export function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <HomeSection
      id="faq"
      label={FAQ.label}
      color="cyan"
      title={
        <>
          {FAQ.title[0]} <G tone="soft">{FAQ.title[1]}</G>
        </>
      }
      lead={FAQ.lead}
    >
      {/* ONE card, one column; hairlines between the questions */}
      <div data-reveal className="w-full">
        <div className="card text-left">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open.has(i);
            const a = ACCENT[item.color];
            return (
              <div key={item.q} className={i > 0 ? "border-t border-white/[0.07]" : ""}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className="group flex w-full items-center gap-4 rounded-2xl px-5 py-5 text-left sm:px-8 sm:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-8 shrink-0 place-items-center rounded-full border text-[13px] font-semibold tabular-nums transition-colors duration-300 ${a.border} ${a.text} ${
                        isOpen ? a.tint : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[clamp(16px,1.3vw,19px)] font-medium tracking-[-0.015em] text-fg/90 transition-colors group-hover:text-fg">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-8 shrink-0 place-items-center rounded-full border transition-[transform,border-color,color] duration-400 ease-[var(--ease)] group-hover:border-white/30 ${
                        isOpen ? "rotate-45 border-white/25 text-fg" : "border-white/[0.1] text-body"
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="acc" data-open={isOpen} inert={!isOpen}>
                  <div>
                    <p
                      className={`max-w-[68ch] pb-6 pl-[68px] pr-6 text-[15px] text-body transition-opacity duration-500 sm:pl-[80px] sm:pr-10 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HomeSection>
  );
}
