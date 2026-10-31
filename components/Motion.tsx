"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The site's motion layer (GSAP, loaded lazily after hydration so it never touches the first paint / LCP).
 * One personality everywhere, «premium»: decelerating entrances (power3 / power4 out), no overshoot,
 * three durations (0.35 quick · 0.9 standard · 1.15 slow), staggers ≤ 0.5s in total.
 *
 * - Scroll reveals: every `[data-split]` heading and `[data-reveal]` block is hidden until it nears the viewport
 *   (CSS: `.js [data-reveal]:not([data-in])`); elements entering together play as ONE choreography in DOM order
 *   (heading lines rise out of a mask → lead → cards), 80ms apart. Variants via the attribute value:
 *   `data-reveal` (rise + fade) · `="card"` (rise, the screenshot frame opens like a curtain, the shot settles from 112%) ·
 *   `="row"` (short rise, icon tile scales in). Played once; nothing is scrubbed to the scroll (scrubbed motion
 *   on a native scroll lags a frame behind and reads as jitter).
 * - Magnetic buttons: `[data-magnetic]` (big buttons) lean towards the cursor, the label a bit more (depth). Fine pointers only.
 * - In-page links (`#id`): an eased scroll (power3.inOut, length-aware), stops as soon as the visitor scrolls.
 * Reduced motion or a failed load: everything is shown at once, links jump natively.
 * The hero is NOT animated here: it is pure CSS on the boot (see globals.css «hero»), so it never waits for JS.
 */
const SELECTOR = "[data-reveal]:not([data-in]), [data-split]:not([data-in])";
const STEP = 0.08;

