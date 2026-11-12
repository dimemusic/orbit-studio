"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { uk, type Lang } from "@/lib/content";
import { en } from "@/lib/content.en";
import { LangProvider } from "../Lang";

const none = () => () => {};
const fromPath = (): Lang => (/^\/en(\/|$)/.test(window.location.pathname) ? "en" : "uk");

/**
 * Copy for the 404 page only (app/global-not-found.tsx). That page is ONE static file for every unknown address, so
 * it is built in Ukrainian and switches to English in the browser when the address starts with /en. The only place
 * that loads both languages.
 */
export function AutoLang({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore<Lang>(none, fromPath, () => "uk");
  useEffect(() => {
    if (lang === "en") document.documentElement.lang = "en";
  }, [lang]);
  return (
    <LangProvider lang={lang} content={lang === "en" ? en : uk}>
      {children}
    </LangProvider>
  );
}
