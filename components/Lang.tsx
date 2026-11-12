"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Content, Lang } from "@/lib/content";

type Value = { lang: Lang; content: Content };
const Ctx = createContext<Value | null>(null);

/**
 * Set once per page tree by the language's root layout through `lang/Uk.tsx` or `lang/En.tsx`: each of those imports
 * only its own content file, so a visitor downloads the copy of one language, not both.
 */
export function LangProvider({ lang, content, children }: Value & { children: ReactNode }) {
  return <Ctx.Provider value={{ lang, content }}>{children}</Ctx.Provider>;
}

const useValue = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useContent() needs a language provider (components/lang/Uk.tsx or En.tsx) above it");
  return v;
};

export const useLang = () => useValue().lang;
/** all copy of the current language (same shape for uk and en) */
export const useContent = () => useValue().content;
