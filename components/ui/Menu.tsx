"use client";

import type { Icon } from "@phosphor-icons/react";
import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type MenuItem<T extends string> = {
  value: T;
  label: string;
  icon?: Icon;
  /** small grey note before the check (e.g. «фінальна») */
  hint?: string;
};

type Props<T extends string> = {
  /** accessible name of the trigger and the menu */
  label: string;
  /** what the pill shows (current option); defaults to the active item's label */
  current?: ReactNode;
  /** leading icon inside the pill */
  icon?: Icon;
  items: MenuItem<T>[];
  value: T;
  onChange: (v: T) => void;
  /** extra controls after a hairline (not part of arrow-key navigation) */
  footer?: ReactNode;
  /** which trigger edge the popover lines up with */
  align?: "start" | "end";
  className?: string;
};

// popover grows from the trigger corner it is attached to
const ORIGIN: Record<string, string> = {
  "top-start": "origin-top-left",
  "top-end": "origin-top-right",
  "bottom-start": "origin-bottom-left",
  "bottom-end": "origin-bottom-right",
};

/**
 * Single-choice menu replacing a native <select>: pill trigger, glass popover below
 * (flips up when there is no room), menuitemradio items with arrows / Home / End /
 * typeahead, Esc and click outside close and give focus back to the trigger.
 */
export function Menu<T extends string>({ label, current, icon: Lead, items, value, onChange, footer, align = "end", className = "" }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // which item gets focus once the popover is mounted
  const startAt = useRef(0);
  const id = useId();
  const active = Math.max(0, items.findIndex((i) => i.value === value));

  const focusItem = (i: number) => refs.current[(i + items.length) % items.length]?.focus();

  const show = (at = active) => {
    startAt.current = at;
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };

  // place before paint: flip up when the space below is too small, then focus the item
  useLayoutEffect(() => {
    if (!open) return;
    const t = trigger.current!.getBoundingClientRect();
    const h = pop.current!.offsetHeight + 8;
    const below = window.innerHeight - t.bottom;
    setUp(below < h && t.top > below);
    focusItem(startAt.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // click outside closes; focus leaving the menu (Tab) closes without stealing it back
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close();
    };
    const onFocus = (e: FocusEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("focusin", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (v: T) => {
    onChange(v);
    close();
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show(e.key === "ArrowUp" ? items.length - 1 : active);
    }
  };

  const onMenuKey = (e: KeyboardEvent) => {
    // keep Esc / arrows away from the page-level shortcuts (drawer, versions)
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      return close();
    }
    const i = refs.current.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return; // focus is in the footer: let it handle its own keys
    if (e.key === "ArrowDown") focusItem(i + 1);
    else if (e.key === "ArrowUp") focusItem(i - 1);
    else if (e.key === "Home") focusItem(0);
    else if (e.key === "End") focusItem(items.length - 1);
    else if (e.key === "Enter" || e.key === " ") pick(items[i].value);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      // typeahead: next item starting with this letter, wrapping around
      const k = e.key.toLowerCase();
      for (let s = 1; s <= items.length; s++) {
        const j = (i + s) % items.length;
        if (items[j].label.toLowerCase().startsWith(k)) {
          focusItem(j);
          break;
        }
      }
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKey}
        className="flex h-9 items-center gap-2 rounded-full border border-hairline px-3 text-[13px] text-body transition-colors hover:border-hairline-strong hover:text-fg aria-expanded:border-hairline-strong aria-expanded:text-fg"
      >
        {Lead && <Lead size={15} aria-hidden="true" className="text-grey" />}
        <span className="sr-only">{label}: </span>
        <span className="whitespace-nowrap">{current ?? items[active]?.label}</span>
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden="true"
          className={`text-grey transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={pop}
          onKeyDown={onMenuKey}
          className={`absolute z-40 min-w-[220px] rounded-2xl border border-white/10 bg-[rgb(12_15_24/.96)] p-1.5 shadow-2xl backdrop-blur-xl transition-[opacity,scale,translate] duration-[160ms] ease-out starting:translate-y-1 starting:scale-[.96] starting:opacity-0 motion-reduce:transition-none ${
            align === "end" ? "right-0" : "left-0"
          } ${up ? "bottom-full mb-2" : "top-full mt-2"} ${ORIGIN[`${up ? "bottom" : "top"}-${align}`]}`}
        >
          <div id={id} role="menu" aria-label={label}>
            {items.map((it, i) => {
              const on = i === active;
              const I = it.icon;
              return (
                <button
                  key={it.value}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  tabIndex={-1}
                  onClick={() => pick(it.value)}
                  // outline-none! beats the unlayered global :focus-visible outline; the row tint shows focus
                  className={`flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[14px] outline-none! transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06] ${
                    on ? "text-fg" : "text-body"
                  }`}
                >
                  {I && <I size={16} aria-hidden="true" className="shrink-0 text-body" />}
                  <span className="flex-1 whitespace-nowrap">{it.label}</span>
                  {it.hint && <span className="text-[12px] text-grey">{it.hint}</span>}
                  <Check size={16} weight="bold" aria-hidden="true" className={`shrink-0 text-blue ${on ? "" : "invisible"}`} />
                </button>
              );
            })}
          </div>
          {footer && <div className="mt-1.5 border-t border-hairline px-1 pb-0.5 pt-2">{footer}</div>}
        </div>
      )}
    </div>
  );
}
