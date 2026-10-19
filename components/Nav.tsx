"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Logo } from "./ui/Logo";
import { BRAND, CTA, NAV } from "@/lib/content";

const LINKS = NAV;

/** page links are active on their own route; home anchors never are */
const isActive = (href: string, path: string) => !href.includes("#") && path.startsWith(href);

export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

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

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-[clamp(12px,2.5vw,32px)] pt-[calc(12px+env(safe-area-inset-top))]">
      <a
        href="#main"
        className="sr-only rounded-full bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Перейти до змісту
      </a>

      {/* floating card bar (slightly lighter than content cards) */}
      <div className="card card-nav">
        <nav aria-label="Головна навігація" className="flex h-16 items-center gap-6 pl-5 pr-2.5">
          <Link href="/" aria-label={`${BRAND.name}, на головну`} className="shrink-0">
            <Logo />
          </Link>

          {/* gap-6 = 24px minimum between every link */}
          <ul className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">
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

          <div className="ml-auto flex shrink-0 items-center gap-6 lg:ml-0">
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
              {open ? "Закрити" : "Меню"}
            </button>
          </div>
        </nav>

        <div id={menuId} hidden={!open} className="border-t border-white/10 px-5 pb-7 pt-3 lg:hidden">
          <ul className="flex flex-col items-center gap-1 text-center">
            {LINKS.map((l) => {
              const on = isActive(l.href, pathname);
              return (
                <li key={l.href}>
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
          <div className="mt-4 flex justify-center">
            <Button href={CTA.primaryHref} onClick={() => setOpen(false)} className="w-full max-w-xs">
              {CTA.primary}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
