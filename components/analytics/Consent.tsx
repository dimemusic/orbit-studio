"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useContent } from "../Lang";
import { Button } from "../ui/Button";

const KEY = "consent";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
export const CONSENT_OPEN = "consent:open";

/** the stored choice; localStorage can throw (private mode), then the banner just shows every visit */
const read = (): "yes" | "no" | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
};

function loadClarity(id: string) {
  if (window.clarity || document.getElementById("clarity-js")) return;
  const w = window as unknown as { clarity: ((...a: unknown[]) => void) & { q?: unknown[] } };
  w.clarity = function (...a: unknown[]) {
    (w.clarity.q = w.clarity.q || []).push(a);
  };
  const s = document.createElement("script");
  s.id = "clarity-js";
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(s);
}

/**
 * Cookie banner for Microsoft Clarity (heatmaps, session recordings). Clarity is loaded ONLY after «Allow»; without
 * NEXT_PUBLIC_CLARITY_ID nothing renders and nothing loads. Vercel Analytics needs no consent (no cookies).
 * The footer link «Налаштування cookies» reopens it (CONSENT_OPEN).
 */
export function Consent() {
  const { CONSENT, BRAND } = useContent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!CLARITY_ID) return;
    const c = read();
    if (c === "yes") loadClarity(CLARITY_ID);
    // ask only once the intro / boot is over (3s) AND the visitor did something (scroll, touch, pointer, key):
    // no banner sliding over a page nobody is looking at yet (it also kept the first screen «unfinished» for page-speed tests)
    const evs = ["scroll", "wheel", "pointerdown", "pointermove", "touchstart", "keydown"] as const;
    let ready = false;
    let acted = false;
    const tryOpen = () => {
      if (ready && acted) setOpen(true);
    };
    const act = () => {
      acted = true;
      evs.forEach((e) => window.removeEventListener(e, act));
      tryOpen();
    };
    const t = c === null ? window.setTimeout(() => {
            ready = true;
            tryOpen();
          }, 3000) : 0;
    if (c === null) evs.forEach((e) => window.addEventListener(e, act, { passive: true }));
    const again = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN, again);
    return () => {
      window.clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, act));
      window.removeEventListener(CONSENT_OPEN, again);
    };
  }, []);

  if (!CLARITY_ID || !open) return null;

  const choose = (v: "yes" | "no") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    if (v === "yes") loadClarity(CLARITY_ID);
    else window.clarity?.("consent", false); // stops recording and erases Clarity's cookies
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label={CONSENT.label}
      className="consent-in card fixed inset-x-4 bottom-4 z-[60] p-5 sm:right-auto sm:max-w-[28rem]"
    >
      <p className="text-base text-fg">{CONSENT.label}</p>
      <p className="mt-2 text-sm text-body">
        {CONSENT.text}{" "}
        <Link href={`${BRAND.privacyHref}#cookies`} className="text-body underline decoration-white/20 underline-offset-2 transition-colors hover:text-fg">
          {CONSENT.more}
        </Link>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button size="nav" variant="secondary" onClick={() => choose("no")} className="w-full">
          {CONSENT.decline}
        </Button>
        <Button size="nav" onClick={() => choose("yes")} className="w-full">
          {CONSENT.accept}
        </Button>
      </div>
    </div>
  );
}
