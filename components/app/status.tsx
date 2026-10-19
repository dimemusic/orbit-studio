"use client";

import {
  ArrowCounterClockwise,
  CalendarBlank,
  CaretDown,
  Check,
  CheckCircle,
  CircleHalf,
  DotsThree,
  Hourglass,
  PencilSimpleLine,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { dueInfo, g, PEOPLE, STATUS_META, STATUS_ORDER, type Status } from "@/lib/demo-files";
import type { Reviewer } from "./store";

export const STATUS_ICON: Record<Status, Icon> = {
  draft: PencilSimpleLine,
  progress: CircleHalf,
  review: Hourglass,
  changes: ArrowCounterClockwise,
  approved: CheckCircle,
};

/** tinted pill: coloured text on a 12% tint of the same colour. `overlay` sits on a thumbnail; `compact` hides the label below sm */
export function StatusChip({ status, overlay, compact, note }: { status: Status; overlay?: boolean; compact?: boolean; note?: string }) {
  const { label, color } = STATUS_META[status];
  const I = STATUS_ICON[status];
  return (
    <span
      title={note ? `${label} · ${note}` : label}
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[12px] font-semibold ${overlay ? "bg-[#05070d]/75" : ""}`}
      style={{ color, background: overlay ? undefined : `${color}1f` }}
    >
      <I size={13} weight="bold" aria-hidden="true" />
      <span className={compact ? "max-sm:sr-only" : ""}>{label}</span>
    </span>
  );
}

/** «до 21 жовт»: amber at ≤ 2 days left, rose when overdue */
export function DueChip({ due, overlay }: { due?: string; overlay?: boolean }) {
  if (!due) return null;
  const { days, label } = dueInfo(due);
  const tone = days < 0 ? "text-rose bg-rose/12" : days <= 2 ? "text-amber bg-amber/12" : "text-fg/85 bg-white/[0.07]";
  const hint = days < 0 ? "прострочено" : days === 0 ? "сьогодні" : days <= 2 ? `${days === 1 ? "завтра" : "за 2 дні"}` : "";
  return (
    <span
      title={hint ? `${label}, ${hint}` : label}
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[12px] font-semibold tabular-nums ${tone} ${overlay ? "!bg-[#05070d]/75" : ""}`}
    >
      <CalendarBlank size={13} weight="bold" aria-hidden="true" />
      {label}
      {hint && days <= 0 && <span className="sr-only">, {hint}</span>}
    </span>
  );
}

export function Avatar({ id, size = 28 }: { id: string; size?: number }) {
  const p = PEOPLE[id];
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-[#090c14]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: `${p.color}66` }}
    >
      {p.initials}
    </span>
  );
}

export const REVIEW_META = {
  approved: { color: "#4fe3c1", I: Check, text: (id: string) => `✓ ${g(id, "погодив", "погодила")}` },
  changes: { color: "#ff7ab6", I: ArrowCounterClockwise, text: () => "⟳ правки" },
  waiting: { color: "#8b919c", I: DotsThree, text: () => "… чекаємо" },
} as const;

