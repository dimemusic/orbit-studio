"use client";

import type { ReactNode } from "react";
import { uk } from "@/lib/content";
import { LangProvider } from "../Lang";

/** Ukrainian copy for the client components of the `/` tree (rendered by app/(uk)/layout.tsx) */
export function UkLang({ children }: { children: ReactNode }) {
  return (
    <LangProvider lang="uk" content={uk}>
      {children}
    </LangProvider>
  );
}
