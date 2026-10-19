"use client";

import { ArrowCounterClockwise, ArrowRight, CaretDown, Check, ChatCircle, SealCheck, Warning } from "@phosphor-icons/react/dist/ssr";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { current, formatAgo, formatDate, PEOPLE, STATUS_META, type AppComment, type AuditEntry, type DemoFile, type Version } from "@/lib/demo-files";
import { STATUS_ICON } from "./status";
import { useAppStore } from "./store";

/** comments sorted oldest → newest (pin numbers follow this order) */
// parsed, not string-compared: seeds carry +03:00, new items are UTC
export const byTime = (a: AppComment, b: AppComment) => Date.parse(a.createdAt) - Date.parse(b.createdAt);

const vOf = (file: DemoFile, id: string) => file.versions.find((v) => v.id === id)?.v ?? 0;

/** vertical timeline, newest first: selected = blue, final = mint, previous final = grey chip */
export function VersionTimeline({
  file,
  finalId,
  wasId,
  selectedId,
  onSelect,
}: {
  file: DemoFile;
  finalId: string | null;
  wasId?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const latest = current(file).id;
  return (
    <ol className="relative">
      {[...file.versions].reverse().map((v, i, all) => {
        const sel = selectedId ? v.id === selectedId : v.id === latest;
        const fin = v.id === finalId;
        const body = (
          <>
            <span
              aria-hidden="true"
              className={`relative mt-0.5 grid size-[23px] shrink-0 place-items-center rounded-full border text-[10px] font-semibold tabular-nums ${
                fin ? "border-mint bg-mint text-[#05070d]" : sel ? "border-blue bg-blue/15 text-blue" : "border-hairline-strong text-grey"
              }`}
            >
              {v.v}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[14px] font-semibold ${sel ? "text-blue" : ""}`}>v{v.v}</span>
                {v.id === latest && <span className="rounded-full bg-blue/12 px-2 py-0.5 text-[12px] font-semibold text-blue">остання</span>}
                {fin && <span className="rounded-full bg-mint px-2 py-0.5 text-[12px] font-semibold text-[#05070d]">Фінальна</span>}
                {v.id === wasId && !fin && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[12px] text-grey">була фінальна</span>}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-body">{v.note}</span>
              <span className="mt-1 block text-[12px] text-grey">
                {PEOPLE[v.author].name} · {formatDate(v.at)}
              </span>
            </span>
          </>
        );
        return (
          <li key={v.id} className="relative pb-5 last:pb-0">
            {i < all.length - 1 && <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-16px)] w-px bg-hairline" />}
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(v.id)}
                aria-current={sel ? "true" : undefined}
                className="-m-1.5 flex w-[calc(100%+12px)] gap-3 rounded-[10px] p-1.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                {body}
              </button>
            ) : (
              <div className="flex gap-3">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** «Ірина Бойко погодила v6 · 17 жовт, 20:10», newest first: decisions, status and final changes */
export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) return <p className="text-[13px] text-grey">Подій ще немає: файл не надсилали на погодження.</p>;
  const list = [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || b.id.localeCompare(a.id, undefined, { numeric: true }));
  return (
    <ol className="flex flex-col gap-3">
      {list.map((e) => {
        const color =
          e.kind === "approve" || e.kind === "final" ? "#4fe3c1" : e.kind === "changes" ? "#ff7ab6" : STATUS_META[e.to ?? "progress"].color;
        const I = e.kind === "approve" ? Check : e.kind === "changes" ? ArrowCounterClockwise : e.kind === "final" ? SealCheck : STATUS_ICON[e.to ?? "progress"];
        return (
          <li key={e.id} className="flex gap-3">
            <span aria-hidden="true" className="mt-px grid size-[23px] shrink-0 place-items-center rounded-full" style={{ color, background: `${color}1f` }}>
              <I size={12} weight="bold" />
            </span>
            <p className="min-w-0 text-[13px] leading-snug text-body">
              {e.who && <span className="font-semibold text-fg">{PEOPLE[e.who].name} </span>}
              {e.who ? e.text : <span className="text-fg">{e.text}</span>}
              <span className="text-grey"> · {formatDate(e.at)}</span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

/** one comment: pin number, role, stale-version guard, resolve toggle */
export function CommentItem({
  c,
  n,
  file,
  hovered,
  onHover,
  compact,
}: {
  c: AppComment;
  n?: number;
  file: DemoFile;
  hovered?: boolean;
  onHover?: (id: string | null) => void;
  compact?: boolean;
}) {
  const { dispatch, toast } = useAppStore();
  const latest = current(file);
  const v = vOf(file, c.versionId);
  const stale = c.versionId !== latest.id;
  const client = c.role === "Клієнт";
  return (
    <li
      id={`cm-${c.id}`}
      onMouseEnter={() => onHover?.(c.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(c.id)}
      onBlur={() => onHover?.(null)}
      className={`rounded-[12px] border p-3.5 transition-colors ${hovered ? "border-blue/50 bg-blue/[0.05]" : "border-hairline"}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${client ? "bg-violet/15 text-violet-soft" : "bg-blue/15 text-blue"}`}
        >
          {c.author === "Ти" ? "Ти" : initials(c.author)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold">{c.author}</span>
            <span className={`shrink-0 rounded-full px-1.5 py-px text-[11px] ${client ? "bg-violet/12 text-violet-soft" : "bg-white/[0.07] text-fg/80"}`}>{c.role}</span>
          </span>
          <span className="block truncate text-[12px] text-grey">
            {c.company ? `${c.company} · ` : ""}
            {formatAgo(c.createdAt)}
            {compact ? ` · до v${v}` : ""}
          </span>
        </span>
        {n !== undefined && (
          <span
            aria-label={`Позначка ${n}`}
            className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums ${c.resolved ? "bg-white/[0.08] text-grey" : "bg-blue text-white"}`}
          >
            {n}
          </span>
        )}
      </div>
      <p className={`mt-2.5 text-[13px] leading-relaxed ${c.resolved ? "text-grey line-through decoration-white/20" : "text-body"}`}>{c.text}</p>

      {stale && !c.resolved && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-[#fbbf24]/10 px-3 py-2 text-[12px] text-[#fcd34d]">
          <span className="inline-flex items-center gap-1.5">
            <Warning size={14} weight="bold" aria-hidden="true" />
            Коментар до v{v} · актуальна v{latest.v}
          </span>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "move", id: c.id, versionId: latest.id });
              toast(`Перенесено на v${latest.v}`);
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-fg hover:bg-white/[0.06]"
          >
            Перенести на v{latest.v}
            <ArrowRight size={12} weight="bold" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-2.5 flex justify-end">
        <button
          type="button"
          aria-pressed={c.resolved}
          onClick={() => dispatch({ type: "resolve", id: c.id })}
          className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold transition-colors ${
            c.resolved ? "bg-green/12 text-green hover:bg-green/20" : "text-grey hover:bg-white/[0.06] hover:text-fg"
          }`}
        >
          <Check size={13} weight="bold" aria-hidden="true" />
          {c.resolved ? "Вирішено" : "Вирішити"}
        </button>
      </div>
    </li>
  );
}

/** general comment (no pin) on the shown version, by «Ти» */
function Composer({ file, version }: { file: DemoFile; version: Version }) {
  const { dispatch, toast } = useAppStore();
  const [text, setText] = useState("");
  const id = useId();
  const send = () => {
    const t = text.trim();
    if (!t) return;
    dispatch({ type: "add", comment: newComment(file.id, version.id, t, null, null) });
    setText("");
    toast(`Коментар додано до v${version.v}`);
  };
  return (
    <div className="mt-4 rounded-[12px] border border-hairline p-2 focus-within:border-blue/60">
      <label htmlFor={id} className="sr-only">
        Коментар до v{version.v}
      </label>
      <textarea
        id={id}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
        }}
        placeholder={`Коментар до v${version.v}…`}
        className="block w-full resize-none bg-transparent px-2 py-1.5 text-[13px] text-fg outline-none placeholder:text-grey focus-visible:outline-none"
      />
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] text-faint">Клікни на макет, щоб поставити позначку</span>
        <button type="button" onClick={send} disabled={!text.trim()} className="btn-primary h-8 rounded-full px-3.5 text-[13px] font-semibold disabled:opacity-40">
          Надіслати
        </button>
      </div>
    </div>
  );
}

export function newComment(fileId: string, versionId: string, text: string, x: number | null, y: number | null): AppComment {
  return {
    id: `${fileId}-u${Date.now().toString(36)}`,
    fileId,
    versionId,
    author: "Ти",
    role: "Команда",
    text,
    x,
    y,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
}

type Tab = "comments" | "history";

/** right panel of the file view: comments for the shown version (+ earlier ones), history */
export function FilePanel({
  file,
  version,
  finalId,
  wasId,
  thisVersion,
  earlier,
  pinNo,
  hovered,
  onHover,
  onSelectVersion,
  head,
  bodyInert,
}: {
  file: DemoFile;
  version: Version;
  finalId: string | null;
  wasId?: string;
  thisVersion: AppComment[];
  earlier: AppComment[];
  pinNo: Record<string, number>;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onSelectVersion: (id: string) => void;
  head?: ReactNode;
  /** collapsed bottom sheet: everything below the head is out of reach */
  bodyInert?: boolean;
}) {
  const { auditOf } = useAppStore();
  const audit = auditOf(file.id);
  const [tab, setTab] = useState<Tab>("comments");
  const [showEarlier, setShowEarlier] = useState(true);
  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "comments", label: "Коментарі", n: thisVersion.length },
    { id: "history", label: "Історія", n: file.versions.length + audit.length },
  ];
  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    const t = tab === "comments" ? "history" : "comments";
    setTab(t);
    document.getElementById(`ftab-${t}`)?.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {head}
      <div inert={bodyInert} className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pt-4">
        <div role="tablist" aria-label="Панель файлу" onKeyDown={onTabKey} className="flex gap-1 rounded-full border border-hairline p-1">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                id={`ftab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`fpanel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors ${on ? "bg-white/[0.08] text-fg" : "text-grey hover:text-fg"}`}
              >
                {t.label}
                <span className={`text-[12px] font-normal tabular-nums ${on ? "text-body" : "text-faint"}`}>{t.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id={`fpanel-${tab}`} role="tabpanel" aria-labelledby={`ftab-${tab}`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4">
        {tab === "comments" ? (
          <>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">До v{version.v}</p>
            {thisVersion.length ? (
              <ul className="flex flex-col gap-2.5">
                {thisVersion.map((c) => (
                  <CommentItem key={c.id} c={c} n={pinNo[c.id]} file={file} hovered={hovered === c.id} onHover={onHover} />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center rounded-[12px] border border-dashed border-hairline-strong px-5 py-6 text-center">
                <ChatCircle size={20} weight="light" className="text-grey" aria-hidden="true" />
                <p className="mt-2 text-[13px] text-body">До цієї версії коментарів немає.</p>
              </div>
            )}
            <Composer file={file} version={version} />

            {earlier.length > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  aria-expanded={showEarlier}
                  aria-controls="earlier"
                  onClick={() => setShowEarlier((s) => !s)}
                  className="flex w-full items-center gap-2 py-1 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-grey hover:text-fg"
                >
                  <CaretDown size={13} weight="bold" aria-hidden="true" className={`transition-transform duration-300 ${showEarlier ? "" : "-rotate-90"}`} />З попередніх версій
                  <span className="font-normal tabular-nums">{earlier.length}</span>
                </button>
                <div id="earlier" className="acc" data-open={showEarlier}>
                  <div>
                    <ul className="flex flex-col gap-2.5 pt-3" inert={!showEarlier}>
                      {earlier.map((c) => (
                        <CommentItem key={c.id} c={c} file={file} compact />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">Погодження</p>
            <AuditLog entries={audit} />
            <p className="mb-3 mt-7 text-[12px] font-semibold uppercase tracking-[0.12em] text-grey">Версії</p>
            <VersionTimeline file={file} finalId={finalId} wasId={wasId} selectedId={version.id} onSelect={onSelectVersion} />
          </>
        )}
      </div>
      </div>
    </div>
  );
}
