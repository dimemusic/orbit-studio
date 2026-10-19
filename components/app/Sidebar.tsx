"use client";

import type { Icon } from "@phosphor-icons/react";
import { ClockCounterClockwise, SquaresFour, Star, Trash, UploadSimple, UsersThree, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatGb, PLANS, PROJECTS, USED_GB, type PlanId, type ProjectId } from "@/lib/demo-files";
import { Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

export type View = "all" | "recent" | "shared" | "starred" | "trash";

export const VIEWS: { id: View; label: string; icon: Icon }[] = [
  { id: "all", label: "Усі файли", icon: SquaresFour },
  { id: "recent", label: "Нещодавні", icon: ClockCounterClockwise },
  { id: "shared", label: "Спільні зі мною", icon: UsersThree },
  { id: "starred", label: "Позначені", icon: Star },
  { id: "trash", label: "Кошик", icon: Trash },
];

// three modes from one element: drawer (< 768), icon rail (768–1099), full sidebar (≥ 1100)
const LABEL = "md:max-nav:sr-only";
const FULL_ONLY = "md:max-nav:hidden";

type Props = {
  plan: PlanId;
  view: View;
  project: ProjectId | null;
  counts: Partial<Record<View, number>>;
  open: boolean;
  onClose: () => void;
  onView: (v: View) => void;
  onProject: (p: ProjectId) => void;
  onUpload: () => void;
};

export function Sidebar({ plan, view, project, counts, open, onClose, onView, onProject, onUpload }: Props) {
  const ref = useRef<HTMLElement>(null);
  const p = PLANS[plan];
  const used = USED_GB[plan];
  const share = Math.max(2, Math.round((used / p.limitGb) * 100));
  // «7,4 з 20 ГБ»: the unit once when both sides share it
  const usedLabel = formatGb(used);
  const limitLabel = formatGb(p.limitGb);
  const unit = limitLabel.split(" ").pop()!;
  const amount = usedLabel.endsWith(` ${unit}`) ? usedLabel.slice(0, -unit.length - 1) : usedLabel;
  const storage = `${amount} з ${limitLabel}`;

  // drawer: move focus in on open
  useEffect(() => {
    if (open) ref.current?.querySelector<HTMLElement>("[data-first]")?.focus();
  }, [open]);

  const item = (on: boolean) =>
    `group flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[14px] transition-colors duration-200 md:max-nav:justify-center md:max-nav:px-0 ${
      on ? "bg-white/[0.07] text-fg" : "text-body hover:bg-white/[0.04] hover:text-fg"
    }`;

  return (
    <>
      {/* drawer backdrop (phones only) */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <nav
        ref={ref}
        aria-label="Розділи хмари"
        className={`card card-nav fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:none] rounded-none border-y-0 border-l-0 px-4 pb-4 pt-5 transition-[transform,visibility] duration-300 ease-[var(--ease)] md:visible md:w-[72px] md:translate-x-0 md:px-3 nav:w-[248px] nav:px-4 ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex h-9 items-center justify-between md:max-nav:justify-center">
          <Link href="/" aria-label="Cloud Sphere, на головну" className="text-fg">
            <span className={`whitespace-nowrap ${FULL_ONLY}`}>
              <Logo />
            </span>
            <span className="hidden md:max-nav:inline">
              <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
                <circle cx="5" cy="12" r="3.2" fill="currentColor" />
                <circle cx="13.5" cy="5" r="2.4" fill="var(--blue)" />
                <line x1="5" y1="12" x2="13.5" y2="5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
              </svg>
            </span>
          </Link>
          <button type="button" onClick={onClose} aria-label="Закрити меню" className="grid size-9 place-items-center rounded-full text-body hover:text-fg md:hidden">
            <X size={20} weight="light" />
          </button>
        </div>

        <div className="mt-6">
          <Button size="nav" onClick={onUpload} className={`w-full gap-2 ${FULL_ONLY}`} data-first>
            <UploadSimple size={18} weight="bold" aria-hidden="true" />
            Завантажити
          </Button>
          <button
            type="button"
            onClick={onUpload}
            aria-label="Завантажити"
            title="Завантажити"
            className="btn-primary mx-auto hidden size-12 place-items-center rounded-full transition-shadow md:max-nav:grid"
          >
            <UploadSimple size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-6 flex flex-col gap-0.5">
          {VIEWS.map(({ id, label, icon: I }) => {
            const on = !project && view === id;
            return (
              <li key={id}>
                <button type="button" onClick={() => onView(id)} aria-current={on ? "page" : undefined} title={label} className={item(on)}>
                  <I size={20} weight={on ? "regular" : "light"} aria-hidden="true" className={on ? "text-blue" : ""} />
                  <span className={`flex-1 truncate ${LABEL}`}>{label}</span>
                  {counts[id] ? <span className={`text-[12px] tabular-nums text-grey ${FULL_ONLY}`}>{counts[id]}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>

        <p className={`mb-2 mt-7 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey ${LABEL}`}>Проєкти</p>
        <div className="hidden h-px bg-hairline md:max-nav:my-4 md:max-nav:block" />
        <ul className="flex flex-col gap-0.5">
          {PROJECTS.map((pr) => {
            const on = project === pr.id;
            return (
              <li key={pr.id}>
                <button type="button" onClick={() => onProject(pr.id)} aria-current={on ? "page" : undefined} title={pr.name} className={item(on)}>
                  <span aria-hidden="true" className="grid size-5 place-items-center">
                    <span className="size-2 rounded-full" style={{ background: pr.color }} />
                  </span>
                  <span className={`flex-1 truncate ${LABEL}`}>{pr.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* storage meter */}
        <div className="mt-auto pt-6">
          <div className={`rounded-[12px] border border-hairline p-4 ${FULL_ONLY}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-body">Сховище</span>
              <Tag color={plan === "free" ? "green" : plan === "pro" ? "blue" : "violet"}>{p.name}</Tag>
            </div>
            <p className="mt-3 text-[15px] font-semibold tracking-[-0.01em] tabular-nums">
              {amount} <span className="font-normal text-grey">з {limitLabel}</span>
            </p>
            <div
              role="meter"
              aria-label="Використано сховища"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={share}
              aria-valuetext={storage}
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
            >
              <div className="fill-in h-full rounded-full" style={{ width: `${share}%`, background: p.color }} />
            </div>
            <Link href="/#pricing" className="mt-3 inline-flex text-[13px] font-semibold text-blue hover:text-fg">
              Більше місця →
            </Link>
          </div>
          {/* rail: compact ring */}
          <Link
            href="/#pricing"
            title={`${storage} · Більше місця`}
            aria-label={`Сховище: ${storage}. Більше місця`}
            className="relative mx-auto hidden size-11 place-items-center md:max-nav:grid"
          >
            <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true" className="-rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(share / 100) * 94.2} 94.2`} />
            </svg>
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[10px] font-semibold tabular-nums text-body">
              {share}%
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
