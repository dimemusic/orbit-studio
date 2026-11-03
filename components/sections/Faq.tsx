"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useContent } from "../Lang";
import { RevealWords } from "../ui/RevealWords";

/**
 * Frequently asked questions (FAQ in the content files; numbers follow the price list). Shown on the home page and on
 * every service page; the same Q&A go into FAQPage JSON-LD (JsonLd.tsx), which is what search and AI answers quote.
 * Questions on hairlines, one open at a time is not enforced; the first one starts open.
 */
export function Faq({ id = "faq" }: { id?: string }) {
  const { FAQ } = useContent();
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative flex w-full flex-col px-gutter pb-12 pt-24">
      <h2 id={`${id}-title`} className="legible relative z-[1] text-mega font-semibold">
        <RevealWords text={FAQ.title[0]} accent={FAQ.title[1]} tone="teal" />
      </h2>
      <ul className="relative z-[1] mt-12 w-full max-w-[56rem] border-b border-white/[0.09]">
        {FAQ.items.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <li key={item.q} data-reveal className="border-t border-white/[0.09]">
              <h3>
                <button
                  type="button"
                  id={`${id}-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-a-${i}`}
                  onClick={() => toggle(i)}
                  className="group flex w-full items-center gap-6 py-6 text-left"
                >
                  <span className="legible flex-1 text-title font-medium text-fg">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className={`grid size-11 shrink-0 place-items-center rounded-full border transition-[transform,border-color,color] duration-300 group-hover:border-white/30 ${
                      isOpen ? "rotate-45 border-white/25 text-fg" : "border-white/[0.12] text-body"
                    }`}
                  >
                    <Plus size={18} />
                  </span>
                </button>
              </h3>
              <div id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`} className="acc" data-open={isOpen} inert={!isOpen}>
                <div>
                  <p className={`legible max-w-[44rem] pb-6 pr-16 text-base text-body transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                    {item.a}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
