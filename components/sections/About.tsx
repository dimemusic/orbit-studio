"use client";

import { Browsers, CalendarCheck, ChatCircleDots, StackSimple } from "@phosphor-icons/react/dist/ssr";
import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { ABOUT, TEAM, WORK } from "@/lib/content";
import { G, type Tone } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";

// manifesto: plain text splits into words, highlighted phrases stay one unit (colour applied once lit)
const PARTS: { text: string; hl?: string }[] = ABOUT.manifesto;

// tail = punctuation glued to the unit, so a line never starts with ":"
type Unit = { text: string; hl?: string; tail?: string };

const UNITS: Unit[] = PARTS.reduce<Unit[]>((acc, p) => {
  if (p.hl) return [...acc, { text: p.text, hl: p.hl }];
  const lead = p.text.match(/^[.,:;]+/)?.[0];
  if (lead && acc.length) acc[acc.length - 1] = { ...acc[acc.length - 1], tail: lead };
  const words = p.text.slice(lead?.length ?? 0).trim().split(/\s+/).filter(Boolean);
  return [...acc, ...words.map((text) => ({ text }))];
}, []);

const AVATAR_BG = ["#a78bfa", "#3d8bff"];

const TIMELINE = [
  { at: "0%", t: "Бриф" },
  { at: "50%", t: "Дизайн" },
  { at: "100%", t: "Запуск" },
];

const CHIPS = ["Дизайн", "Код", "Панель керування"];

const [F_SITES, F_WEEKS, F_ONE, F_FREE] = ABOUT.facts;

/** 03: who we are. Word-by-word manifesto, then the four trust numbers as glass fact cards. */
export function About() {
  return (
    <HomeSection
      id="about"
      label={ABOUT.label}
      color="violet"
      title={
        <span className="mx-auto block max-w-[18ch] text-balance font-medium leading-[1.04] tracking-[-0.04em]">
          {ABOUT.title[0]} <G tone="mind">{ABOUT.title[1]}</G>
        </span>
      }
    >
      <Manifesto />

      <ul className="mt-12 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact value={F_SITES.value} label={F_SITES.label} i={0} tone="warm" color="#f9a8d4" Icon={Browsers}>
          <div className="flex flex-wrap gap-1.5">
            {WORK.cases.slice(0, 2).map((c) => (
              <span key={c.id} translate="no" className="rounded-full border border-white/[0.08] px-2.5 py-[5px] text-[12px] font-medium text-body">
                {c.name}
              </span>
            ))}
          </div>
        </Fact>

        <Fact value={F_WEEKS.value} label={F_WEEKS.label} i={1} tone="mind" color="#a78bfa" Icon={CalendarCheck}>
          <div className="min-w-0 flex-1 px-1.5">
            <div className="relative h-[2px] rounded-[2px] bg-white/[0.08]">
              <span aria-hidden="true" className="absolute inset-0 rounded-[2px] bg-gradient-to-r from-violet-soft to-blue" />
              {TIMELINE.map((p, k) => (
                <Fragment key={p.t}>
                  <i
                    aria-hidden="true"
                    style={{ left: p.at }}
                    className={`absolute top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] ${
                      k === 0 ? "border-violet-soft bg-bg" : k === 2 ? "border-blue bg-blue shadow-[0_0_12px_var(--color-blue)]" : "border-blue bg-bg"
                    }`}
                  />
                  <em
                    style={{ left: p.at }}
                    className={`absolute top-3 whitespace-nowrap text-[11px] font-medium not-italic text-body ${
                      k === 0 ? "translate-x-0 text-left" : k === 2 ? "-translate-x-full text-right" : "-translate-x-1/2"
                    }`}
                  >
                    {p.t}
                  </em>
                </Fragment>
              ))}
            </div>
          </div>
        </Fact>

        <Fact value={F_ONE.value} label={F_ONE.label} i={2} tone="calm" color="#22d3ee" Icon={StackSimple}>
          <div className="flex flex-wrap gap-1.5">
            {CHIPS.map((c) => (
              <span key={c} className="rounded-full border border-white/[0.08] px-2.5 py-[5px] text-[12px] font-medium text-body">
                {c}
              </span>
            ))}
          </div>
        </Fact>

        <Fact value={F_FREE.value} label={F_FREE.label} i={3} tone="fresh" color="#a3e635" Icon={ChatCircleDots}>
          <div className="flex" aria-hidden="true">
            {TEAM.people.map((a, k) => (
              <span
                key={a.name}
                style={{ background: AVATAR_BG[k] }}
                className="-ml-2 grid size-8 place-items-center rounded-full border-2 border-[#0c0f18] text-[11px] font-semibold text-[#0b0e16] first:ml-0"
              >
                {a.initials}
              </span>
            ))}
            <span className="-ml-2 grid size-8 place-items-center rounded-full border-2 border-[#0c0f18] bg-white/[0.08] text-[11px] font-semibold text-fg">
              Ви
            </span>
          </div>
        </Fact>
      </ul>
    </HomeSection>
  );
}

/** Glass card: micro-visual on top, number + label below. data-reveal sits on the wrapper, never on the blurred card. */
function Fact({
  value,
  label,
  i,
  tone,
  color,
  Icon,
  children,
}: {
  value: string;
  label: string;
  i: number;
  tone: Tone;
  /** first colour of the tone: tints the icon tile */
  color: string;
  Icon: typeof Browsers;
  children: ReactNode;
}) {
  return (
    <li data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className="min-w-0">
      <div className="flex h-full flex-col gap-[18px] rounded-[22px] border border-white/[0.08] bg-[rgb(12_15_24/0.66)] p-6 text-left backdrop-blur-[14px]">
        <div className="flex h-9 items-center">{children}</div>
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl"
              style={{ background: `${color}1f`, color }}
            >
              <Icon size={18} weight="duotone" />
            </span>
            <b className="block text-[32px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
              <G tone={tone}>{value}</G>
            </b>
          </div>
          <span className="mt-3 block text-[14px] text-body">{label}</span>
        </div>
      </div>
    </li>
  );
}

// unlit → lit is driven by the paragraph's data-in ATTRIBUTE (never a class); Tailwind v4 `translate-*` uses the `translate` property
const WORD =
  "inline-block opacity-10 blur-[6px] translate-y-[0.15em] transition-[opacity,filter,translate,color] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] " +
  "[[data-in]>&]:opacity-100 [[data-in]>&]:blur-none [[data-in]>&]:translate-y-0 " +
  "motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:translate-y-0 motion-reduce:transition-none";

/** Reveals word by word, once, when the paragraph enters the viewport (~1.5 s in total). */
function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-in", "");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.setAttribute("data-in", "");
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      className="plate legible max-w-[30em] text-[clamp(21px,2.1vw,31px)] font-normal leading-[1.55] tracking-[-0.02em] text-fg/90"
    >
      {UNITS.map((u, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={`${WORD} ${u.hl ?? ""}`} style={{ transitionDelay: `${i * 22}ms` }}>
            {u.text}
            {u.tail && <span className="text-fg/90">{u.tail}</span>}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
