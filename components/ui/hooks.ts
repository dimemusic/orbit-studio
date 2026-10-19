"use client";

import { useEffect, useState, type RefObject } from "react";

/** true when the user asked for reduced motion (false during SSR). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

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

/** Live visibility (not once): for small loops that should only run on screen. */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/** Tween a number toward `value` with an ease-out curve. Reduced motion: jumps. */
export function useTween(value: number, duration = 700) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    const from = shown;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(from + (value - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return shown;
}

/** true while a once-only intro stagger is playing, so later hover transitions don't inherit its delays. */
export function useIntro(started: boolean, ms = 1600) {
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!started) return;
    const t = window.setTimeout(() => setIntro(false), ms);
    return () => window.clearTimeout(t);
  }, [started, ms]);
  return intro;
}

/**
 * Latches true once the element is in view AND `active` is true (e.g. its step is the one on screen).
 * Lets a demo inside a hidden stage wait for its turn instead of playing while invisible.
 */
export function useStarted<T extends Element>(ref: RefObject<T | null>, active = true, threshold = 0.35) {
  const inView = useInView(ref, threshold);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (inView && active) setStarted(true);
  }, [inView, active]);
  return started;
}

/** Media query match (false during SSR and the first client render). */
export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatch(mq.matches);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
