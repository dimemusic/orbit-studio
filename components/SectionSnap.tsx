"use client";

import { useEffect } from "react";

/**
 * Full-screen sections (`.snap-section`): one wheel / key step moves exactly one whole section, landing it
 * flush on the screen. Past the last section (footer) the page scrolls normally. Desktop with a fine pointer only;
 * touch keeps native scrolling. Trackpad inertia is swallowed until the gesture goes quiet.
 * The move is our own tween on ONE requestAnimationFrame loop (a new move cancels the running one). While it runs,
 * <html> gets scroll-behavior: auto, otherwise the CSS smooth scroll would turn every per-frame scrollTo into its
 * own smooth animation and the two would fight (stutter).
 */
const QUIET = 220; // ms without wheel events that ends a gesture
const MOVE = 850; // ms a section move takes

export function SectionSnap() {
  useEffect(() => {
    if (!window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lockUntil = 0;
    let raf = 0;
    const root = document.documentElement;
    const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      root.style.scrollBehavior = "";
    };

    const tops = () => Array.from(document.querySelectorAll<HTMLElement>(".snap-section")).map((el) => el.getBoundingClientRect().top + window.scrollY);
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
      const t = tops();
      if (!t.length) return false;
      const y = window.scrollY;
      const last = t[t.length - 1];
      if (y > last + 2) {
        // in the footer area: native, but land the last section exactly when coming back up into it
        if (dir < 0 && y - window.innerHeight * 0.9 < last) {
          go(last);
          return true;
        }
        return false;
      }
      // current section = the one whose top is closest
      let i = 0;
      for (let k = 1; k < t.length; k++) if (Math.abs(t[k] - y) < Math.abs(t[i] - y)) i = k;
      const aligned = Math.abs(t[i] - y) < 4;
      if (!aligned) {
        go(dir > 0 ? (t.find((v) => v > y + 2) ?? t[i]) : ([...t].reverse().find((v) => v < y - 2) ?? t[0]));
        return true;
      }
      if (dir > 0 && i < t.length - 1) {
        go(t[i + 1]);
        return true;
      }
      if (dir < 0 && i > 0) {
        go(t[i - 1]);
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
