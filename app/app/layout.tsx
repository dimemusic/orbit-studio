import type { Metadata } from "next";
import { AppStoreProvider } from "@/components/app/store";

// the root layout hides the marketing chrome (ivy, nav, footer) on /app via FOCUSED;
// the store lives here so list state survives /app ↔ /app/file/[id]
export const metadata: Metadata = { title: "Моя хмара", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-bg">
      <AppStoreProvider>{children}</AppStoreProvider>
    </div>
  );
}
