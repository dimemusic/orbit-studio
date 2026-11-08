"use client";

import { ArrowRight, CheckCircle, Code, Lifebuoy, PenNib, SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useContent } from "../Lang";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { RevealWords } from "../ui/RevealWords";
import { AdminVis, CardVis, CorpVis, DesignVis, DevVis, LandingVis, ShopVis, Stage, SupportVis } from "../services/Visuals";
import { ICON, PlanDialog } from "./Pricing";

const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;
const DIR_ICON = { design: PenNib, dev: Code, admin: SlidersHorizontal, support: Lifebuoy } as const;
/** plan colours (same hues as the plan icons had) */
const PLAN_HEX = { card: "#22d3ee", landing: "#a78bfa", shop: "#34d399", corp: "#5aa2ff" } as const;

/**
 * «Наші послуги» (preview branch): what we do as four big cards, each with its own colour and a looping mini film
 * (design, development, admin panel, support; «Детальніше» → what it gives, why us, who it suits), then the price
 * list by website type as four coloured cards with their own films («Детальніше» → the existing PlanDialog).
 */
export function Services() {
  const { SERVICES, UI } = useContent();
  const [dir, setDir] = useState<number | null>(null);
  const [plan, setPlan] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const v = SERVICES.vis;
  const DIR_VIS = { design: <DesignVis v={v} />, dev: <DevVis />, admin: <AdminVis v={v} />, support: <SupportVis v={v} /> } as const;
  const PLAN_VIS = { card: <CardVis />, landing: <LandingVis />, shop: <ShopVis />, corp: <CorpVis v={v} /> } as const;

  return (
    <section id="services" aria-labelledby="services-title" className="relative flex w-full flex-col px-gutter pb-12 pt-24">
      <header data-parallax="0.06" className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-6">
        <h2 id="services-title" className="legible text-mega font-semibold">
          <RevealWords text={SERVICES.headline[0]} accent={SERVICES.headline[1]} tone="violet" />
        </h2>
        <p data-boot className="legible max-w-[28rem] text-lead text-body">{SERVICES.intro}</p>
      </header>

      {/* what we do: one big card per direction, text left, its film right */}
      <ul className="relative z-[1] mt-12 flex w-full min-w-0 flex-col gap-6">
        {SERVICES.directions.map((d, i) => {
          const Ic = DIR_ICON[d.id as keyof typeof DIR_ICON];
          return (
            <li key={d.id} data-reveal style={delay(i)} className="min-w-0">
              <article aria-labelledby={`dir-${d.id}`} className="card relative grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" style={{ ["--ac" as string]: d.color }}>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: d.color }} />
                <div className="flex min-w-0 flex-col justify-center gap-6 p-6 md:p-10">
                  <span className="grid size-11 place-items-center rounded-xl" style={{ background: `${d.color}1f`, color: d.color }}>
                    <Ic size={22} weight="light" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id={`dir-${d.id}`} className="text-mega font-semibold" style={{ color: d.color }}>
                      {d.name}
                    </h3>
                    <p className="mt-6 max-w-[30rem] text-lead text-body">{d.short}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Button
                      size="nav"
                      variant="secondary"
                      aria-haspopup="dialog"
                      onClick={(e) => {
                        opener.current = e.currentTarget;
                        setDir(i);
                      }}
                    >
                      {SERVICES.more}
                    </Button>
                    <span className="text-title font-semibold tabular-nums text-fg">{d.price}</span>
                  </div>
                </div>
                <div className="min-w-0 p-4 pt-0 md:p-6 lg:pl-0 lg:pt-6">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <Stage w={480} h={320} color={d.color} label={v.alt[d.id as keyof typeof v.alt]}>
                      {DIR_VIS[d.id as keyof typeof DIR_VIS]}
                    </Stage>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* the price list by website type, as coloured cards with their own films */}
      <header className="relative z-[1] mt-24 flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h3 className="legible text-headline font-semibold">
          {SERVICES.title[0]} <span className="text-violet-soft">{SERVICES.title[1]}</span>
        </h3>
        <p data-boot className="legible max-w-[28rem] text-base text-body">{SERVICES.lead}</p>
      </header>
      <ul aria-label={SERVICES.listLabel} className="relative z-[1] mt-6 grid w-full min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SERVICES.plans.map((p, i) => {
          const hex = PLAN_HEX[p.id];
          const Ic = ICON[p.id];
          return (
            <li key={p.id} data-reveal style={delay(i)} className="min-w-0">
              <article aria-labelledby={`plan-${p.id}`} className={`card relative flex h-full flex-col overflow-hidden ${p.hot ? "card-pro" : ""}`}>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: hex }} />
                <div className="border-b border-white/[0.06] bg-white/[0.02]">
                  <Stage w={360} h={220} color={hex} label={v.alt[p.id]}>
                    {PLAN_VIS[p.id]}
                  </Stage>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl" style={{ background: `${hex}1f`, color: hex }}>
                      <Ic size={22} weight="light" aria-hidden="true" />
                    </span>
                    <h4 id={`plan-${p.id}`} className="text-title font-medium text-fg">
                      {p.name}
                    </h4>
                    {p.hot && <Tag color="blue">{SERVICES.hot}</Tag>}
                  </div>
                  <p className="text-base text-body">{p.for}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                    <p>
                      <span className="flex items-baseline gap-2">
                        <span className="text-sm text-grey">{SERVICES.pricePrefix}</span>
                        <span className="text-2xl font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
                          {SERVICES.currency}
                          {p.price.toLocaleString(UI.locale)}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm text-grey">
                        {SERVICES.term} {UI.days(p.days)}
                      </span>
                    </p>
                    <Button
                      size="nav"
                      variant={p.hot ? "primary" : "secondary"}
                      aria-haspopup="dialog"
                      onClick={(e) => {
                        opener.current = e.currentTarget;
                        setPlan(i);
                      }}
                      className="w-36 shrink-0"
                    >
                      {SERVICES.more}
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <DirectionDialog open={dir} onClose={() => setDir(null)} returnFocus={opener} />
      <PlanDialog open={plan} onClose={() => setPlan(null)} returnFocus={opener} />
    </section>
  );
}

