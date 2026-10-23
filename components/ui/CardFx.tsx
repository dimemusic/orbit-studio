"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Global interaction layer for interactive `.card`s (one listener for the page):
 * - cursor spotlight + border light: writes --mx / --my / --spot on the hovered card (CSS in globals.css)
 * - subtle 3D tilt (max 4°) on cards marked `data-tilt` (large cards only), off under reduced motion
 * Only on hover-capable fine pointers, and only on cards that are or contain a control (static cards stay still).
 * Re-binds on route change so no card from the old page stays lit.
 */
const CONTROL = "button, a[href], input, select, textarea, summary, [role=button], [tabindex]:not([tabindex=\"-1\"])";
const interactive = (el: HTMLElement) => el.matches(CONTROL) || el.querySelector(CONTROL) !== null;

export function CardFx() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let current: HTMLElement | null = null;
    let raf = 0;
    let last: PointerEvent | null = null;

    const release = (el: HTMLElement) => {
      el.style.setProperty("--spot", "0");
      if (el.hasAttribute("data-tilt") || el.hasAttribute("data-tilt-inner")) {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      }
    };

    const frame = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const t = e.target instanceof Element ? e.target : null;
      const hit = (t?.closest(".card:not(.card-nav)") as HTMLElement | null) ?? null;
      const card = hit && interactive(hit) ? hit : null;
      if (card !== current) {
        if (current) release(current);
        current = card;
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      card.style.setProperty("--spot", "1");
      if ((card.hasAttribute("data-tilt") || card.hasAttribute("data-tilt-inner")) && !reduced.matches) {
        const nx = x / r.width - 0.5;
        const ny = y / r.height - 0.5;
        card.style.setProperty("--rx", `${(-ny * 8).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${(nx * 8).toFixed(2)}deg`);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !hover.matches) return;
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      if (current) release(current);
      current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      if (current) release(current);
    };
  }, [pathname]);
  return null;
}
