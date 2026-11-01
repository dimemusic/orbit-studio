"use client";

import dynamic from "next/dynamic";

// Branch bg-test: the topographic background (Topo.tsx) instead of the star field (StarField.tsx, unchanged).
const Topo = dynamic(() => import("./Topo"), { ssr: false });

export function Scene() {
  return <Topo />;
}
