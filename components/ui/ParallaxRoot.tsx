"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Light scroll parallax, one passive listener + one rAF per frame, transform (and for the hero, opacity) only.
 * Mark a WRAPPER (never an element with [data-reveal], whose transform the reveal owns) with:
 *   data-parallax="k"   k × distance → px; k > 0 = the element lags behind the scroll (feels farther away)
 *   data-pfrom="top"    distance = page scroll (hero: at rest nothing moves); default = distance of the element's
 *                       centre from the viewport centre, so a section header is in place when it is mid-screen
 *   data-pmax="n"       clamp in px (default 24: headers sit 48px above their content and must never touch it)
 *   data-pfade          also fade out over the first ~80% of a screen of scroll (hero copy)
 * Only on a fine pointer, ≥ 64rem and without reduced motion; otherwise nothing is touched.
 */
export function ParallaxRoot() {
  const pathname = usePathname();
  useEffect(() => {
    const ok = window.matchMedia("(pointer: fine) and (min-width: 64rem) and (prefers-reduced-motion: no-preference)");
    type P = { el: HTMLElement; k: number; max: number; top: boolean; fade: boolean; mid: number };
    let items: P[] = [];
    let raf = 0;

    const reset = () => items.forEach((p) => ((p.el.style.transform = ""), (p.el.style.opacity = "")));
    const measure = () => {
      reset();
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          k: Number(el.dataset.parallax) || 0,
          max: Number(el.dataset.pmax) || 24,
          top: el.dataset.pfrom === "top",
          fade: "pfade" in el.dataset,
          mid: r.top + window.scrollY + r.height / 2,
        };
      });
    };
    const frame = () => {
      raf = 0;
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const c = sy + vh / 2;
      for (const p of items) {
        const d = p.top ? sy : c - p.mid;
        if (!p.top && Math.abs(d) > vh * 1.5) continue; // far off screen: leave it
        const y = Math.max(-p.max, Math.min(p.max, d * p.k));
        p.el.style.transform = y ? `translate3d(0, ${y.toFixed(1)}px, 0)` : "";
        if (p.fade) {
          const o = Math.max(0, 1 - sy / (vh * 0.8));
          p.el.style.opacity = o < 1 ? o.toFixed(3) : "";
        }
      }
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!ok.matches) {
        reset();
        items = [];
        return;
      }
      measure();
      frame();
    };

    start();
    // fonts, images and the lazily mounted film shift the layout after load: measure again
    const late = window.setTimeout(start, 1200);
    const ro = new ResizeObserver(() => start());
    ro.observe(document.body);
    window.addEventListener("scroll", tick, { passive: true });
    ok.addEventListener("change", start);
    return () => {
      window.clearTimeout(late);
      ro.disconnect();
      window.removeEventListener("scroll", tick);
      ok.removeEventListener("change", start);
      if (raf) cancelAnimationFrame(raf);
      reset();
    };
  }, [pathname]);
  return null;
}
