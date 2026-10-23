"use client";

import { useEffect } from "react";
import { HOME_SECTIONS } from "@/lib/content";

/**
 * Calm background below the hero: the page colour with two very soft, slowly drifting colour washes.
 * Their tint follows the section on screen (the hero stars canvas fades out on top of this layer).
 * Colours are written to CSS variables on <html>; `@property` in globals.css makes them transition smoothly.
 */
const TINTS: Record<string, [string, string]> = {
  top: ["rgb(61 139 255 / 0.10)", "rgb(139 92 246 / 0.08)"],
  work: ["rgb(52 211 153 / 0.09)", "rgb(61 139 255 / 0.08)"],
  services: ["rgb(61 139 255 / 0.11)", "rgb(34 211 238 / 0.08)"],
  process: ["rgb(139 92 246 / 0.11)", "rgb(61 139 255 / 0.07)"],
  about: ["rgb(232 63 168 / 0.07)", "rgb(139 92 246 / 0.09)"],
  faq: ["rgb(34 211 238 / 0.08)", "rgb(139 92 246 / 0.07)"],
  contact: ["rgb(61 139 255 / 0.12)", "rgb(139 92 246 / 0.10)"],
};

export function Ambient() {
  useEffect(() => {
    const root = document.documentElement;
    const set = (id: string) => {
      const t = TINTS[id] ?? TINTS.top;
      root.style.setProperty("--amb-a", t[0]);
      root.style.setProperty("--amb-b", t[1]);
    };
    set("top");
    const els = HOME_SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || !("IntersectionObserver" in window)) return;
    // the section crossing the middle of the screen owns the tint
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) set(e.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <div aria-hidden="true" className="ambient pointer-events-none fixed inset-0 z-0" />;
}
