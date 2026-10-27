"use client";

import { useEffect } from "react";

/**
 * Full-screen sections (`.snap-section`): one wheel / key step moves exactly one whole section, landing it
 * flush on the screen; a section taller than the screen scrolls natively until its edge, then snaps on.
 * Past the last section (footer) the page scrolls normally. Desktop with a fine pointer only;
 * touch keeps native scrolling. Trackpad inertia is swallowed until the gesture goes quiet.
 * The move is our own tween on ONE requestAnimationFrame loop (a new move cancels the running one). While it runs,
 * <html> gets scroll-behavior: auto, otherwise the CSS smooth scroll would turn every per-frame scrollTo into its
 * own smooth animation and the two would fight (stutter).
 */
const QUIET = 150; // ms without wheel events that ends a gesture
const MOVE = 720; // ms a section move takes (850 in-out cubic felt slow, 600 out-quart felt abrupt)

export function SectionSnap() {
  useEffect(() => {
    if (!window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lockUntil = 0;
    let raf = 0;
    const root = document.documentElement;
    // ease-in-out sine: soft start and soft landing, but without the long wait of a cubic in-out
    const inOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      root.style.scrollBehavior = "";
    };

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".snap-section")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, h: r.height };
      });
    const go = (y: number) => {
      lockUntil = performance.now() + MOVE;
      stop();
      root.style.scrollBehavior = "auto";
      if (reduced) {
        window.scrollTo(0, y);
        root.style.scrollBehavior = "";
        return;
      }
      const from = window.scrollY;
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / MOVE);
        window.scrollTo(0, from + (y - from) * inOut(k));
        if (k < 1) raf = requestAnimationFrame(tick);
        else {
          raf = 0;
          root.style.scrollBehavior = "";
        }
      };
      raf = requestAnimationFrame(tick);
    };

    /** returns true when the step was handled (native scroll must be prevented) */
    const step = (dir: 1 | -1) => {
      const list = sections();
      if (!list.length) return false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const last = list[list.length - 1];
      /** where a section "sits" when we land on it coming from below: its last screen if it is taller than one */
      const landUp = (s: { top: number; h: number }) => s.top + Math.max(0, s.h - vh);
      if (y > landUp(last) + 2) {
        // in the footer area: native, but land the last section exactly when coming back up into it
        if (dir < 0 && y - vh * 0.9 < last.top + last.h) {
          go(landUp(last));
          return true;
        }
        return false;
      }
      // current section = the one containing the top of the screen
      let i = 0;
      for (let k = 0; k < list.length; k++) if (list[k].top <= y + 2) i = k;
      const cur = list[i];
      // a section taller than the screen (tablet layouts) scrolls natively until its edge is reached
      if (cur.h > vh + 4) {
        if (dir > 0 && y + vh < cur.top + cur.h - 2) return false;
        if (dir < 0 && y > cur.top + 2) return false;
      } else if (Math.abs(cur.top - y) >= 4) {
        // between two sections: settle on the next one in the scroll direction
        const next = dir > 0 ? list[i + 1] : cur;
        if (next) go(dir > 0 ? next.top : landUp(next));
        return !!next;
      }
      if (dir > 0 && i < list.length - 1) {
        go(list[i + 1].top);
        return true;
      }
      if (dir < 0 && i > 0) {
        go(landUp(list[i - 1]));
        return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now();
      if (now < lockUntil) {
        // still moving or the same gesture's inertia: swallow it, but only while inside the sections
        lockUntil = Math.max(lockUntil, now + QUIET);
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 2) return;
      if (step(e.deltaY > 0 ? 1 : -1)) {
        e.preventDefault();
        lockUntil = Math.max(lockUntil, now + QUIET);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (performance.now() < lockUntil) {
        e.preventDefault();
        return;
      }
      if (step(down ? 1 : -1)) e.preventDefault();
    };

    // grabbing the scrollbar (or any pointer press) hands the scroll back to the user at once
    const onDown = () => stop();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
  return null;
}
