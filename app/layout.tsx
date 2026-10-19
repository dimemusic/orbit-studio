import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Scene } from "@/components/Scene";
import { Footer } from "@/components/sections/Footer";
import { CardFx } from "@/components/ui/CardFx";
import { HideOn } from "@/components/ui/HideOn";
import { RevealRoot } from "@/components/ui/RevealRoot";
import "./globals.css";

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geologica",
  display: "swap",
});

// pages without ivy, nav and footer: one-screen signup and the logged-in app
const FOCUSED = ["/signup", "/app"];

export const metadata: Metadata = {
  title: { default: "Cloud Sphere · хмара, що пам'ятає", template: "%s · Cloud Sphere" },
  description:
    "Хмара для креативних команд, що пам'ятає кожну версію, правку й експорт. Концепт для портфоліо.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={geologica.variable} suppressHydrationWarning>
      <head>
        {/* lets CSS hide [data-reveal] content only when JS will reveal it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {/* shared on every page (except FOCUSED ones): fixed ivy scene, nav, footer; reveal + card layers always */}
        <HideOn paths={FOCUSED}>
          <Scene />
          <Nav />
        </HideOn>
        <main id="main" className="relative z-[2]">
          {children}
        </main>
        <HideOn paths={FOCUSED}>
          <div className="relative z-[2]">
            <Footer />
          </div>
        </HideOn>
        <RevealRoot />
        <CardFx />
      </body>
    </html>
  );
}
