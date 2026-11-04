"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * What visitors do, without touching every component:
 *  · click       any link / button: its label (data-track, aria-label or text), the section it sits in, link target
 *  · contact_link  Telegram / email links
 *  · section_view  each section once, when 40% of it was on screen (where people read to)
 *  · scroll_depth  25 / 50 / 75 / 100 % of the page, once each (where people stop)
 * Form steps and the send result are tracked in FinalCta. No text typed by the visitor is ever sent.
 */
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [role=button]");
      if (!el) return;
      const label = (el.dataset.track || el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
      if (!label) return;
      const section = el.closest<HTMLElement>("dialog") ? "dialog" : (el.closest<HTMLElement>("section[id], footer, nav")?.id || el.closest("footer")?.tagName.toLowerCase() || el.closest("nav")?.tagName.toLowerCase() || "page");
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";
      track("click", { label, section, path: pathname });
      if (/^mailto:|t\.me\/|telegram/i.test(href)) track("contact_link", { label: href.startsWith("mailto:") ? "email" : "telegram", section });
    };
    document.addEventListener("click", onClick, { capture: true });

    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const id = en.target.id;
          if (en.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            track("section_view", { section: id, path: pathname });
          }
        }
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));

    const marks = [25, 50, 75, 100];
    const hit = new Set<number>();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        const pct = ((window.scrollY / max) * 100) | 0;
        for (const m of marks) {
          if (pct < m - (m === 100 ? 2 : 0) || hit.has(m)) continue;
          hit.add(m);
          track("scroll_depth", { pct: m, path: pathname });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
