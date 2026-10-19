"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { ACCENT, type Accent } from "../ui/accent";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";

// The 5 questions that matter most; short answers, max 2 lines each. Colour = topic (green security, violet links, cyan sync).
const FAQ: { q: string; a: string; color: Accent }[] = [
  {
    q: "Чи бачить Cloud Sphere вміст моїх файлів?",
    a: "Ні. Файли шифруються на твоєму пристрої, на сервері лише шифротекст. Пошуковий індекс теж будується локально.",
    color: "green",
  },
  {
    q: "Як Cloud Sphere розуміє зв'язки між файлами?",
    a: "Бачить, з чого зроблено експорт, які версії йдуть підряд і до чого прив'язані правки. Будь-який зв'язок можна змінити.",
    color: "violet",
  },
  {
    q: "Що, якщо інтернет обірветься під час завантаження?",
    a: "Файли вантажаться частинами по 64 МБ. Завантаження продовжиться з місця обриву.",
    color: "cyan",
  },
  {
    q: "Чи можна перенести архів з іншої хмари?",
    a: "Так, з Google Drive, Dropbox і локальних дисків. Зв'язки між версіями Cloud Sphere відновить автоматично.",
    color: "violet",
  },
  {
    q: "Чи можна дати доступ клієнту без акаунта?",
    a: "Так, за посиланням із терміном дії. Клієнт бачить лише потрібні файли й лишає правки на макеті.",
    color: "green",
  },
];

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
      label="Питання"
      color="cyan"
      title={
        <>
          Часті <G tone="soft">питання.</G>
        </>
      }
    >
      {/* ONE card, one column; hairlines between the questions */}
      <div data-reveal className="w-full">
        <div className="card text-left">
          {FAQ.map((item, i) => {
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
