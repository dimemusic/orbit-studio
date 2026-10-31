"use client";

import { useEffect } from "react";

/**
 * Liquid morph for `.btn-primary` / `.btn-secondary` (CSS in globals.css), one listener for the page:
 * - fine pointer: the button stretches a little toward the cursor (along its long side) and a soft light follows it
 * - any pointer: a press squashes it, the release springs back (the CSS transition overshoots)
 * Writes only CSS variables; off under reduced motion.
 */
const SEL = ".btn-primary, .btn-secondary";

export function ButtonFx() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let cur: HTMLElement | null = null;
    let down = false;
    let raf = 0;
    let last: PointerEvent | null = null;
    const set = (el: HTMLElement, v: Record<string, string>) => {
      for (const k in v) el.style.setProperty(k, v[k]);
    };
    const rest = (el: HTMLElement) => set(el, { "--tx": "0px", "--ty": "0px", "--sx": "1", "--sy": "1", "--hl": "0" });

    const shape = (el: HTMLElement, e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      const ny = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      set(el, { "--px": `${(e.clientX - r.left).toFixed(0)}px`, "--py": `${(e.clientY - r.top).toFixed(0)}px` });
      if (down) {
        set(el, { "--tx": `${(nx * 2).toFixed(2)}px`, "--ty": "0px", "--sx": "0.95", "--sy": "0.9", "--hl": "1.4" });
        return;
      }
      // pulled toward the cursor and stretched along x, a touch thinner: a drop leaning into the finger
      set(el, {
        "--tx": `${(nx * 6).toFixed(2)}px`,
        "--ty": `${(ny * 3).toFixed(2)}px`,
        "--sx": (1.03 + Math.abs(nx) * 0.03).toFixed(3),
        "--sy": (1.03 - Math.abs(nx) * 0.04).toFixed(3),
        "--hl": "1",
      });
    };

    const frame = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const t = e.target instanceof Element ? (e.target.closest(SEL) as HTMLElement | null) : null;
      if (t !== cur) {
        if (cur) rest(cur);
        cur = t;
      }
      if (cur) shape(cur, e);
    };
    const queue = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      if (reduced.matches || e.pointerType !== "mouse" || !hover.matches) return;
      queue(e);
    };
    const onDown = (e: PointerEvent) => {
      if (reduced.matches || !(e.target instanceof Element) || !e.target.closest(SEL)) return;
      down = true;
      queue(e);
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (e.pointerType === "mouse" && hover.matches) queue(e);
      else if (cur) {
        rest(cur);
        cur = null;
      }
    };
    const onLeave = () => {
      if (cur) rest(cur);
      cur = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
