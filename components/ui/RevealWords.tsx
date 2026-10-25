import { Fragment } from "react";
import { G, type Tone } from "./Bits";

/**
 * Section heading that comes in word by word: each word rises 0.4em out of a 10px blur and fades in, 70ms apart.
 * Rides on RevealRoot: the wrapper is a [data-reveal][data-words] (RevealRoot sets data-in), the CSS in globals.css
 * keeps the wrapper itself still and animates only the words. Settled words carry no transform / filter.
 * `accent` words get the gradient (one <G> per word, so the clip survives the per-word transform).
 */
/** `stack`: the accent words start on a new line */
export function RevealWords({ text, accent, tone = "aurora", stack = false }: { text: string; accent?: string; tone?: Tone; stack?: boolean }) {
  const plain = text.split(" ").filter(Boolean);
  const hot = accent ? accent.split(" ").filter(Boolean) : [];
  const words = [...plain.map((w) => ({ w, hot: false })), ...hot.map((w) => ({ w, hot: true }))];
  return (
    <span data-reveal data-words className="block">
      {words.map(({ w, hot }, i) => (
        <Fragment key={i}>
          {i > 0 && (stack && hot && i === plain.length ? <br /> : " ")}
          <span className="rw" style={{ ["--i" as string]: i }}>
            {hot ? <G tone={tone}>{w}</G> : w}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
