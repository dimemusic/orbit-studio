"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Logo } from "./ui/Logo";
import { otherPath } from "@/lib/i18n";
import { useContent, useLang } from "./Lang";

/** page links are active on their own route; home anchors never are */
const isActive = (href: string, path: string) => !href.includes("#") && path.startsWith(href);

export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { BRAND, CTA, NAV: LINKS, UI } = useContent();

  // close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onWide = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWide);
    };
  }, [open]);

  // tucks away while scrolling down (more room for the page), comes back on scroll up, near the top,
  // when the cursor reaches the top edge, or while the menu is open / focus is inside
  const bar = useRef<HTMLElement>(null);
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const el = bar.current;
      if (open || (el && el.contains(document.activeElement)) || y < 120) setTucked(false);
      else if (y > last + 6) setTucked(true);
      else if (y < last - 6) setTucked(false);
      if (Math.abs(y - last) > 6 || y < 120) last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => e.pointerType === "mouse" && e.clientY < 90 && setTucked(false);
    const onFocus = () => setTucked(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    bar.current?.addEventListener("focusin", onFocus);
    const el = bar.current;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      el?.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <header ref={bar} data-boot data-tucked={tucked || undefined} className="nav-bar fixed inset-x-0 top-0 z-30 px-[clamp(12px,2.5vw,32px)] pt-[calc(12px+env(safe-area-inset-top))]">
      <a
        href="#main"
        className="sr-only rounded-full bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        {UI.skip}
      </a>

      {/* floating card bar (slightly lighter than content cards) */}
      <div className="card card-nav">
        <nav aria-label={UI.mainNav} className="flex h-16 items-center gap-6 pl-5 pr-2.5">
          <Link href={CTA.home} aria-label={`${BRAND.name}, ${UI.toHome}`} className="shrink-0">
            <Logo />
          </Link>

          {/* gap grows with width: 40px floor, 64px at 1280, 76px from 1440; below lg the links live in the mobile menu */}
          <ul className="hidden flex-1 items-center justify-center gap-6 lg:flex lg:gap-[clamp(40px,calc(7.5vw_-_32px),76px)]">
            {LINKS.map((l) => {
              const on = isActive(l.href, pathname);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    className={`relative inline-block whitespace-nowrap py-2.5 text-[14px] transition-colors duration-300 hover:text-fg ${
                      on ? "text-fg" : "text-body"
                    }`}
                  >
                    {l.label}
                    {on && <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 mx-auto size-1 rounded-full bg-blue" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-4 lg:ml-0 lg:gap-6">
            {/* language switch: in the bar from 400px up, in the mobile menu on the narrowest phones */}
            <LangSwitch className="hidden xs:flex" />
            {/* wrapper owns visibility: the Button base class is inline-flex and would override `hidden` */}
            <span className="hidden sm:contents">
              <Button href={CTA.primaryHref} size="nav">
                {CTA.primary}
              </Button>
            </span>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
              className="btn-secondary inline-flex h-11 items-center rounded-full px-4 text-[14px] lg:hidden"
            >
              {open ? UI.close : UI.menu}
            </button>
          </div>
        </nav>

        <div id={menuId} hidden={!open} className="nav-menu border-t border-white/10 px-5 pb-7 pt-3 lg:hidden">
          <ul className="flex flex-col items-center gap-1 text-center">
            {LINKS.map((l, i) => {
              const on = isActive(l.href, pathname);
              return (
                <li key={l.href} style={{ ["--i" as string]: i }}>
                  <Link
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block py-2.5 text-[20px] tracking-[-0.02em] ${on ? "text-blue" : "text-fg"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-center xs:hidden" style={{ ["--i" as string]: LINKS.length }}>
            <LangSwitch />
          </div>
          <div className="mt-4 flex justify-center" style={{ ["--i" as string]: LINKS.length + 1 }}>
            <Button href={CTA.primaryHref} onClick={() => setOpen(false)} className="w-full max-w-xs">
              {CTA.primary}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

/** UA / EN: plain links (each language has its own root layout, so switching is a full page load) */
function LangSwitch({ className = "flex" }: { className?: string }) {
  const pathname = usePathname();
  const lang = useLang();
  const { UI } = useContent();
  return (
    <span role="group" aria-label={UI.lang} className={`${className} items-center rounded-full border border-white/[0.12] p-1 text-[13px] font-semibold`}>
      {(["uk", "en"] as const).map((l) => (
        <a
          key={l}
          href={otherPath(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          className={`grid h-8 min-w-9 place-items-center rounded-full px-2 transition-colors duration-200 ${
            l === lang ? "bg-white/[0.1] text-fg" : "text-grey hover:text-fg"
          }`}
        >
          {l === "uk" ? "UA" : "EN"}
        </a>
      ))}
    </span>
  );
}
