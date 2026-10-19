"use client";

import { useRef, useState } from "react";
import { G } from "../ui/Bits";
import { useInView, useIntro } from "../ui/hooks";
import { Section } from "../ui/Section";

// Fictional: 90 days ending 16 Oct 2026, three days with short incidents.
const MON = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
const INCIDENTS: Record<number, number> = { 23: 99.2, 57: 99.6, 81: 99.8 };
const DAYS = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2026, 9, 16 - (89 - i));
  return { label: `${d.getDate()} ${MON[d.getMonth()]}`, up: INCIDENTS[i] ?? 100 };
});

const REGIONS: { name: string; role: string; ms: number; up: string }[] = [
  { name: "Франкфурт", role: "основний центр", ms: 14, up: "99,99%" },
  { name: "Варшава", role: "резервна копія", ms: 18, up: "99,98%" },
  { name: "Амстердам", role: "резервна копія", ms: 21, up: "99,98%" },
  { name: "Лісабон", role: "edge-вузол", ms: 32, up: "99,97%" },
  { name: "Нью-Йорк", role: "edge-вузол", ms: 88, up: "99,95%" },
  { name: "Сінгапур", role: "edge-вузол", ms: 142, up: "99,94%" },
];

const pct = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });

export function Uptime() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, 0.3);
  const intro = useIntro(on, 1600);
  const [hot, setHot] = useState<number | null>(null);
  const day = hot === null ? null : DAYS[hot];

  return (
    <Section
      id="uptime"
      eyebrow={{ label: "Доступність і регіони", color: "green" }}
      title={
        <>
          Онлайн <G tone="fresh">99,95%</G> часу.
        </>
      }
      lead="90 днів доступності й стан кожного регіону."
    >
      <div ref={ref} data-reveal className="card w-full text-left">
        <div className="px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[15px] font-medium text-fg">Останні 90 днів</h3>
            <p aria-live="polite" className="text-[13px] tabular-nums text-grey">
              {day ? (
                <>
                  <span className="text-fg">{day.label}</span>: {pct.format(day.up)}%{day.up < 100 ? ", короткий збій" : ", без збоїв"}
                </>
              ) : (
                "Наведи на день"
              )}
            </p>
          </div>
          <div
            role="img"
            aria-label="Доступність за 90 днів: три дні з короткими збоями, решта 100%"
            className="mt-5 flex h-12 items-end gap-[2px]"
            onPointerLeave={() => setHot(null)}
          >
            {DAYS.map((d, i) => (
              <span
                key={i}
                onPointerEnter={() => setHot(i)}
                className="flex h-full flex-1 cursor-default items-end"
              >
                <span
                  className={`block w-full origin-bottom rounded-[2px] transition-[transform,opacity] ${d.up < 100 ? "bg-green/45" : "bg-green"}`}
                  style={{
                    height: d.up < 100 ? "55%" : "100%",
                    transform: `scaleY(${on ? 1 : 0})`,
                    opacity: hot === null || hot === i ? 1 : 0.4,
                    transitionDuration: "700ms, 200ms",
                    transitionDelay: `${intro ? i * 8 : 0}ms, 0ms`,
                  }}
                />
              </span>
            ))}
          </div>
          <div aria-hidden="true" className="mt-2 flex justify-between text-[12px] text-grey">
            <span>{DAYS[0].label}</span>
            <span>сьогодні</span>
          </div>
        </div>

        <ul className="grid grid-cols-1 border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <li
              key={r.name}
              className={`flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] sm:px-8 ${
                i > 0 ? "border-t border-white/[0.07]" : ""
              } ${i === 1 ? "sm:border-t-0" : ""} ${i === 2 ? "lg:border-t-0" : ""}`}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[15px] text-fg">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
                  {r.name}
                </span>
                <span className="mt-0.5 block text-[13px] text-grey">{r.role}, працює</span>
              </span>
              <span className="text-right text-[13px] tabular-nums">
                <span className="block text-fg">{r.ms} мс</span>
                <span className="block text-grey">{r.up}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
