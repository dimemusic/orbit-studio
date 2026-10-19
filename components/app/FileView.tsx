"use client";

import { ChatCircle, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, type KeyboardEvent } from "react";
import { current, formatAgo, formatSize, linkCount, PEOPLE, PROJECTS, versionById, type DemoFile } from "@/lib/demo-files";
import { DueChip, StatusChip } from "./status";
import { useAppStore } from "./store";
import { Thumb } from "./Thumb";

type Props = {
  files: DemoFile[];
  layout: "grid" | "list";
  selected: string | null;
  /** click / Space: details panel */
  onOpen: (id: string, el: HTMLElement) => void;
  /** double-click / Enter: file view */
  onOpenFile: (id: string) => void;
  /** fade cards in (first visit only) */
  reveal?: boolean;
};

/** solid mint: «фінальна» when the latest version is final, «фінальна v6» when an older one is */
function FinalChip({ file }: { file: DemoFile }) {
  const { finalOf } = useAppStore();
  const fin = versionById(file, finalOf(file));
  if (!fin) return null;
  return (
    <span className="rounded-full bg-mint px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-[#05070d]">
      фінальна{fin.v !== current(file).v ? ` v${fin.v}` : ""}
    </span>
  );
}

function Status({ file, overlay, compact }: { file: DemoFile; overlay?: boolean; compact?: boolean }) {
  const { statusOf } = useAppStore();
  const s = statusOf(file);
  return <StatusChip status={s.id} note={s.note} overlay={overlay} compact={compact} />;
}

function Counts({ file }: { file: DemoFile }) {
  const { commentsOf } = useAppStore();
  const open = commentsOf(file.id).filter((c) => !c.resolved).length;
  const links = linkCount(file);
  return (
    <span className="flex items-center gap-2.5 text-[12px] tabular-nums text-grey">
      {links > 0 && (
        <span className="inline-flex items-center gap-1" title={`Зв'язків: ${links}`}>
          <LinkSimple size={13} aria-hidden="true" />
          <span className="sr-only">Зв'язків:</span>
          {links}
        </span>
      )}
      {open > 0 && (
        <span className="inline-flex items-center gap-1" title={`Відкритих коментарів: ${open}`}>
          <ChatCircle size={13} aria-hidden="true" />
          <span className="sr-only">Відкритих коментарів:</span>
          {open}
        </span>
      )}
    </span>
  );
}

/**
 * Grid / list of files with one roving tab stop: arrows move (columns are measured from the layout),
 * Home / End jump, Space / click opens details, Enter / double-click opens the file view.
 */
