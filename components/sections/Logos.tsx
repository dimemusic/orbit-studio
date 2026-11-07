"use client";

import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";
import { useInView } from "../ui/hooks";

const DURATION = 1200;

/** Counts 0 → value with an ease-out curve once `go` flips true. Reduced motion: final value at once. */
function useCountUp(value: number, go: boolean) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!go) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, value]);
  return n;
}

function Stat({ stat, go }: { stat: Content["HERO"]["stats"][number]; go: boolean }) {
  const n = useCountUp(stat.value ?? 0, go);
  return (
    <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:gap-2 sm:whitespace-nowrap">
      <span className="text-title font-semibold sm:text-base tracking-[-0.02em] text-fg tabular-nums">
        {stat.value === null ? stat.prefix : `${stat.prefix}${n}${stat.suffix}`}
      </span>
      <span className="text-sm text-grey">{stat.label}</span>
    </span>
  );
}

/** Quiet line under the hero promise: no box, just value + label pairs separated by dots. */
export function LogoStrip() {
  const ref = useRef<HTMLUListElement>(null);
  const go = useInView(ref, 0.5);
  const { HERO, UI } = useContent();
  return (
    <ul ref={ref} aria-label={UI.why} className="grid w-full grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.09] pt-6 text-left sm:mx-auto sm:w-fit sm:gap-x-10 sm:gap-y-3 sm:border-0 sm:pt-0 nav:flex nav:items-center nav:gap-x-0">
      {HERO.stats.map((s, i) => (
        <li key={s.label} className="flex items-start sm:items-center">
          {i > 0 && <span aria-hidden="true" className="mx-5 hidden size-1 rounded-full bg-white/20 nav:block" />}
          <Stat stat={s} go={go} />
        </li>
      ))}
    </ul>
  );
}
