"use client";

import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { ACCENT, type Accent } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { useReducedMotion } from "../ui/hooks";
import { HomeSection } from "../ui/HomeSection";
import { StatCards } from "./StatCards";

// Fictional people and studios.
type Quote = { quote: string; name: string; role: string; initials: string; color: Accent; tag: string; metric: [string, string] };

const QUOTES: Quote[] = [
  {
    quote: "Ми перестали питати в чаті, де фінальна версія. Cloud Sphere просто її показує.",
    name: "Марта Савчук",
    role: "керівниця студії Varta",
    initials: "МС",
    color: "blue",
    tag: "Версії",
    metric: ["−6 год", "на тиждень пошуків"],
  },
  {
    quote: "Тизер на 180 ГБ доїхав до клієнта з першого разу, хоча інтернет падав двічі.",
    name: "Тарас Мельник",
    role: "моушн-дизайнер, Північ",
    initials: "ТМ",
    color: "violet",
    tag: "Великі файли",
    metric: ["180 ГБ", "без жодного архіву"],
  },
  {
    quote: "Пишу «годинник на сталевому браслеті» і за секунду маю сцену з архіву.",
    name: "Данило Бойко",
    role: "3D-лід, Optika Lab",
    initials: "ДБ",
    color: "cyan",
    tag: "Пошук",
    metric: ["1 с", "до потрібної сцени"],
  },
  {
    quote: "Клієнт із банку перевіряв нас місяць. Шифрування на пристрої закрило всі питання.",
    name: "Ірина Коваль",
    role: "арт-директорка, Kvitka Agency",
    initials: "ІК",
    color: "green",
    tag: "Безпека",
    metric: ["0", "зауважень від безпеки"],
  },
  {
    quote: "Клієнт лишає мітки просто на макеті, і я бачу, до якої версії вони стосуються.",
    name: "Олег Руденко",
    role: "ілюстратор, фриланс",
    initials: "ОР",
    color: "blue",
    tag: "Правки",
    metric: ["3×", "менше листів з правками"],
  },
  {
    quote: "Монтажер у Львові, я в Лісабоні, а файли однакові в обох.",
    name: "Софія Литвин",
    role: "продюсерка, Kadr Production",
    initials: "СЛ",
    color: "violet",
    tag: "Синк",
    metric: ["1,4 с", "між Львовом і Лісабоном"],
  },
  {
    quote: "Кожен PNG знає свій макет. Більше ніяких «а з якого це файлу?».",
    name: "Андрій Гнатюк",
    role: "засновник, Brovko Type",
    initials: "АГ",
    color: "cyan",
    tag: "Експорт",
    metric: ["100%", "експортів із джерелом"],
  },
  {
    quote: "Почала з безкоштовного тарифу, а за місяць перевела туди всю студію.",
    name: "Юлія Ткач",
    role: "UX-дизайнерка, Dribnytsi",
    initials: "ЮТ",
    color: "green",
    tag: "Free",
    metric: ["20 ГБ", "на старт без картки"],
  },
];

function Avatar({ q, size = "size-11" }: { q: Quote; size?: string }) {
  const a = ACCENT[q.color];
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full border text-[13px] font-semibold ${size} ${a.border} ${a.text} ${a.tint}`}>
      {q.initials}
    </span>
  );
}

// one person every 6 s while the card is on screen; the ring around the active avatar shows the time left
const DWELL = 6000;

/**
 * Home «Proof»: ONE card. Three numbers that count up, the featured quote, and a row of avatars to switch it.
 * Rotates on its own like the How it works steps: only while on screen, no pause on hover, a click jumps and restarts the timer.
 */
export function Proof() {
  const card = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null); // ring of the active avatar; written per frame, never via state
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [run, setRun] = useState(0); // bumps on a click so the timer restarts even on the same person
  const reduced = useReducedMotion();
  const last = QUOTES.length - 1;
  const idx = Math.min(Math.max(active, 0), last);

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduced) return; // leaving the screen keeps the current person
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      // rAF timestamps can be a few ms older than performance.now(): never let t go negative
      const t = Math.max(0, now - start);
      const p = Math.min(1, t / DWELL);
      ring.current?.style.setProperty("--deg", `${p * 360}deg`);
      if (p >= 1) {
        setActive((i) => (Math.min(Math.max(i, 0), last) + 1) % QUOTES.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, active, run, last]);

  const pick = (i: number) => {
    setActive(i);
    setRun((r) => r + 1);
  };

  return (
    <HomeSection
      id="proof"
      label="Відгуки"
      color="violet"
      title={
        <>
          Студії, які <G tone="warm">не губять</G> файли.
        </>
      }
      lead="Цифри й слова тих, хто вже переніс архів."
      more={{ href: "/analytics", label: "Детальніше: усі цифри" }}
    >
      <StatCards />

      <div data-reveal className="mt-4 w-full">
        <div ref={card} className="card text-left">
          {/* every person is a pane in the same grid cell, so the card is as tall as the tallest and never jumps */}
          <figure className="grid [grid-template-areas:'stage']">
            {QUOTES.map((q, i) => {
              const on = i === idx;
              const a = ACCENT[q.color];
              return (
                <div
                  key={q.name}
                  inert={!on}
                  aria-hidden={!on}
                  className={`grid grid-cols-1 transition-[opacity,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)] [grid-area:stage] motion-reduce:transition-none lg:grid-cols-[1fr_280px] ${
                    on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  <div className="px-6 py-10 sm:px-12">
                    <Quotes size={28} weight="fill" aria-hidden="true" className={a.text} />
                    <blockquote className="mt-5 max-w-[34ch] text-[clamp(22px,2.2vw,32px)] font-medium leading-[1.25] tracking-[-0.025em]">
                      «{q.quote}»
                    </blockquote>
                    <figcaption className="mt-8 flex flex-wrap items-center gap-3">
                      <Avatar q={q} />
                      <span>
                        <span className="block text-[15px] font-medium text-fg">{q.name}</span>
                        <span className="block text-[13px] text-grey">{q.role}</span>
                      </span>
                      <span className="ml-1">
                        <Tag color={q.color}>{q.tag}</Tag>
                      </span>
                    </figcaption>
                  </div>
                  <div className="flex flex-col justify-center border-t border-white/[0.07] px-6 py-8 sm:px-12 lg:border-l lg:border-t-0 lg:px-10">
                    <p className="text-[clamp(40px,4vw,64px)] font-semibold leading-none tracking-[-0.05em] tabular-nums text-fg">{q.metric[0]}</p>
                    <p className="mt-3 text-[15px] text-body">{q.metric[1]}</p>
                  </div>
                </div>
              );
            })}
          </figure>

          <div role="group" aria-label="Обери відгук" className="flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.07] px-6 py-5">
            {QUOTES.map((item, i) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={i === idx}
                aria-label={`Відгук: ${item.name}, ${item.role}`}
                onClick={() => pick(i)}
                className={`relative rounded-full p-1 transition-opacity duration-300 ${i === idx ? "" : "opacity-60 hover:opacity-100"}`}
              >
                {i === idx && (
                  // 2px ring in the quote's tone (currentColor), filled clockwise by --deg; full ring when motion is reduced
                  <span
                    ref={ring}
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-full [background:conic-gradient(currentColor_var(--deg),rgb(255_255_255/0.12)_0)] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))] ${ACCENT[item.color].text}`}
                    style={{ ["--deg" as string]: reduced ? "360deg" : "0deg" }}
                  />
                )}
                <Avatar q={item} size="size-9" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