/** small state badge on the avatar's corner */
export function ReviewBadge({ state }: { state: Reviewer["state"] }) {
  const { color, I } = REVIEW_META[state];
  return (
    <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 grid size-[14px] place-items-center rounded-full ring-2 ring-[#090c14]" style={{ background: color }}>
      <I size={9} weight="bold" className="text-[#05070d]" />
    </span>
  );
}

/** overlapping avatars with a state badge each; the full state is in the accessible label */
export function ReviewerStack({ list, size = 24 }: { list: Reviewer[]; size?: number }) {
  const label = list.map((r) => `${PEOPLE[r.id].name}: ${REVIEW_META[r.state].text(r.id).slice(2)}`).join("; ");
  return (
    <span role="img" aria-label={`Рецензенти. ${label}`} title={label} className="flex shrink-0 items-center -space-x-1.5">
      {list.map((r) => (
        <span key={r.id} className="relative">
          <Avatar id={r.id} size={size} />
          <ReviewBadge state={r.state} />
        </span>
      ))}
    </span>
  );
}

/**
 * «Змінити статус»: a menu button. The list is a popover (top layer, so no scroll container clips it),
 * placed under the button; ↑ ↓ Home End move, Enter / Space pick, Esc / Tab / outside click close.
 */
export function StatusMenu({ status, note, onPick, label = "Змінити статус" }: { status: Status; note?: string; onPick: (to: Status) => void; label?: string }) {
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const closedAt = useRef(0);
  const id = useId();

  useEffect(() => {
    const m = menu.current;
    if (!m) return;
    const onToggle = (e: Event) => {
      const on = (e as ToggleEvent).newState === "open";
      if (!on) closedAt.current = Date.now();
      setOpen(on);
    };
    m.addEventListener("toggle", onToggle);
    return () => m.removeEventListener("toggle", onToggle);
  }, []);

  // a fixed popover would drift away from its button on scroll: close instead
  useEffect(() => {
    if (!open) return;
    const close = () => menu.current?.hidePopover();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? []);

  const show = () => {
    const b = btn.current!.getBoundingClientRect();
    const m = menu.current!;
    const w = 232;
    const h = STATUS_ORDER.length * 40 + 12;
    m.style.left = `${Math.round(Math.min(Math.max(8, b.left), window.innerWidth - w - 8))}px`;
    m.style.top = `${Math.round(b.bottom + 8 + h > window.innerHeight ? b.top - 8 - h : b.bottom + 8)}px`;
    m.showPopover();
    requestAnimationFrame(() => (items().find((el) => el.getAttribute("aria-checked") === "true") ?? items()[0])?.focus());
  };
  const hide = (refocus = true) => {
    menu.current?.hidePopover();
    if (refocus) btn.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    if (e.key === "Escape") {
      // keep Esc from also closing the panel / leaving the file view
      e.preventDefault();
      e.stopPropagation();
      hide();
    } else if (e.key === "Tab") hide(false);
    else if (e.key === "ArrowDown") (e.preventDefault(), go(at + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), go(at - 1));
    else if (e.key === "Home") (e.preventDefault(), go(0));
    else if (e.key === "End") (e.preventDefault(), go(list.length - 1));
  };

  const { color } = STATUS_META[status];
  const I = STATUS_ICON[status];
  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        title={note ? `${STATUS_META[status].label} · ${note}` : label}
        // a click on the button while open light-dismisses first: don't reopen right away
        onClick={() => (open ? hide() : Date.now() - closedAt.current > 250 && show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") (e.preventDefault(), show());
        }}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-2.5 pr-2 text-[13px] font-semibold transition-[filter] hover:brightness-125"
        style={{ color, background: `${color}1f` }}
      >
        <I size={14} weight="bold" aria-hidden="true" />
        <span className="sr-only">{label}. Зараз:</span>
        {STATUS_META[status].label}
        <CaretDown size={12} weight="bold" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        ref={menu}
        id={id}
        popover="auto"
        role="menu"
        aria-label={label}
        onKeyDown={onMenuKey}
        className="card card-nav fixed inset-auto m-0 w-[232px] p-1.5 text-fg"
      >
        {STATUS_ORDER.map((s) => {
          const M = STATUS_META[s];
          const SI = STATUS_ICON[s];
          const on = s === status;
          return (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              tabIndex={-1}
              onClick={() => {
                hide();
                if (!on) onPick(s);
              }}
              className="flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[14px] transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06]"
            >
              <SI size={16} weight="bold" aria-hidden="true" style={{ color: M.color }} />
              <span className="flex-1">{M.label}</span>
              {on && <Check size={14} weight="bold" aria-hidden="true" className="text-grey" />}
            </button>
          );
        })}
      </div>
    </>
  );
}
