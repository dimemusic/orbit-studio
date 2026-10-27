"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser: the full-viewport star field behind the site.
const StarField = dynamic(() => import("./StarField"), { ssr: false });

export function Scene() {
  return <StarField />;
}