/** «Детальніше» on a direction: what it gives, why us, who it suits, price, and the main CTA */
function DirectionDialog({ open, onClose, returnFocus }: { open: number | null; onClose: () => void; returnFocus: React.RefObject<HTMLElement | null> }) {
  const { SERVICES, UI } = useContent();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);
  const hide = () => {
    onClose();
    returnFocus.current?.focus({ preventScroll: true });
  };
  const d = open !== null ? SERVICES.directions[open] : null;
  const Ic = d ? DIR_ICON[d.id as keyof typeof DIR_ICON] : null;
  return (
    <dialog ref={dialog} className="case-dialog plan-dialog" aria-labelledby="dir-dialog-title" onClose={() => open !== null && hide()} onClick={(e) => e.target === e.currentTarget && hide()}>
      {d && Ic && (
        <div className="case-panel card relative p-6 text-left sm:p-10">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: d.color }} />
          <button
            type="button"
            onClick={hide}
            aria-label={UI.close}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/10 text-body transition-colors duration-200 hover:border-white/25 hover:text-fg"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <span className="grid size-11 place-items-center rounded-xl" style={{ background: `${d.color}1f`, color: d.color }}>
            <Ic size={22} weight="light" aria-hidden="true" />
          </span>
          <h3 id="dir-dialog-title" className="mt-6 text-headline font-semibold" style={{ color: d.color }}>
            {d.name}
          </h3>
          <p className="mt-2 text-base text-body">{d.short}</p>
          <p className="mt-6 text-title font-semibold tabular-nums text-fg">{d.price}</p>
          {(
            [
              [SERVICES.gives, d.gives],
              [SERVICES.why, d.why],
              [SERVICES.who, d.who],
            ] as const
          ).map(([title, list]) => (
            <div key={title} className="mt-8">
              <p className="text-sm font-semibold text-fg">{title}</p>
              <ul className="mt-3 flex flex-col gap-3">
                {list.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-body">
                    <CheckCircle size={20} weight="fill" aria-hidden="true" className="mt-1 shrink-0" style={{ color: d.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Button href="#contact" className="mt-10 w-full" onClick={onClose}>
            {SERVICES.discuss}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      )}
    </dialog>
  );
}
