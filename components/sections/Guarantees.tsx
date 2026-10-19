import { ArrowsClockwise, Lifebuoy, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { GUARANTEES } from "@/lib/content";
import { G, IconTile } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";

const ICONS = [ArrowsClockwise, LockSimple, Lifebuoy];

/** 08 Risk reversal: three equal cards (same grid as the old «Знайомо?» cards), icon tile, short title, one line. */
export function Guarantees() {
  return (
    <HomeSection
      id="guarantees"
      label={GUARANTEES.label}
      color="green"
      title={
        <>
          {GUARANTEES.title[0]} <G tone="shield">{GUARANTEES.title[1]}</G>
        </>
      }
      lead={GUARANTEES.lead}
    >
      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
        {GUARANTEES.items.map((g, i) => {
          const Icon = ICONS[i];
          return (
            <li key={g.title} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
              <div className="card flex h-full flex-col p-6 text-left sm:p-7">
                <IconTile color={g.color}>
                  <Icon size={22} weight="light" />
                </IconTile>
                <h3 className="mt-5 text-title font-semibold">{g.title}</h3>
                <p className="mt-1.5 text-[15px] text-body">{g.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
