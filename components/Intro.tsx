import { G } from "@/components/ui/Bits";
import { BRAND } from "@/lib/content";

/**
 * Opening title: «MaxArt Digital» on the page colour, first visit of a tab session only.
 * Pure CSS (no hydration wait): the head script sets html.intro, the letters rise out of a blur,
 * the word lifts away and the screen fades while the boot reveals the site underneath.
 * Hidden without JS, on repeat loads and under reduced motion. Timings in globals.css («intro»).
 */
export function Intro() {
  const [a, b] = BRAND.wordmark;
  return (
    <div className="intro-screen" aria-hidden="true">
      <div className="intro-word text-mega font-semibold leading-none tracking-[-0.04em] text-fg">
        {[...a].map((ch, i) => (
          <span key={i} className="intro-l" style={{ "--i": i } as React.CSSProperties}>
            {ch}
          </span>
        ))}{" "}
        <span className="intro-l intro-accent" style={{ "--i": a.length + 2 } as React.CSSProperties}>
          <G tone="aurora">{b}</G>
        </span>
        <span className="intro-line" />
      </div>
    </div>
  );
}