export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const show = (el: Element) => el.setAttribute("data-in", "");
    const showAll = () => document.querySelectorAll(SELECTOR).forEach(show);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/SplitText"), import("gsap/ScrollToPlugin"), document.fonts?.ready])
      .then(([{ gsap }, { SplitText }, { ScrollToPlugin }]) => {
        if (cancelled) return;
        gsap.registerPlugin(SplitText, ScrollToPlugin);
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        // everything created here (and in the observer callbacks, via ctx.add) is reverted on unmount / route change
        const ctx = gsap.context(() => {});

        /** one element's entrance, placed at `at` on the shared timeline */
        const enter = (tl: gsap.core.Timeline, el: HTMLElement, at: number) => {
          show(el);
          if (el.hasAttribute("data-split")) {
            const split = SplitText.create(el, { type: "lines", linesClass: "sl", mask: "lines" });
            tl.from(split.lines, { yPercent: 115, duration: 1.15, ease: "power4.out", stagger: 0.1 }, at);
            // back to the plain markup once settled (resizes reflow normally, screen readers read one heading)
            tl.call(() => split.revert(), undefined, at + 1.15 + split.lines.length * 0.1);
            return;
          }
          const kind = el.getAttribute("data-reveal");
          if (kind === "card") {
            const frame = el.querySelector<HTMLElement>(".work-frame");
            const shot = el.querySelector<HTMLElement>(".work-view");
            tl.from(el, { y: 56, autoAlpha: 0, duration: 1, ease: "power3.out", clearProps: "transform,opacity,visibility" }, at);
            if (frame) tl.from(frame, { clipPath: "inset(100% 0% 0% 0% round 16px)", duration: 1.15, ease: "power4.out", clearProps: "clipPath" }, at);
            if (shot) tl.from(shot, { scale: 1.12, duration: 1.4, ease: "power3.out", clearProps: "transform" }, at);
            return;
          }
          if (kind === "row") {
            const icon = el.querySelector<HTMLElement>("[data-row-icon]");
            tl.from(el, { y: 24, autoAlpha: 0, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity,visibility" }, at);
            if (icon) tl.from(icon, { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity,visibility" }, at + 0.12);
            return;
          }
          tl.from(el, { y: 36, autoAlpha: 0, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity,visibility" }, at);
        };

        const play = (els: Element[]) => {
          const fresh = (els as HTMLElement[])
            .filter((el) => !el.hasAttribute("data-in"))
            .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
          if (!fresh.length) return;
          const tl = gsap.timeline();
          // total stagger stays under ~0.5s however many enter at once
          const step = Math.min(STEP, 0.5 / fresh.length);
          fresh.forEach((el, i) => enter(tl, el, i * step));
        };

        // an IntersectionObserver (not ScrollTrigger: its refreshes force a layout per trigger, ~1s of main thread
        // on a phone) hands over everything that entered in the same frame as one batch. Its root reaches far above
        // the screen, so a block that a fast scroll or a jump link carried straight past counts too (shown, not played)
        const io = new IntersectionObserver(
          (entries) => {
            const due = entries.filter((e) => e.isIntersecting);
            if (!due.length) return;
            due.forEach((e) => io.unobserve(e.target));
            const above = (e: IntersectionObserverEntry) => e.boundingClientRect.bottom < 0;
            due.filter(above).forEach((e) => show(e.target));
            ctx.add(() => play(due.filter((e) => !above(e)).map((e) => e.target)));
          },
          { rootMargin: "100000px 0px -12% 0px" },
        );
        document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));

        // magnetic big buttons (fine pointers)
        const offMagnet: (() => void)[] = [];
        if (fine) {
          document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
            const label = btn.querySelector<HTMLElement>("[data-magnetic-label]");
            const bx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
            const by = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
            const lx = label && gsap.quickTo(label, "x", { duration: 0.5, ease: "power3.out" });
            const ly = label && gsap.quickTo(label, "y", { duration: 0.5, ease: "power3.out" });
            const move = (e: PointerEvent) => {
              const r = btn.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              bx(gsap.utils.clamp(-10, 10, dx * 0.18));
              by(gsap.utils.clamp(-8, 8, dy * 0.3));
              lx?.(gsap.utils.clamp(-5, 5, dx * 0.08));
              ly?.(gsap.utils.clamp(-3, 3, dy * 0.12));
            };
            const leave = () => {
              gsap.to(label ? [btn, label] : btn, { x: 0, y: 0, duration: 0.8, ease: "power3.out", overwrite: true });
            };
            btn.addEventListener("pointermove", move);
            btn.addEventListener("pointerleave", leave);
            offMagnet.push(() => {
              btn.removeEventListener("pointermove", move);
              btn.removeEventListener("pointerleave", leave);
              gsap.set(label ? [btn, label] : btn, { clearProps: "transform" });
            });
          });
        }

        // in-page links: one eased scroll, length-aware, cancelled by the visitor's own scroll
        const onClick = (e: MouseEvent) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
          if (!a || a.target === "_blank") return;
          const url = new URL(a.href, location.href);
          if (!url.hash || url.pathname !== location.pathname || url.origin !== location.origin) return;
          const target = url.hash === "#top" ? document.body : document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (!target) return;
          e.preventDefault();
          const y = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY;
          const dist = Math.abs(y - window.scrollY);
          history.pushState(null, "", url.hash);
          // html { scroll-behavior: smooth } would turn every tween step into its own smooth scroll
          document.documentElement.style.scrollBehavior = "auto";
          gsap.to(window, {
            scrollTo: { y, autoKill: true },
            duration: gsap.utils.clamp(0.7, 1.5, 0.55 + dist / 3200),
            ease: "power3.inOut",
            overwrite: true,
            onComplete: () => {
              document.documentElement.style.scrollBehavior = "";
              // keyboard users continue from the section they jumped to
              if (target !== document.body) {
                if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
                target.focus({ preventScroll: true });
              }
            },
            onInterrupt: () => {
              document.documentElement.style.scrollBehavior = "";
            },
          });
        };
        // capture phase: runs before next/link, whose own navigation then sees defaultPrevented and steps aside
        // (the link's onClick props, like closing the menu or picking a plan, still run)
        document.addEventListener("click", onClick, true);

        cleanup = () => {
          document.removeEventListener("click", onClick, true);
          offMagnet.forEach((f) => f());
          io.disconnect();
          ctx.revert();
        };
      })
      .catch(showAll);

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
