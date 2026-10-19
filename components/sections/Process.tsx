"use client";

import { useRef } from "react";
import { PROCESS } from "@/lib/content";
import { G, Tag } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { useInView } from "../ui/hooks";

/**
 * 06 Process: four numbered step cards on one progress line. The line draws once on entering view
 * and each node lights up as it arrives (same markers and gradient as the admin stepper).
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
        {/* progress line through the step markers (desktop: horizontal, under the numbers) */}
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px bg-white/10 lg:block">
          <span
            className={`block h-full origin-left bg-gradient-to-r from-[#5aa2ff] via-violet to-[#e83fa8] transition-transform duration-[2400ms] ease-[var(--ease)] motion-reduce:transition-none ${
              seen ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </span>
        <ol ref={ref} className="relative grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {PROCESS.steps.map((s, i) => (
            <li key={s.n} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className="flex flex-col items-center">
              <span
                style={{ transitionDelay: seen ? `${(i / (n - 1)) * 2000}ms` : "0ms" }}
                className={`relative hidden size-11 place-items-center rounded-full border bg-bg text-[14px] font-semibold tabular-nums transition-colors duration-500 lg:grid ${
                  seen ? "border-blue/70 text-fg" : "border-white/10 text-faint"
                }`}
              >
                {s.n}
              </span>
              <div className="card mt-0 flex h-full w-full flex-col p-6 text-left lg:mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold tabular-nums text-blue lg:hidden">{s.n}</span>
                  <Tag color="cyan">{s.days}</Tag>
                </div>
                <h3 className="mt-4 text-title font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[15px] text-body">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </HomeSection>
  );
}
