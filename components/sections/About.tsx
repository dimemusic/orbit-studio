import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { ABOUT } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";

/** About: the two people the client talks to (photo or initials), then three short promises in one row. */
export function About() {
  return (
    <HomeSection
      id="about"
      label={ABOUT.label}
      color="violet"
      title={
        <>
          {ABOUT.title[0]} <G tone="warm">{ABOUT.title[1]}</G>
        </>
      }
      lead={ABOUT.lead}
    >
      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {ABOUT.people.map((p, i) => (
          <li key={p.id} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
            <article className="card group flex h-full items-center gap-6 p-5 text-left sm:p-6">
              <span className={`relative grid aspect-[4/5] w-[120px] shrink-0 place-items-center overflow-hidden rounded-xl sm:w-[148px] ${ACCENT[p.color].tint}`}>
                {p.photo ? (
                  <Image src={p.photo} alt={p.name} fill sizes="148px" className="object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.05]" />
                ) : (
                  <span aria-hidden="true" className={`text-[44px] font-semibold tracking-[-0.04em] ${ACCENT[p.color].text}`}>
                    {p.initials}
                  </span>
                )}
              </span>
              <div>
                <h3 className="text-headline font-semibold">{p.name}</h3>
                <p className={`mt-1 text-[14px] font-medium ${ACCENT[p.color].text}`}>{p.role}</p>
                <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-body">{p.text}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <ul data-reveal style={{ ["--d" as string]: "200ms" }} className="card mt-4 grid w-full grid-cols-1 text-left sm:grid-cols-3">
        {ABOUT.values.map((v, i) => (
          <li key={v.title} className={`flex items-start gap-3 p-6 ${i > 0 ? "border-t border-white/[0.07] sm:border-l sm:border-t-0" : ""}`}>
            <CheckCircle size={20} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-green" />
            <div>
              <p className="text-[16px] font-semibold text-fg">{v.title}</p>
              <p className="mt-0.5 text-[14px] text-body">{v.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
