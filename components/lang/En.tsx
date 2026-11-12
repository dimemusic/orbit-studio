"use client";

import type { ReactNode } from "react";
import { en } from "@/lib/content.en";
import { LangProvider } from "../Lang";

/** English copy for the client components of the `/en` tree (rendered by app/(en)/layout.tsx) */
export function EnLang({ children }: { children: ReactNode }) {
  return (
    <LangProvider lang="en" content={en}>
      {children}
    </LangProvider>
  );
}
