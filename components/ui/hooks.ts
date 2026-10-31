"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Flips to true once the element enters the viewport and stays true (charts draw once, counters count once).
 * Reduced motion: true immediately, so final states show without animation.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0.35) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/** false while html.booting is on (the hero is still hidden), true once the page has come in */
export function useBooted() {
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const check = () => !root.classList.contains("booting") && setBooted(true);
    check();
    const mo = new MutationObserver(check);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return booted;
}
