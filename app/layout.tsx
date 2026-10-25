import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import { Ambient } from "@/components/Ambient";
import { Intro } from "@/components/Intro";
import { Nav } from "@/components/Nav";
import { Scene } from "@/components/Scene";
import { Footer } from "@/components/sections/Footer";
import { CardFx } from "@/components/ui/CardFx";
import { HideOn } from "@/components/ui/HideOn";
import { RevealRoot } from "@/components/ui/RevealRoot";
import { META } from "@/lib/content";
import "./globals.css";

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geologica",
  display: "swap",
});

// pages without ivy, nav and footer (none on the studio site yet)
const FOCUSED: string[] = [];

export const metadata: Metadata = {
  title: { default: META.title, template: "%s · MaxArt Digital" },
  description: META.description,
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
        {/* "intro": first load of a tab session plays the «MaxArt Digital» title card (Intro); the boot then waits until 2.0s */}
        {/* "booting": hero, nav and stars wait for the star field's first frame, then come in together (safety timeout 1.8s) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement,t=1800;d.classList.add('js','booting');try{if(!sessionStorage.getItem('intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sessionStorage.setItem('intro','1');d.classList.add('intro');t=window.__introEnd=2000;setTimeout(function(){d.classList.remove('intro')},2600)}}catch(e){}setTimeout(function(){d.classList.remove('booting')},t)",
          }}
        />
      </head>
      <body>
        <Intro />
        {/* shared on every page (except FOCUSED ones): fixed ivy scene, nav, footer; reveal + card layers always */}
        <HideOn paths={FOCUSED}>
          <Ambient />
          <Scene />
          <Nav />
        </HideOn>
        {/* overflow-x-clip: the .plate halos (inset -12%) must never widen the page */}
        <main id="main" className="relative z-[2] overflow-x-clip">
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
