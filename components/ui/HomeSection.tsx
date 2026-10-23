import Link from "next/link";
import type { ReactNode } from "react";
import { homeNum, type HomeId } from "../home";
import type { Accent } from "./accent";
import { Eyebrow } from "./Bits";

type Props = {
  id: HomeId;
  label: string;
  color: Accent;
  title: ReactNode;
  /** max one line */
  lead?: ReactNode;
  /** small «Детальніше →» link in the header; label is the accessible name */
  more?: { href: string; label: string };
  /** about one screen tall, content centered vertically (md+ only, never forced on phones) */
  tall?: boolean;
  children: ReactNode;
};

/**
 * The one layout for every home section after the hero:
 * centered header (NN · label pill → heading, max 2 lines → one line of subtext → optional small link),
 * 48px, then ONE content block at full width (inside the side gutter). Same vertical padding everywhere.
 */
export function HomeSection({ id, label, color, title, lead, more, tall, children }: Props) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`relative flex w-full flex-col items-center px-gutter py-[clamp(96px,12vh,160px)] text-center ${
        tall ? "md:min-h-[100dvh] md:justify-center" : ""
      }`}
    >
      <header className="plate flex flex-col items-center px-4">
        <div data-reveal>
          <Eyebrow color={color}>
            <span className="tabular-nums">{homeNum(id)} · </span>
            {label}
          </Eyebrow>
        </div>
        <h2 id={titleId} data-reveal style={{ ["--d" as string]: "80ms" }} className="legible mt-5 max-w-[22ch] text-section font-semibold">
          {title}
        </h2>
        {lead && (
          <p data-reveal style={{ ["--d" as string]: "160ms" }} className="legible mt-4 max-w-[64ch] text-[18px] leading-[1.5] text-body">
            {lead}
          </p>
        )}
        {more && (
          <Link
            href={more.href}
            aria-label={more.label}
            data-reveal
            style={{ ["--d" as string]: "200ms" }}
            className="legible group mt-3 inline-flex items-center gap-1 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
          >
            Детальніше
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )}
      </header>
      <div className="mt-12 flex w-full flex-col items-center">{children}</div>
    </section>
  );
}
