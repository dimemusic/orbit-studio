import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import { Ambient } from "@/components/Ambient";
import { Intro } from "@/components/Intro";
import { LangProvider } from "@/components/Lang";
import { Nav } from "@/components/Nav";
import { Scene } from "@/components/Scene";
import { Footer } from "@/components/sections/Footer";
import { CardFx } from "@/components/ui/CardFx";
import { RevealRoot } from "@/components/ui/RevealRoot";
import type { Lang } from "@/lib/content";
import { contentFor, SITE_URL } from "@/lib/i18n";
import "@/app/globals.css";

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geologica",
  display: "swap",
});

/** site-wide metadata defaults; each page adds its own canonical / hreflang / social card (lib/seo.ts) */
export function shellMetadata(lang: Lang): Metadata {
  const { META } = contentFor(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: META.title, template: "%s · MaxArt Digital" },
    description: META.description,
    applicationName: "MaxArt Digital",
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
  viewportFit: "cover",
};

/** the whole page frame (html, background, nav, footer); each language root layout renders it */
export function Shell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} className={geologica.variable} suppressHydrationWarning>
      {/* root layout <head> (App Router), not next/head: Shell is rendered by app/(uk|en)/layout.tsx */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
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
        <LangProvider lang={lang}>
          <Intro />
          {/* fixed background layers (below everything) and the floating nav */}
          <Ambient />
          <Scene />
          <Nav />
          {/* overflow-x-clip: the .plate halos (inset -12%) must never widen the page */}
          <main id="main" className="relative z-[2] overflow-x-clip">
            {children}
          </main>
          <div className="relative z-[2]">
            <Footer />
          </div>
          <RevealRoot />
          <CardFx />
        </LangProvider>
      </body>
    </html>
  );
}
