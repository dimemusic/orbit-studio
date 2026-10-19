import Link from "next/link";
import type { ReactNode } from "react";
import type { Accent } from "./accent";
import { Eyebrow } from "./Bits";

type Props = {
  id?: string;
  /** home sections: "02" is prefixed to the label → «02 · Як це працює» */
  num?: string;
  eyebrow?: { label: string; color: Accent };
  title?: ReactNode;
  /** max one line on the home page */
  lead?: ReactNode;
  /** stretch to the full viewport height and center the content vertically */
  tall?: boolean;
  /** quiet link to the section's inner page, shown after the content */
  more?: { href: string; label?: string };
  children?: ReactNode;
  className?: string;
};

/**
 * Full-bleed section: edge to edge, gutter padding only, content centered.
 * Header rhythm: eyebrow → 24px → heading → 24px → intro → 64–96px → content.
 * The header sits on a soft radial plate so it reads over the particles.
 */
export function Section({ id, num, eyebrow, title, lead, tall, more, children, className = "" }: Props) {
  const titleId = id && title ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`relative flex w-full flex-col items-center px-gutter py-[clamp(72px,11vw,168px)] text-center ${
        tall ? "md:min-h-[100dvh] md:justify-center" : ""
      } ${className}`}
    >
      {(eyebrow || title || lead) && (
        <header className="plate flex flex-col items-center px-4 py-6">
          {eyebrow && (
            <div data-reveal>
              <Eyebrow color={eyebrow.color}>
                {num && <span className="tabular-nums">{num} · </span>}
                {eyebrow.label}
              </Eyebrow>
            </div>
          )}
          {title && (
            <h2
              id={titleId}
              data-reveal
              style={{ ["--d" as string]: "80ms" }}
              className="legible mt-6 max-w-[16ch] text-display font-semibold"
            >
              {title}
            </h2>
          )}
          {lead && (
            <p
              data-reveal
              style={{ ["--d" as string]: "160ms" }}
              className="legible mt-6 max-w-[60ch] text-lead text-body"
            >
              {lead}
            </p>
          )}
        </header>
      )}
      {children && <div className="mt-[clamp(56px,6vw,96px)] flex w-full flex-col items-center">{children}</div>}
      {more && (
        <Link
          href={more.href}
          data-reveal
          className="legible group mt-12 inline-flex items-center gap-1.5 rounded-full py-2 text-[15px] text-body transition-colors hover:text-fg"
        >
          {more.label ?? "Детальніше"}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </section>
  );
}
