"use client";

import dynamic from "next/dynamic";

// Branch bg-gradient: the soft interactive gradient (Glow.tsx) instead of the star field (StarField.tsx, unchanged).
const Glow = dynamic(() => import("./Glow"), { ssr: false });

export function Scene() {
  return <Glow />;
}
