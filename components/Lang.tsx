"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Lang } from "@/lib/content";
import { DICT } from "@/lib/i18n";

const Ctx = createContext<Lang>("uk");

/** set once per page tree by the language's root layout */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
/** all copy of the current language (same shape for uk and en) */
export const useContent = () => DICT[useContext(Ctx)];
