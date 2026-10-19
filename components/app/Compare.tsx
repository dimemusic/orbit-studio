"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { PEOPLE, type DemoFile, type Version } from "@/lib/demo-files";
import { Thumb } from "./Thumb";

/** Before / after overlay: `a` on the left of the divider, `b` on the right. Drag (pointer) or arrows (keyboard). */
export function Compare({ file, a, b, finalId }: { file: DemoFile; a: Version; b: Version; finalId: string | null }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))));
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? pos - step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? pos + step
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    setPos(Math.min(100, Math.max(0, next)));
  };

  const label = (v: Version, side: "l" | "r") => (
    <span
      className={`absolute top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#05070d]/75 px-2.5 py-1 text-[12px] font-semibold ${side === "l" ? "left-3" : "right-3"}`}
    >
      v{v.v}
      <span className="font-normal text-grey">{PEOPLE[v.author].name.split(" ")[0]}</span>
      {v.id === finalId && <span className="rounded-full bg-mint px-1.5 text-[11px] text-[#05070d]">Фінальна</span>}
    </span>
  );

  return (
    <div
      ref={box}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className="relative aspect-[4/3] w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-[14px] border border-hairline bg-[#0b0f19] shadow-[0_24px_64px_rgba(0,0,0,.45)] lg:w-[min(100cqw,133.33cqh)]"
    >
      <div className="absolute inset-0">
        <Thumb file={file} look={b.look} />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Thumb file={file} look={a.look} />
      </div>
      {label(a, "l")}
      {label(b, "r")}

      <div aria-hidden="true" className="absolute inset-y-0 w-px bg-white/90" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Межа порівняння"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pos}
        aria-valuetext={`v${a.v} ${pos}%, v${b.v} ${100 - pos}%`}
        onKeyDown={onKey}
        style={{ left: `${pos}%` }}
        className="absolute top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#05070d]/80 text-white shadow-[0_4px_18px_rgba(0,0,0,.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M6 4 L2 9 L6 14 M12 4 L16 9 L12 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
