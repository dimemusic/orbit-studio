"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import type { AppComment, DemoFile, Version } from "@/lib/demo-files";
import { Thumb } from "./Thumb";

type Props = {
  file: DemoFile;
  version: Version;
  /** this version's comments, already in pin order */
  comments: AppComment[];
  pinNo: Record<string, number>;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  onAdd: (x: number, y: number, text: string) => void;
};

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Large preview of one version with numbered pins. Click on the preview (or Enter on it) drops a pin
 * with an inline input; Esc cancels it. Hovering a pin highlights its comment and vice versa.
 */
export function PinStage({ file, version, comments, pinNo, hovered, onHover, onPick, onAdd }: Props) {
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (draft) inputRef.current?.focus();
  }, [draft]);
  // switching versions drops an unsent pin
  useEffect(() => setDraft(null), [version.id]);

  const place = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // keyboard activation has no pointer position: centre
    const x = e.detail === 0 ? 0.5 : (e.clientX - r.left) / r.width;
    const y = e.detail === 0 ? 0.5 : (e.clientY - r.top) / r.height;
    setDraft({ x: round(Math.min(0.97, Math.max(0.03, x))), y: round(Math.min(0.97, Math.max(0.03, y))) });
    setText("");
  };
  const cancel = () => {
    setDraft(null);
    addRef.current?.focus();
  };
  const submit = () => {
    if (!draft || !text.trim()) return;
    onAdd(draft.x, draft.y, text.trim());
    setDraft(null);
    addRef.current?.focus();
  };

  const pins = comments.filter((c) => c.x !== null && c.y !== null);

  return (
    <div className="relative aspect-[4/3] w-full overflow-visible lg:w-[min(100cqw,133.33cqh)]">
      <div className="absolute inset-0 overflow-hidden rounded-[14px] border border-hairline bg-[#0b0f19] shadow-[0_24px_64px_rgba(0,0,0,.45)]">
        {/* key: cross-fade between versions */}
        <div key={version.id} className="h-full w-full animate-[quote-in_.35s_var(--ease)]">
          <Thumb file={file} look={version.look} />
        </div>
      </div>

      <button
        ref={addRef}
        type="button"
        onClick={place}
        aria-label={`Додати коментар з позначкою до v${version.v}. Enter ставить позначку в центр`}
        className="absolute inset-0 cursor-crosshair rounded-[14px] focus-visible:outline-offset-2"
      />

      {pins.map((c) => {
        const on = hovered === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onMouseEnter={() => onHover(c.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(c.id)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(c.id)}
            aria-label={`Позначка ${pinNo[c.id]}: ${c.author}, «${c.text}»${c.resolved ? ", вирішено" : ""}`}
            style={{ left: `${(c.x ?? 0) * 100}%`, top: `${(c.y ?? 0) * 100}%` }}
            className={`absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-bl-[4px] text-[12px] font-semibold tabular-nums shadow-[0_4px_14px_rgba(0,0,0,.5)] transition-transform duration-200 ${
              c.resolved ? "bg-[#2a2f3a] text-grey" : "bg-blue text-white"
            } ${on ? "z-10 scale-125 ring-2 ring-white" : ""}`}
          >
            {pinNo[c.id]}
          </button>
        );
      })}

      {draft && (
        <>
          <span
            aria-hidden="true"
            style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}
            className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-bl-[4px] bg-white text-[12px] font-semibold text-[#05070d] shadow-[0_4px_14px_rgba(0,0,0,.5)]"
          >
            {pins.length + 1}
          </span>
          {/* popover stays inside the preview: shifted left by the pin's own x share */}
          <div
            style={{
              left: `${draft.x * 100}%`,
              top: draft.y < 0.6 ? `calc(${draft.y * 100}% + 22px)` : undefined,
              bottom: draft.y >= 0.6 ? `calc(${(1 - draft.y) * 100}% + 22px)` : undefined,
              transform: `translateX(-${draft.x * 100}%)`,
            }}
            className="card absolute z-20 w-[min(280px,90%)] p-2"
          >
            <label htmlFor={id} className="sr-only">
              Коментар до позначки
            </label>
            <textarea
              ref={inputRef}
              id={id}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  cancel();
                } else if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Що тут змінити?"
              className="block w-full resize-none bg-transparent px-2 py-1.5 text-[13px] text-fg outline-none placeholder:text-grey focus-visible:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button type="button" onClick={cancel} className="h-8 rounded-full px-3 text-[13px] text-grey hover:text-fg">
                Скасувати
              </button>
              <button type="button" onClick={submit} disabled={!text.trim()} className="btn-primary h-8 rounded-full px-3.5 text-[13px] font-semibold disabled:opacity-40">
                Додати
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
