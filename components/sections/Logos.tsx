"use client";

import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";
import { useBooted, useInView } from "../ui/hooks";

const DURATION = 1400;
/** the stats line comes in 0.48s after the boot (globals.css «hero entrance»): count while it is already visible */
const DELAY = 350;

/** Counts 0 → value with an expo-out curve once `go` flips true. Reduced motion: final value at once. */
function useCountUp(value: number, go: boolean) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!go) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now() + DELAY;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      // expo out: most of the count happens early, the last digits settle softly
      setN(Math.round(value * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))));
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
    <span className="flex items-baseline gap-2 whitespace-nowrap">
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg tabular-nums">
        {stat.value === null ? stat.prefix : `${stat.prefix}${n}${stat.suffix}`}
      </span>
      <span className="text-[14px] text-grey">{stat.label}</span>
    </span>
  );
}

/** Quiet line under the hero promise: no box, just value + label pairs separated by dots. */
export function LogoStrip() {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useInView(ref, 0.5);
  const go = useBooted() && seen;
  const { HERO, UI } = useContent();
  return (
    <ul ref={ref} aria-label={UI.why} className="legible mx-auto grid w-fit grid-cols-1 justify-items-center gap-x-10 gap-y-2.5 sm:grid-cols-2 sm:justify-items-start nav:flex nav:items-center nav:gap-x-0">
      {HERO.stats.map((s, i) => (
        <li key={s.label} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="mx-5 hidden size-1 rounded-full bg-white/20 nav:block" />}
          <Stat stat={s} go={go} />
        </li>
      ))}
    </ul>
  );
}
