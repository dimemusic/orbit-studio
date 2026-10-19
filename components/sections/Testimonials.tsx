import { Quotes, User } from "@phosphor-icons/react/dist/ssr";
import { TEAM } from "@/lib/content";
import { ACCENT } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";

/**
 * 07 Team + testimonial: two people cards with photo placeholders, then ONE quote card
 * (same layout as the old Proof card: quote left, client right).
 */
export function Team() {
  const q = TEAM.quote;
  return (
    <HomeSection
      id="team"
      label={TEAM.label}
      color="violet"
      title={
        <>
          {TEAM.title[0]} <G tone="warm">{TEAM.title[1]}</G>
        </>
      }
      lead={TEAM.lead}
    >
      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {TEAM.people.map((p, i) => {
          const a = ACCENT[p.color];
          return (
            <li key={p.role} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
              <div className="card flex h-full items-center gap-5 p-5 text-left sm:p-6">
                {/* photo placeholder */}
                <span
                  className={`relative grid aspect-square w-24 shrink-0 place-items-center overflow-hidden rounded-xl border sm:w-28 ${a.border} ${a.tint}`}
                >
                  <User size={36} weight="light" aria-hidden="true" className={a.text} />
                  <span className="absolute inset-x-0 bottom-1.5 text-center text-[11px] text-grey">{TEAM.photo}</span>
                </span>
                <div className="min-w-0">
                  <h3 className="text-title font-semibold">{p.name}</h3>
                  <div className="mt-2">
                    <Tag color={p.color}>{p.role}</Tag>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div data-reveal className="mt-4 w-full">
        <figure className="card grid grid-cols-1 text-left lg:grid-cols-[1fr_280px]">
          <div className="px-6 py-10 sm:px-12">
            <Quotes size={28} weight="fill" aria-hidden="true" className="text-[#f9a8d4]" />
            <blockquote className="mt-5 max-w-[34ch] text-[clamp(22px,2.2vw,32px)] font-medium leading-[1.25] tracking-[-0.025em]">
              «{q.text}»
            </blockquote>
          </div>
          <figcaption className="flex items-center gap-3 border-t border-white/[0.07] px-6 py-8 sm:px-12 lg:border-l lg:border-t-0 lg:px-10">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-green/35 bg-green/12 text-[13px] font-semibold text-green"
            >
              {q.initials}
            </span>
            <span>
              <span className="block text-[15px] font-medium text-fg">{q.name}</span>
              <span className="block text-[13px] text-grey" translate="no">
                {q.role}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </HomeSection>
  );
}
