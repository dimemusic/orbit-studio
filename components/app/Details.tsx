"use client";

import { ArrowDown, ArrowsOut, ChatCircle, LinkSimple, LockKey, Star, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  current,
  FILE_BY_ID,
  formatAgo,
  formatDate,
  formatSize,
  PEOPLE,
  PROJECTS,
  type DemoFile,
} from "@/lib/demo-files";
import { Tag } from "../ui/Bits";
import { useStatusChange } from "./Approval";
import { byTime, CommentItem, VersionTimeline } from "./FilePanel";
import { DueChip, ReviewerStack, StatusMenu } from "./status";

const SUMMARY = { approved: "✓ погодили", changes: "⟳ правки", waiting: "… чекаємо" } as const;
import { useAppStore } from "./store";
import { Thumb } from "./Thumb";

type Tab = "versions" | "links" | "comments";
const TABS: { id: Tab; label: string }[] = [
  { id: "versions", label: "Версії" },
  { id: "links", label: "Зв'язки" },
  { id: "comments", label: "Коментарі" },
];

type Props = {
  file: DemoFile | null;
  starred: boolean;
  onStar: () => void;
  onClose: () => void;
  onOpen: (id: string) => void;
  /** «Відкрити»: the full file view */
  onOpenFile: (id: string) => void;
};

export function Details({ file, starred, onStar, onClose, onOpen, onOpenFile }: Props) {
  const { finalOf, commentsOf, state, statusOf, reviewersOf } = useAppStore();
  const { change, dialog } = useStatusChange();
  const [tab, setTab] = useState<Tab>("versions");
  const headRef = useRef<HTMLHeadingElement>(null);
  // keep the last file while the panel slides out
  const [shown, setShown] = useState<DemoFile | null>(file);
  if (file && file !== shown) setShown(file);
  const f = file ?? shown;
  const open = !!file;

  useEffect(() => {
    if (file) headRef.current?.focus({ preventScroll: true });
  }, [file]);

  const onTabKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length].id;
    setTab(t);
    document.getElementById(`tab-${t}`)?.focus();
  };

  return (
    <aside
      id="details"
      aria-label="Деталі файлу"
      className={`card fixed inset-y-0 right-0 z-30 flex w-full flex-col rounded-none border-y-0 border-r-0 transition-[transform,visibility] duration-300 ease-[var(--ease)] sm:w-[360px] ${
        open ? "visible translate-x-0" : "invisible translate-x-full"
      }`}
    >
      {f && (
        <>
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-hairline px-5">
            <h2 ref={headRef} tabIndex={-1} className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] outline-none">
              {f.name}
            </h2>
            <button
              type="button"
              onClick={onStar}
              aria-pressed={starred}
              aria-label="Позначити"
              className={`grid size-9 place-items-center rounded-full transition-colors hover:bg-white/[0.06] ${starred ? "text-[#fbbf24]" : "text-grey hover:text-fg"}`}
            >
              <Star size={18} weight={starred ? "fill" : "light"} />
            </button>
            <button type="button" onClick={onClose} aria-label="Закрити деталі (Esc)" className="grid size-9 place-items-center rounded-full text-grey transition-colors hover:bg-white/[0.06] hover:text-fg">
              <X size={18} weight="light" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-5">
            <div className="aspect-[4/3] overflow-hidden rounded-[12px] border border-hairline">
              <Thumb file={f} />
            </div>
            <button type="button" onClick={() => onOpenFile(f.id)} className="btn-primary mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold">
              <ArrowsOut size={17} weight="bold" aria-hidden="true" />
              Відкрити
            </button>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <Tag>.{f.kind}</Tag>
              <Tag color="blue">v{current(f).v}</Tag>
              <Tag color="green">
                <LockKey size={13} weight="bold" className="mr-1" aria-hidden="true" />
                Зашифровано на пристрої
              </Tag>
            </div>

            <dl className="mt-5 grid grid-cols-[96px_1fr] items-center gap-x-3 gap-y-2.5 text-[13px]">
              <dt className="text-grey">Статус</dt>
              <dd className="min-w-0">
                <StatusMenu status={statusOf(f).id} note={statusOf(f).note} onPick={(to) => change(f, to)} />
                {statusOf(f).note && <span className="mt-1 block text-[12px] font-semibold text-mint">{statusOf(f).note}</span>}
              </dd>
              <dt className="text-grey">Рецензенти</dt>
              <dd className="flex min-w-0 items-center gap-2.5">
                <ReviewerStack list={reviewersOf(f)} size={26} />
                <span className="truncate text-[12px] text-grey">
                  {(["approved", "changes", "waiting"] as const)
                    .map((k) => [k, reviewersOf(f).filter((r) => r.state === k).length] as const)
                    .filter(([, n]) => n)
                    .map(([k, n]) => `${SUMMARY[k]} ${n}`)
                    .join(" · ")}
                </span>
              </dd>
              <dt className="text-grey">Термін</dt>
              <dd>{f.due ? <DueChip due={f.due} /> : <span className="text-grey">не задано</span>}</dd>
              <dt className="text-grey">Проєкт</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: PROJECTS.find((p) => p.id === f.project)!.color }} aria-hidden="true" />
                <span className="truncate">{PROJECTS.find((p) => p.id === f.project)!.name}</span>
              </dd>
              <dt className="text-grey">Папка</dt>
              <dd className="truncate">{f.folder}</dd>
              <dt className="text-grey">Розмір</dt>
              <dd className="tabular-nums">{formatSize(f.size)}</dd>
              <dt className="text-grey">Власник</dt>
              <dd>{PEOPLE[f.owner].name}</dd>
              <dt className="text-grey">Оновлено</dt>
              <dd>{formatDate(f.updatedAt)}</dd>
            </dl>

            {/* tabs */}
            <div role="tablist" aria-label="Історія файлу" onKeyDown={onTabKey} className="mt-6 flex gap-1 rounded-full border border-hairline p-1">
              {TABS.map((t) => {
                const on = tab === t.id;
                const n = t.id === "versions" ? f.versions.length : t.id === "links" ? f.linkedTo.length + (f.linkedFrom ? 1 : 0) : commentsOf(f.id).length;
                return (
                  <button
                    key={t.id}
                    id={`tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                      on ? "bg-white/[0.08] text-fg" : "text-grey hover:text-fg"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[12px] font-normal tabular-nums ${on ? "text-body" : "text-faint"}`}>{n}</span>
                  </button>
                );
              })}
            </div>

            <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5">
              {tab === "versions" && <VersionTimeline file={f} finalId={finalOf(f)} wasId={state.wasFinal[f.id]} />}
              {tab === "links" && <Links file={f} onOpen={onOpen} />}
              {tab === "comments" && <Comments file={f} />}
            </div>
          </div>
        </>
      )}
      {dialog}
    </aside>
  );
}

