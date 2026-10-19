"use client";

import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { current, dueInfo, STATUS_META, STATUS_ORDER, versionById, type DemoFile, type Status } from "@/lib/demo-files";
import { useStatusChange } from "./Approval";
import { DueChip, ReviewerStack, STATUS_ICON, StatusChip } from "./status";
import { useAppStore } from "./store";
import { Thumb } from "./Thumb";

type Props = {
  files: DemoFile[];
  selected: string | null;
  /** click: details panel */
  onOpen: (id: string, el: HTMLElement) => void;
  /** double-click / Enter: file view */
  onOpenFile: (id: string) => void;
};

type Drag = { id: string; x: number; y: number; ox: number; oy: number; w: number; over: Status | null };

const HELP = "Пробіл бере картку, стрілки вліво і вправо обирають колонку, пробіл кладе, Esc скасовує. Enter відкриває файл.";

/**
 * Kanban by status. One tab stop (arrows move between cards and columns).
 * Move a card: pointer drag (touch: press and hold), or Space → ← / → → Space; Esc cancels.
 * Every move goes through useStatusChange (toast + «Скасувати»; «Погоджено» asks for the final version).
 */
export function Board({ files, selected, onOpen, onOpenFile }: Props) {
  const { statusOf, finalOf, commentsOf, reviewersOf } = useAppStore();
  const { change, dialog } = useStatusChange();
  const scroller = useRef<HTMLDivElement>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pick, setPick] = useState<{ id: string; from: Status; to: Status } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [say, setSay] = useState("");
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  const cols = STATUS_ORDER.map((s) => ({ id: s, files: files.filter((f) => statusOf(f).id === s) }));
  const tabId = files.some((f) => f.id === focusId) ? focusId : (cols.find((c) => c.files.length)?.files[0].id ?? null);
  const byId = (id: string) => files.find((f) => f.id === id)!;

  const focusCard = (id: string) => {
    setFocusId(id);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card][data-id="${id}"]`)?.focus());
  };

  // drop = status change; the card re-mounts in its new column, so focus follows it
  const move = (f: DemoFile, to: Status) => {
    if (to === statusOf(f).id) return;
    change(f, to, () => focusCard(f.id));
  };

  // touch drag: once a long press has started a drag, the page must not scroll under the finger
  useEffect(() => {
    const stop = (e: TouchEvent) => {
      if (dragging.current) e.preventDefault();
    };
    window.addEventListener("touchmove", stop, { passive: false });
    return () => window.removeEventListener("touchmove", stop);
  }, []);

  const colAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-col]")?.dataset.col ?? null) as Status | null;

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>, f: DemoFile) => {
    if (e.button !== 0 || pick) return;
    const el = e.currentTarget;
    const sx = e.clientX;
    const sy = e.clientY;
    const touch = e.pointerType === "touch";
    let started = false;
    let last: Drag | null = null;
    let timer = 0;

    const begin = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      started = true;
      dragging.current = true;
      last = { id: f.id, x, y, ox: x - r.left, oy: y - r.top, w: r.width, over: colAt(x, y) };
      setDrag(last);
    };
    const end = () => {
      clearTimeout(timer);
      dragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    const onMove = (ev: PointerEvent) => {
      if (!started) {
        const dist = Math.hypot(ev.clientX - sx, ev.clientY - sy);
        // touch: moving before the hold completes means the user is scrolling
        if (touch) return dist > 8 ? end() : undefined;
        if (dist < 6) return;
        begin(ev.clientX, ev.clientY);
      }
      last = { ...last!, x: ev.clientX, y: ev.clientY, over: colAt(ev.clientX, ev.clientY) };
      setDrag(last);
      // near the board's edge: scroll it
      const sc = scroller.current;
      if (sc) {
        const r = sc.getBoundingClientRect();
        if (ev.clientX < r.left + 48) sc.scrollLeft -= 16;
        else if (ev.clientX > r.right - 48) sc.scrollLeft += 16;
      }
    };
    const onUp = () => {
      end();
      if (!started || !last) return;
      setDrag(null);
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      if (last.over) move(f, last.over);
    };
    const onCancel = () => {
      end();
      setDrag(null);
    };

    if (touch) timer = window.setTimeout(() => begin(sx, sy), 350);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  const onKey = (e: KeyboardEvent<HTMLElement>, f: DemoFile) => {
    const col = STATUS_ORDER.indexOf(statusOf(f).id);

    if (pick) {
      const to = STATUS_ORDER.indexOf(pick.to);
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const n = STATUS_ORDER[Math.max(0, Math.min(STATUS_ORDER.length - 1, to + (e.key === "ArrowLeft" ? -1 : 1)))];
        setPick({ ...pick, to: n });
        setSay(`Колонка «${STATUS_META[n].label}»${n === pick.from ? ", поточна" : ""}`);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setPick(null);
        if (pick.to === pick.from) setSay("Картку покладено на місце");
        else {
          setSay(`Перенесено в «${STATUS_META[pick.to].label}»`);
          move(f, pick.to);
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
        setPick(null);
        setSay("Перенесення скасовано");
      } else if (e.key.startsWith("Arrow")) e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      onOpenFile(f.id);
    } else if (e.key === " ") {
      e.preventDefault();
      const from = statusOf(f).id;
      setPick({ id: f.id, from, to: from });
      setSay(`Взято «${f.name}» з колонки «${STATUS_META[from].label}». ${HELP}`);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const list = cols[col].files;
      const i = list.findIndex((x) => x.id === f.id);
      const n = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : i + (e.key === "ArrowUp" ? -1 : 1);
      if (list[n]) focusCard(list[n].id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      // nearest non-empty column in that direction, same row if possible
      const d = e.key === "ArrowLeft" ? -1 : 1;
      const row = cols[col].files.findIndex((x) => x.id === f.id);
      for (let c = col + d; c >= 0 && c < cols.length; c += d) {
        const list = cols[c].files;
        if (list.length) return focusCard(list[Math.min(row, list.length - 1)].id);
      }
    }
  };

  const dragFile = drag ? byId(drag.id) : null;
  const target = pick ? pick.to : drag?.over && dragFile && drag.over !== statusOf(dragFile).id ? drag.over : null;

  return (
    <div>
      <p id="board-help" className="sr-only">
        {HELP}
      </p>
      <div aria-live="assertive" className="sr-only">
        {say}
      </div>

      <div ref={scroller} className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {cols.map(({ id: st, files: list }) => {
          const M = STATUS_META[st];
          const I = STATUS_ICON[st];
          const over = target === st;
          return (
            <section
              key={st}
              data-col={st}
              aria-labelledby={`col-${st}`}
              className={`flex min-w-[248px] flex-1 basis-0 flex-col rounded-[16px] border transition-colors duration-150 ${
                over ? "border-blue/60 bg-blue/[0.05]" : "border-hairline bg-white/[0.015]"
              }`}
            >
              <h2 id={`col-${st}`} className="flex h-12 shrink-0 items-center gap-2 px-3.5 text-[14px] font-semibold">
                <I size={16} weight="bold" aria-hidden="true" style={{ color: M.color }} />
                {M.label}
                {/* same slot for the count and the drop hint: no shift while dragging */}
                <span className={`ml-auto text-[13px] font-normal tabular-nums ${over ? "text-blue" : "text-grey"}`}>
                  {over ? "сюди" : list.length}
                  <span className="sr-only"> файлів</span>
                </span>
              </h2>
              <ul className="flex min-h-[160px] flex-1 flex-col gap-2 px-2 pb-2">
                {list.length === 0 && (
                  <li aria-hidden="true" className="grid h-[104px] place-items-center rounded-[12px] border border-dashed border-hairline-strong text-[13px] text-faint">
                    Порожньо
                  </li>
                )}
                {list.map((f) => {
                  const picked = pick?.id === f.id;
                  const ghost = drag?.id === f.id;
                  const shown = statusOf(f);
                  const fin = versionById(f, finalOf(f));
                  const open = commentsOf(f.id).filter((c) => !c.resolved).length;
                  const due = f.due ? `, ${dueInfo(f.due).label}` : "";
                  return (
                    <li key={f.id}>
                      <div
                        role="button"
                        data-card=""
                        data-id={f.id}
                        tabIndex={f.id === tabId ? 0 : -1}
                        aria-label={`${f.name}. ${STATUS_META[shown.id].label}${shown.note ? `, ${shown.note}` : ""}. v${current(f).v}${due}`}
                        aria-describedby="board-help"
                        aria-current={selected === f.id ? "true" : undefined}
                        aria-controls="details"
                        onFocus={() => setFocusId(f.id)}
                        onBlur={() => picked && (setPick(null), setSay("Перенесення скасовано"))}
                        onKeyDown={(e) => onKey(e, f)}
                        onPointerDown={(e) => onPointerDown(e, f)}
                        onContextMenu={(e) => dragging.current && e.preventDefault()}
                        onClick={(e) => {
                          if (suppressClick.current || pick) return;
                          onOpen(f.id, e.currentTarget);
                        }}
                        onDoubleClick={() => onOpenFile(f.id)}
                        className={`card card-flat relative block cursor-grab touch-manipulation select-none p-2 transition-[border-color,transform] duration-200 motion-reduce:transition-none [-webkit-touch-callout:none] active:cursor-grabbing ${
                          picked
                            ? "!border-blue -translate-y-0.5"
                            : selected === f.id
                              ? "!border-blue/70"
                              : fin && fin.id === current(f).id
                                ? "!border-mint/30 hover:!border-mint/50"
                                : "hover:border-white/[0.16]"
                        }`}
                      >
                        {/* while dragging, the card's content fades (never the .card itself) */}
                        <span className={`block transition-opacity duration-150 ${ghost ? "opacity-30" : ""}`}>
                          <span className="relative block aspect-[16/9] overflow-hidden rounded-[10px]">
                            <Thumb file={f} />
                            <span className="absolute left-2 top-2 rounded-full bg-[#05070d]/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg/85">
                              {f.kind}
                            </span>
                          </span>
                          <span className="block px-1 pb-0.5 pt-2.5">
                            <span className="block truncate text-[14px] font-semibold tracking-[-0.01em]">{f.name}</span>
                            <span className="mt-2 flex h-[22px] items-center gap-1.5 overflow-hidden">
                              <span className="rounded-full bg-blue/12 px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-blue">v{current(f).v}</span>
                              {fin && (
                                <span className="rounded-full bg-mint px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-[#05070d]">
                                  фінальна{fin.id !== current(f).id ? ` v${fin.v}` : ""}
                                </span>
                              )}
                              <span className="ml-auto">
                                <DueChip due={f.due} />
                              </span>
                            </span>
                            {shown.note && <span className="mt-1.5 block truncate text-[12px] font-semibold text-mint">{shown.note}</span>}
                            <span className="mt-2.5 flex items-center justify-between gap-2">
                              <ReviewerStack list={reviewersOf(f)} size={24} />
                              {open > 0 && (
                                <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-grey" title={`Відкритих коментарів: ${open}`}>
                                  <ChatCircle size={13} aria-hidden="true" />
                                  {open}
                                </span>
                              )}
                            </span>
                          </span>
                        </span>
                        {picked && (
                          <span aria-hidden="true" className="absolute right-3 top-3 rounded-full bg-blue px-2.5 py-0.5 text-[12px] font-semibold text-white">
                            → {STATUS_META[pick.to].label}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* pointer drag ghost */}
      {drag && dragFile && (
        <div
          aria-hidden="true"
          className="card card-nav pointer-events-none fixed z-[80] flex rotate-2 items-center gap-3 p-2 shadow-[0_24px_64px_rgba(0,0,0,.6)]"
          style={{ left: drag.x - drag.ox, top: drag.y - drag.oy, width: drag.w }}
        >
          <span className="h-10 w-14 shrink-0 overflow-hidden rounded-[8px]">
            <Thumb file={dragFile} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{dragFile.name}</span>
            <span className="mt-1 block">
              <StatusChip status={drag.over ?? statusOf(dragFile).id} />
            </span>
          </span>
        </div>
      )}

      {dialog}
    </div>
  );
}

/** first-load placeholders for the board: same column footprint */
export function BoardSkeleton() {
  return (
    <div aria-hidden="true" className="-mx-4 flex gap-3 overflow-hidden px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {STATUS_ORDER.map((s, i) => (
        <div key={s} className="flex min-h-[320px] min-w-[248px] flex-1 basis-0 flex-col gap-2 rounded-[16px] border border-hairline p-2">
          <span className="skel mx-1.5 my-3.5 block h-3 w-24 rounded-full" />
          {Array.from({ length: 3 - (i % 2) }, (_, j) => (
            <span key={j} className="card card-flat block p-2">
              <span className="skel block aspect-[16/9] rounded-[10px]" />
              <span className="skel mt-3 block h-3.5 w-[70%] rounded-full" />
              <span className="skel mt-3 block h-[18px] w-10 rounded-full" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
