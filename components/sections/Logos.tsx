"use client";

import { useEffect, useRef, useState } from "react";
import { HERO } from "@/lib/content";
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

function Stat({ stat, go }: { stat: (typeof HERO.stats)[number]; go: boolean }) {
  const n = useCountUp(stat.value ?? 0, go);
  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-3.5 text-center">
      <p className="text-[20px] font-semibold leading-none tracking-[-0.03em] text-fg sm:text-[24px]">
        <span className="whitespace-nowrap tabular-nums">
          {stat.value === null ? stat.prefix : `${stat.prefix}${n}${stat.suffix}`}
        </span>
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-grey lg:whitespace-nowrap">{stat.label}</p>
    </div>
  );
}

/** Strip under the hero promise: glass stats bar. */
export function LogoStrip() {
  const ref = useRef<HTMLUListElement>(null);
  const go = useInView(ref, 0.5);
  return (
    <div className="w-full">
      <ul
        ref={ref}
        aria-label="Чому ми"
        className="card card-nav mx-auto grid w-full max-w-[820px] grid-cols-2 overflow-hidden border-white/[0.08] lg:grid-cols-4"
      >
        {HERO.stats.map((s, i) => (
          <li
            key={s.label}
            className={[
              "relative flex items-center justify-center border-white/[0.08] before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-px before:bg-white/[0.08]",
              i % 2 === 1 ? "before:block" : "before:hidden",
              i >= 1 ? "lg:before:block" : "lg:before:hidden",
              i >= 2 ? "border-t lg:border-t-0" : "",
            ].join(" ")}
          >
            <Stat stat={s} go={go} />
          </li>
        ))}
      </ul>
    </div>
  );
}
