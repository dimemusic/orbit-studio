"use client";

import { useRef } from "react";
import { PROCESS } from "@/lib/content";
import { G, IconTile, Tag } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { Icon } from "../ui/icons";
import { useInView } from "../ui/hooks";

/**
 * Process: five steps on one progress line. Desktop: horizontal line through numbered markers,
 * drawn once on entering view, each marker lights up as the line reaches it. Mobile: stacked cards.
 */
export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const seen = useInView(ref, 0.3);
  const n = PROCESS.steps.length;

  return (
    <HomeSection
      id="process"
      label={PROCESS.label}
      color="violet"
      title={
        <>
          {PROCESS.title[0]} <G tone="ice">{PROCESS.title[1]}</G>
        </>
      }
      lead={PROCESS.lead}
    >
      <div className="relative w-full">
        <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-[22px] hidden h-px bg-white/10 lg:block">
          <span
            className={`block h-full origin-left bg-gradient-to-r from-[#5aa2ff] to-violet transition-transform duration-[2400ms] ease-[var(--ease)] motion-reduce:transition-none ${
              seen ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </span>
        <ol ref={ref} className="relative grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {PROCESS.steps.map((s, i) => (
            <li key={s.n} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="flex flex-col items-center">
              <span
                style={{ transitionDelay: seen ? `${(i / (n - 1)) * 2000}ms` : "0ms" }}
                className={`relative hidden size-11 place-items-center rounded-full border bg-bg text-[14px] font-semibold tabular-nums transition-colors duration-500 lg:grid ${
                  seen ? "border-blue/70 text-fg" : "border-white/10 text-faint"
                }`}
              >
                {s.n}
              </span>
              <div className="card flex h-full w-full flex-col p-5 text-left lg:mt-6">
                <div className="flex items-center justify-between gap-3">
                  <IconTile color="violet">
                    <Icon name={s.icon} size={20} />
                  </IconTile>
                  <span className="text-[13px] font-semibold tabular-nums text-violet-soft lg:hidden">{s.n}</span>
                </div>
                <h3 className="mt-4 text-[19px] font-semibold leading-tight tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-1.5 text-[14px] leading-snug text-body">{s.text}</p>
                <div className="mt-auto pt-4">
                  <Tag color="cyan">{s.days}</Tag>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p data-reveal className="legible mt-8 text-[15px] font-medium text-body">{PROCESS.total}</p>
    </HomeSection>
  );
}
