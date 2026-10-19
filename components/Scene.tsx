"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser. Full viewport ivy scene + its counter pill.
const IvyScene = dynamic(() => import("./IvyScene"), { ssr: false });

export function Scene() {
  return <IvyScene />;
}
