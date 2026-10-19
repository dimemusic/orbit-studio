"use client";

import { useEffect, useRef, useState } from "react";

type Props = { to: number; decimals?: number; suffix?: string };

/** Counts up once, gently, when scrolled into view. Reduced motion: final value only. */
export function Counter({ to, decimals = 0, suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          setValue(to * (1 - Math.pow(1 - t, 4)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    // start from zero only once we know it will animate
    setValue(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  const fmt = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="tabular-nums">
      {fmt.format(value)}
      {suffix}
    </span>
  );
}
