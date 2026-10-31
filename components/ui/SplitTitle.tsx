import { G, type Tone } from "./Bits";

/**
 * Section heading text: plain words + the accent words in the section colour (`<G>`), `stack` puts the accent on its
 * own line. Marked `data-split`: Motion (GSAP SplitText) splits it into lines when it nears the viewport and lets
 * each line rise out of a mask, then restores this markup. Hidden until then only when JS runs (globals.css).
 */
export function SplitTitle({ text, accent, tone = "aurora", stack = false }: { text: string; accent?: string; tone?: Tone; stack?: boolean }) {
  return (
    <span data-split className="block">
      {text}
      {accent && (
        <>
          {stack ? <br /> : " "}
          <G tone={tone}>{accent}</G>
        </>
      )}
    </span>
  );
}