export function FileView({ files, layout, selected, onOpen, onOpenFile, reveal = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { finalOf } = useAppStore();
  // the latest version is the approved one: mint edge (list) / faint mint ring (grid)
  const latestFinal = (f: DemoFile) => finalOf(f) === current(f).id;
  const [focus, setFocus] = useState(0);
  const idx = Math.min(focus, files.length - 1);

  const onKey = (e: KeyboardEvent) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-item]") ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    if (e.key === "Enter") {
      e.preventDefault();
      onOpenFile(files[at].id);
      return;
    }
    let cols = 1;
    if (layout === "grid") {
      const top = Math.round(items[0].getBoundingClientRect().top);
      cols = items.filter((el) => Math.round(el.getBoundingClientRect().top) === top).length || 1;
    }
    const map: Record<string, number> = {
      ArrowRight: layout === "grid" ? at + 1 : at,
      ArrowLeft: layout === "grid" ? at - 1 : at,
      ArrowDown: at + cols,
      ArrowUp: at - cols,
      Home: 0,
      End: items.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(items.length - 1, map[e.key]));
    setFocus(next);
    items[next].focus();
  };

  const props = (f: DemoFile, i: number) => ({
    "data-item": "",
    "data-id": f.id,
    tabIndex: i === idx ? 0 : -1,
    onDoubleClick: () => onOpenFile(f.id),
    title: "Двічі клікни або Enter, щоб відкрити",
    onFocus: () => setFocus(i),
    onClick: (e: React.MouseEvent<HTMLElement>) => onOpen(f.id, e.currentTarget),
    "aria-current": selected === f.id ? ("true" as const) : undefined,
    "aria-controls": "details",
  });

  // project + owner only when the row is wide enough: ≥ 1440px and the details panel closed
  const WIDE = selected ? "hidden" : "hidden wide:table-cell";

  if (layout === "grid")
    return (
      <div ref={ref} onKeyDown={onKey}>
        <ul aria-label="Файли" className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(208px,1fr))] sm:gap-4">
          {files.map((f, i) => (
            <li key={f.id} data-reveal={reveal ? "" : undefined} style={{ ["--d" as string]: `${Math.min(i, 10) * 35}ms` }}>
              <button
                type="button"
                {...props(f, i)}
                className={`card card-flat group flex w-full flex-col p-2 text-left transition-[border-color] duration-200 ${
                  selected === f.id ? "!border-blue/70" : latestFinal(f) ? "!border-mint/30 hover:!border-mint/50" : "hover:border-white/[0.16]"
                }`}
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px]">
                  <Thumb file={f} className="transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.03]" />
                  <span className="absolute left-2 top-2 rounded-full bg-[#05070d]/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg/85">
                    {f.kind}
                  </span>
                  <span className="absolute right-2 top-2">
                    <Status file={f} overlay compact />
                  </span>
                </span>
                <span className="px-1.5 pb-1 pt-3">
                  <span className="block truncate text-[14px] font-semibold tracking-[-0.01em]">{f.name}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-blue/12 px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-blue">v{current(f).v}</span>
                    <FinalChip file={f} />
                  </span>
                  <span className="mt-2.5 flex h-[22px] items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[12px] text-grey">{formatAgo(f.updatedAt)}</span>
                    <DueChip due={f.due} />
                    <Counts file={f} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div ref={ref} onKeyDown={onKey} className="card card-flat overflow-hidden">
      <table className="w-full table-fixed border-collapse text-left text-[13px]">
        <caption className="sr-only">Файли</caption>
        <thead>
          <tr className="h-10 border-b border-hairline text-[12px] text-grey">
            <th scope="col" className="pl-4 font-normal">Назва</th>
            <th scope="col" className="hidden w-[156px] font-normal sm:table-cell">Статус</th>
            <th scope="col" className="hidden w-[108px] font-normal lg:table-cell">Термін</th>
            <th scope="col" className={`${WIDE} w-[200px] font-normal`}>Проєкт</th>
            <th scope="col" className={`${WIDE} w-[150px] font-normal`}>Власник</th>
            <th scope="col" className="hidden w-[90px] font-normal md:table-cell">Розмір</th>
            <th scope="col" className="w-[110px] font-normal">Оновлено</th>
            <th scope="col" className="hidden w-[84px] pr-4 font-normal sm:table-cell">
              <span className="sr-only">Зв'язки й коментарі</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, i) => {
            const pr = PROJECTS.find((p) => p.id === f.project)!;
            const on = selected === f.id;
            return (
              <tr
                key={f.id}
                data-reveal={reveal ? "" : undefined}
                style={{ ["--d" as string]: `${Math.min(i, 10) * 25}ms` }}
                className={`relative h-14 border-b border-hairline transition-colors last:border-0 hover:bg-white/[0.03] ${on ? "bg-blue/[0.07]" : ""}`}
              >
                <td className={`pl-4 ${latestFinal(f) ? "shadow-[inset_2px_0_0_var(--mint)]" : ""}`}>
                  <button type="button" {...props(f, i)} className="flex w-full min-w-0 items-center gap-3 text-left after:absolute after:inset-0 after:content-['']">
                    <span className="size-9 shrink-0 overflow-hidden rounded-[7px] border border-hairline">
                      <Thumb file={f} />
                    </span>
                    <span className="min-w-0 truncate font-semibold text-fg">{f.name}</span>
                    {/* phones: the status column is hidden, keep the icon */}
                    <span className="sm:hidden">
                      <Status file={f} compact />
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 xl:flex">
                      <span className="rounded-full bg-blue/12 px-2 py-0.5 text-[12px] font-semibold leading-[18px] text-blue">v{current(f).v}</span>
                      <FinalChip file={f} />
                    </span>
                  </button>
                </td>
                <td className="hidden sm:table-cell">
                  <Status file={f} />
                </td>
                <td className="hidden lg:table-cell">
                  <DueChip due={f.due} />
                </td>
                <td className={WIDE}>
                  <span className="flex items-center gap-2 truncate text-body">
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: pr.color }} />
                    <span className="truncate">{pr.name}</span>
                  </span>
                </td>
                <td className={`${WIDE} text-body`}>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: `${PEOPLE[f.owner].color}55` }}>
                      {PEOPLE[f.owner].initials}
                    </span>
                    <span className="truncate">{PEOPLE[f.owner].name.split(" ")[0]}</span>
                  </span>
                </td>
                <td className="hidden tabular-nums text-body md:table-cell">{formatSize(f.size)}</td>
                <td className="text-grey">{formatAgo(f.updatedAt)}</td>
                <td className="hidden pr-4 sm:table-cell">
                  <Counts file={f} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** first load placeholders: same footprint as the grid cards */
export function Skeleton({ layout }: { layout: "grid" | "list" }) {
  if (layout === "list")
    return (
      <div className="card card-flat overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex h-14 items-center gap-3 border-b border-hairline px-4 last:border-0">
            <span className="skel size-9 rounded-[7px]" />
            <span className="skel h-3 w-[40%] rounded-full" />
            <span className="skel ml-auto h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  return (
    <ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(208px,1fr))] sm:gap-4">
      {Array.from({ length: 10 }, (_, i) => (
        <li key={i} className="card card-flat p-2">
          <span className="skel block aspect-[4/3] rounded-[10px]" />
          <span className="block px-1.5 pb-1 pt-3">
            <span className="skel block h-3.5 w-[70%] rounded-full" />
            <span className="skel mt-3 block h-[18px] w-10 rounded-full" />
            <span className="skel mt-3 block h-3 w-[45%] rounded-full" />
          </span>
        </li>
      ))}
    </ul>
  );
}
