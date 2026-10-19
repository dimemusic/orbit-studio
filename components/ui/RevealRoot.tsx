"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer per page: fades/slides each [data-reveal] in as it enters the viewport. Re-scans on route change.
 * IMPORTANT: the "shown" flag is the data-in ATTRIBUTE, never a class. React rewrites className on re-render
 * (e.g. opening an FAQ item), which would wipe a class and hide the element again. CSS: .js [data-reveal][data-in].
 */
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    const show = (el: Element) => el.setAttribute("data-in", "");
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in]):not([data-rv])"));

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    const watch = () =>
      pending().forEach((el) => {
        el.dataset.rv = "";
        io.observe(el);
      });
    watch();

    // elements that mount later (e.g. the desktop / phone variant of a section) are picked up too
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      // let the next page's scan observe anything still waiting
      document.querySelectorAll<HTMLElement>("[data-reveal][data-rv]:not([data-in])").forEach((el) => delete el.dataset.rv);
    };
  }, [pathname]);
  return null;
}
