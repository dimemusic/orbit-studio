"use client";

import { Buildings, CheckCircle, IdentificationCard, Rocket, ShoppingBag, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Plan } from "@/lib/content";
import { PACKAGE_PICK } from "../home";
import { useContent } from "../Lang";
import { ACCENT, type Accent } from "../ui/accent";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { RevealWords } from "../ui/RevealWords";

const delay = (i: number) => ({ "--d": `${i * 80}ms` }) as CSSProperties;
const ICON = { card: IdentificationCard, landing: Rocket, shop: ShoppingBag, corp: Buildings } as const;
const COLOR: Record<Plan["id"], Accent> = { card: "cyan", landing: "violet", shop: "green", corp: "blue" };

/**
 * Pricing by website type: one full screen (lg+). Title + one line on the right, then 4 plan rows on hairlines
 * (icon, name + who it's for, «від $N» + term, «Детальніше» → PlanDialog with what is included and «Обговорити проєкт», which picks that type in the form).
 * The recommended plan gets a blue stripe, a faint tint, a badge and the primary button. Under the list: one line of extras.
 */
export function Pricing() {
  const { SERVICES, UI } = useContent();
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative flex w-full flex-col px-gutter pb-12 pt-24"
    >
      <header data-parallax="0.06" className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="services-title" className="legible text-mega font-semibold">
          <RevealWords text={SERVICES.title[0]} accent={SERVICES.title[1]} tone="violet" />
        </h2>
        <p data-boot className="legible max-w-[22rem] text-lead text-body">{SERVICES.lead}</p>
      </header>

      {/* plans as rows on hairlines: icon · name + who it's for + included · price + term · «Обрати» */}
      <ul aria-label={SERVICES.listLabel} className="relative z-[1] mt-12 w-full min-w-0">
        {SERVICES.plans.map((p, i) => {
          const a = ACCENT[COLOR[p.id]];
          const Ic = ICON[p.id];
          return (
            <li key={p.id} data-reveal style={delay(i)} className="min-w-0 border-t border-white/[0.09] last:border-b">
              <article
                aria-labelledby={`plan-${p.id}`}
                className={`relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 py-6 pl-4 pr-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-x-6 md:px-5 ${
                  p.hot ? "bg-linear-to-r from-white/[0.035] via-white/[0.015] to-transparent" : ""
                }`}
              >
                {/* recommended: a stripe in the plan colour */}
                {p.hot && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px] bg-blue" />}
                <span className={`grid size-11 place-items-center self-start rounded-xl md:self-center ${a.tint} ${a.text}`}>
                  <Ic size={22} weight="light" aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 id={`plan-${p.id}`} className="text-title font-medium text-fg">
                      {p.name}
                    </h3>
                    {p.hot && <Tag color="blue">{SERVICES.hot}</Tag>}
                  </div>
                  <p className="mt-1 text-base text-body">{p.for}</p>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-5 md:col-span-1 md:gap-8">
                  <p className="md:text-right">
                    <span className="flex items-baseline gap-2 md:justify-end">
                      <span className="text-sm text-grey">{SERVICES.pricePrefix}</span>
                      <span className="text-2xl font-semibold leading-none tracking-[-0.03em] lg:text-3xl text-fg tabular-nums">
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
                      setOpen(i);
                    }}
                    className="w-36 shrink-0"
                  >
                    {SERVICES.more}
                  </Button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* extras: one quiet line under the list */}
      <p data-boot className="legible relative z-[1] mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-body">
        <span className="text-grey">{SERVICES.extrasLabel}:</span>
        {SERVICES.extras.map((e) => (
          <span key={e.name}>
            {e.name} <span className="font-semibold text-fg">{e.price}</span>
          </span>
        ))}
      </p>

      <PlanDialog open={open} onClose={() => setOpen(null)} returnFocus={opener} />
    </section>
  );
}

/** «Детальніше»: what the plan includes, price + term, and «Обговорити проєкт» with that website type picked in the form */
function PlanDialog({ open, onClose, returnFocus }: { open: number | null; onClose: () => void; returnFocus: React.RefObject<HTMLElement | null> }) {
  const { SERVICES, CONTACT, CTA, UI } = useContent();
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
  const p = open !== null ? SERVICES.plans[open] : null;
  const a = p ? ACCENT[COLOR[p.id]] : null;
  const Ic = p ? ICON[p.id] : null;
  return (
    <dialog
      ref={dialog}
      className="case-dialog plan-dialog"
      aria-labelledby="plan-dialog-title"
      onClose={() => open !== null && hide()}
      onClick={(e) => e.target === e.currentTarget && hide()}
    >
      {p && a && Ic && (
        <div className="case-panel card relative p-6 text-left sm:p-10">
          <button
            type="button"
            onClick={hide}
            aria-label={UI.close}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/10 text-body transition-colors duration-200 hover:border-white/25 hover:text-fg"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <span className={`grid size-11 place-items-center rounded-xl ${a.tint} ${a.text}`}>
            <Ic size={22} weight="light" aria-hidden="true" />
          </span>
          <h3 id="plan-dialog-title" className="mt-6 text-headline font-semibold">
            {p.name}
          </h3>
          <p className="mt-2 text-base text-body">{p.for}</p>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-sm text-grey">{SERVICES.pricePrefix}</span>
            <span className="text-3xl font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
              {SERVICES.currency}
              {p.price.toLocaleString(UI.locale)}
            </span>
            <span className="ml-2 text-sm text-grey">
              {SERVICES.term} {UI.days(p.days)}
            </span>
          </p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-grey">{SERVICES.includes}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-base text-fg">
                <CheckCircle size={20} weight="fill" aria-hidden="true" className={`shrink-0 ${a.text}`} />
                {f}
              </li>
            ))}
          </ul>
          <Button
            href="#contact"
            className="mt-10 w-full"
            onClick={() => {
              window.dispatchEvent(new CustomEvent(PACKAGE_PICK, { detail: [CONTACT.chips[open!]] }));
              onClose();
            }}
          >
            {CTA.primary}
          </Button>
        </div>
      )}
    </dialog>
  );
}