function LinkRow({ file, label, onOpen, self }: { file: DemoFile; label: string; onOpen?: (id: string) => void; self?: boolean }) {
  const inner = (
    <>
      <span className="size-10 shrink-0 overflow-hidden rounded-[8px] border border-hairline">
        <Thumb file={file} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{file.name}</span>
        <span className="block text-[12px] text-grey">
          {label} · v{current(file).v}
        </span>
      </span>
    </>
  );
  if (self) return <div className="flex items-center gap-3 rounded-[10px] border border-blue/35 bg-blue/[0.06] p-2">{inner}</div>;
  return (
    <button type="button" onClick={() => onOpen?.(file.id)} className="flex w-full items-center gap-3 rounded-[10px] border border-hairline p-2 text-left transition-colors hover:border-hairline-strong hover:bg-white/[0.03]">
      {inner}
    </button>
  );
}

const Arrow = () => (
  <span aria-hidden="true" className="flex justify-center py-1 text-faint">
    <ArrowDown size={14} />
  </span>
);

/** source → this file → its exports */
function Links({ file, onOpen }: { file: DemoFile; onOpen: (id: string) => void }) {
  const src = file.linkedFrom ? FILE_BY_ID[file.linkedFrom] : null;
  const outs = file.linkedTo.map((id) => FILE_BY_ID[id]);
  if (!src && !outs.length)
    return (
      <Empty icon={<LinkSimple size={20} weight="light" />} text="Цей файл ще ні з чим не пов'язаний. Експорти з нього з'являться тут самі." />
    );
  return (
    <div>
      {src && (
        <>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">Джерело</p>
          <LinkRow file={src} label={formatAgo(src.updatedAt)} onOpen={onOpen} />
          <Arrow />
        </>
      )}
      <LinkRow file={file} label="цей файл" self />
      {outs.length > 0 && (
        <>
          <Arrow />
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">Експорти · {outs.length}</p>
          <ul className="flex flex-col gap-1.5">
            {outs.map((o) => (
              <li key={o.id}>
                <LinkRow file={o} label={formatAgo(o.updatedAt)} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** newest first; full threads, pins and moving live in the file view */
function Comments({ file }: { file: DemoFile }) {
  const { commentsOf } = useAppStore();
  const list = [...commentsOf(file.id)].sort((a, b) => byTime(b, a)).slice(0, 4);
  if (!list.length) return <Empty icon={<ChatCircle size={20} weight="light" />} text="Коментарів від клієнта ще немає." />;
  return (
    <ul className="flex flex-col gap-3">
      {list.map((c) => (
        <CommentItem key={c.id} c={c} file={file} compact />
      ))}
    </ul>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-[12px] border border-dashed border-hairline-strong px-5 py-8 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-white/[0.06] text-grey">{icon}</span>
      <p className="mt-3 max-w-[30ch] text-[13px] text-body">{text}</p>
    </div>
  );
}
