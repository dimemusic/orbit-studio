import type { ReactNode } from "react";
import { ACCENT, type Accent } from "./accent";

// Pills: ≥12px text, 6px 12px padding, coloured text on a 12% tint of the same colour.
const PILL = "inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none";

/** Section eyebrow: tinted pill, coloured dot, uppercase label. */
export function Eyebrow({ color = "blue", children }: { color?: Accent; children: ReactNode }) {
  const a = ACCENT[color];
  return (
    <span className={`${PILL} gap-2 uppercase tracking-[0.12em] ${a.text} ${a.tint}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${a.dot}`} />
      {children}
    </span>
  );
}

/** Accent colour of key words in headings, one per section (see .tg-* in globals.css; other tones fall back to violet). */
export type Tone = "aurora" | "violet" | "teal" | "amber" | "calm" | "mind" | "spark" | "shield" | "ice" | "warm" | "fresh" | "soft";

/** Key words in a heading, in the section's accent colour. */
export function G({ tone = "aurora", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`text-gradient tg-${tone}`}>{children}</span>;
}

/** Chip for specs, file types, sizes. Neutral when no colour is given. */
export function Tag({ color, children }: { color?: Accent; children: ReactNode }) {
  return (
    <span className={`${PILL} ${color ? `${ACCENT[color].text} ${ACCENT[color].tint}` : "bg-white/[0.07] text-fg/85"}`}>
      {children}
    </span>
  );
}
