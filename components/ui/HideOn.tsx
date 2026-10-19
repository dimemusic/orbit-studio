"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Site chrome (ivy, nav, footer) that stays out of focused pages such as /signup. */
export function HideOn({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname();
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ? null : <>{children}</>;
}
