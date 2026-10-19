"use client";

import { ArrowLeft, CaretUp, Columns, DownloadSimple, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, type MenuItem } from "@/components/ui/Menu";
import { current, FILE_BY_ID, ME, PROJECTS, versionById } from "@/lib/demo-files";
import { Compare } from "./Compare";
import { byTime, FilePanel, newComment } from "./FilePanel";
import { PinStage } from "./PinStage";
import { ReviewBar } from "./ReviewBar";
import { stamp, useAppStore } from "./store";
import { VersionStrip } from "./VersionStrip";

const BTN = "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[14px] font-semibold transition-colors sm:px-4";

/** live media query (false during SSR) */
function useMedia(q: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    setOn(mq.matches);
    const f = () => setOn(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [q]);
  return on;
}

/**
 * /app/file/[id]: large preview with pins, version strip, comments / history panel
 * (bottom sheet below lg), final marking with undo, before / after compare.
 */
export function FileScreen({ id }: { id: string }) {
  const file = FILE_BY_ID[id];
  const router = useRouter();
  const { state, dispatch, toast, act, finalOf, commentsOf } = useAppStore();
  const latest = current(file);
  const finalId = finalOf(file);
  const wasId = state.wasFinal[file.id];

  const [vId, setVId] = useState(latest.id);
  const version = versionById(file, vId) ?? latest;
  const [hovered, setHovered] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [pair, setPair] = useState<[string, string]>(["", ""]);
  const [sheet, setSheet] = useState(false);
  const desktop = useMedia("(min-width: 64rem)");

  const all = commentsOf(file.id);
  const thisVersion = useMemo(() => all.filter((c) => c.versionId === version.id).sort(byTime), [all, version.id]);
  const earlier = useMemo(
    () => all.filter((c) => (versionById(file, c.versionId)?.v ?? 0) < version.v).sort((a, b) => byTime(b, a)),
    [all, file, version.v],
  );
  // pins are numbered in time order, general comments get no number
  const pinNo = useMemo(() => {
    const m: Record<string, number> = {};
    thisVersion.filter((c) => c.x !== null).forEach((c, i) => (m[c.id] = i + 1));
    return m;
  }, [thisVersion]);

  const back = () => {
    dispatch({ type: "ui", patch: { returnTo: file.id } });
    if (state.ui.fromList) {
      dispatch({ type: "ui", patch: { fromList: false } });
      router.back();
    } else router.push("/app");
  };

  const step = (d: number) => {
    const i = file.versions.findIndex((v) => v.id === version.id);
    const n = file.versions[Math.min(file.versions.length - 1, Math.max(0, i + d))];
    setVId(n.id);
  };

  const startCompare = () => {
    if (compare) return setCompare(false);
    // defaults: final vs latest (or the one before latest when the latest is final)
    const prev = file.versions[Math.max(0, file.versions.length - 2)].id;
    const a = finalId && finalId !== latest.id ? finalId : prev;
    setPair([a, latest.id]);
    setCompare(true);
  };

  // logged in «Історія»; undo restores the final, the previous one and the log entry
  const toggleFinal = () => {
    const next = finalId === version.id ? null : version.id;
    act(next ? `v${version.v} позначено фінальною` : `Позначку з v${version.v} знято`, [
      { type: "final", fileId: file.id, versionId: next, who: ME, at: stamp() },
    ]);
  };

  // Esc: compare → sheet → back to the list; ← / → switch versions (not while typing or on a slider / tab)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [role=slider], [role=tab]")) {
        if (e.key !== "Escape" || !t.closest("[role=slider]")) return;
      }
      if (e.key === "Escape") {
        if (compare) setCompare(false);
        else if (sheet && !desktop) setSheet(false);
        else back();
      } else if (!compare && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        step(e.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPick = (cid: string) => {
    setSheet(true);
    requestAnimationFrame(() => {
      const el = document.getElementById(`cm-${cid}`);
      el?.scrollIntoView({ block: "nearest" });
      el?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    });
  };

  const pr = PROJECTS.find((p) => p.id === file.project)!;
  const isFinal = finalId === version.id;
  const a = versionById(file, pair[0]) ?? latest;
  const b = versionById(file, pair[1]) ?? latest;
  const versionItems: MenuItem<string>[] = file.versions.map((v) => ({
    value: v.id,
    label: `v${v.v}`,
    hint: v.id === finalId ? "фінальна" : v.id === latest.id ? "остання" : undefined,
  }));

  return (
    <div data-app className="flex min-h-dvh flex-col pb-[72px] lg:h-dvh lg:overflow-hidden lg:pb-0">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-hairline bg-[#05070d]/85 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 lg:px-6">
        <button type="button" onClick={back} className={`${BTN} btn-secondary !px-3`} aria-label="Назад до файлів (Esc)">
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Назад</span>
        </button>
        <div className="min-w-0 flex-1 pl-1">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] sm:text-[16px]">{file.name}</h1>
          <p className="flex items-center gap-1.5 truncate text-[12px] text-grey">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: pr.color }} />
            <span className="truncate">{pr.name}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">
              v{version.v} з {latest.v}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={toggleFinal}
          aria-pressed={isFinal}
          className={`${BTN} ${isFinal ? "bg-mint text-[#05070d] hover:bg-[#6ff0d2]" : "btn-secondary"}`}
          title={isFinal ? "Зняти позначку" : `Позначити v${version.v} фінальною`}
        >
          <SealCheck size={18} weight={isFinal ? "fill" : "regular"} aria-hidden="true" className={isFinal ? "" : "text-mint"} />
          <span className="hidden md:inline">{isFinal ? "Фінальна" : "Позначити фінальною"}</span>
          <span className="sr-only md:hidden">{isFinal ? "Фінальна, зняти позначку" : "Позначити фінальною"}</span>
        </button>
        <button type="button" onClick={startCompare} aria-pressed={compare} className={`${BTN} btn-secondary`}>
          <Columns size={18} aria-hidden="true" />
          <span className="hidden md:inline">Порівняти</span>
          <span className="sr-only md:hidden">Порівняти</span>
        </button>
        <button type="button" onClick={() => toast("Це демо: завантаження тут вимкнене.")} className={`${BTN} btn-primary`}>
          <DownloadSimple size={18} weight="bold" aria-hidden="true" />
          <span className="hidden xl:inline">Завантажити</span>
          <span className="sr-only xl:hidden">Завантажити</span>
        </button>
      </header>

      <ReviewBar file={file} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {compare && (
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-4 pt-4 text-[13px] text-body">
              <span>Порівняти</span>
              {[0, 1].map((side) => (
                <Menu
                  key={side}
                  label={side === 0 ? "Ліва версія" : "Права версія"}
                  align={side === 0 ? "start" : "end"}
                  items={versionItems}
                  value={pair[side]}
                  onChange={(id) => setPair((p) => (side === 0 ? [id, p[1]] : [p[0], id]))}
                  current={<span className="font-semibold text-fg">v{(side === 0 ? a : b).v}</span>}
                />
              )).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, <span key="and">і</span>, el] : [el]), [])}
            </div>
          )}
          <div className="grid min-h-0 flex-1 place-items-center p-4 sm:p-6 lg:p-8 lg:[container-type:size]">
            {compare ? (
              <Compare file={file} a={a} b={b} finalId={finalId} />
            ) : (
              <PinStage
                file={file}
                version={version}
                comments={thisVersion}
                pinNo={pinNo}
                hovered={hovered}
                onHover={setHovered}
                onPick={onPick}
                onAdd={(x, y, text) => {
                  dispatch({ type: "add", comment: newComment(file.id, version.id, text, x, y) });
                  toast(`Позначку додано до v${version.v}`);
                }}
              />
            )}
          </div>
          <VersionStrip file={file} selectedId={version.id} finalId={finalId} wasId={wasId} onSelect={setVId} />
        </div>

        {/* right panel ≥ lg; bottom sheet below */}
        <aside
          aria-label="Коментарі та історія"
          className={`card flex flex-col rounded-none max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:h-[min(78dvh,640px)] max-lg:rounded-t-[20px] max-lg:border-x-0 max-lg:border-b-0 max-lg:transition-transform max-lg:duration-300 max-lg:ease-[var(--ease)] lg:w-[360px] lg:shrink-0 lg:border-y-0 lg:border-r-0 ${
            sheet ? "" : "max-lg:translate-y-[calc(100%-60px)]"
          }`}
        >
          <FilePanel
            key={file.id}
            file={file}
            version={version}
            finalId={finalId}
            wasId={wasId}
            thisVersion={thisVersion}
            earlier={earlier}
            pinNo={pinNo}
            hovered={hovered}
            onHover={setHovered}
            onSelectVersion={setVId}
            bodyInert={!desktop && !sheet}
            head={
              <button
                type="button"
                onClick={() => setSheet((s) => !s)}
                aria-expanded={sheet}
                className="flex h-[60px] shrink-0 items-center gap-3 px-5 text-left lg:hidden"
              >
                <span className="flex-1">
                  <span className="mx-auto mb-1.5 block h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
                  <span className="text-[14px] font-semibold">Коментарі й історія</span>
                  <span className="ml-2 text-[13px] text-grey tabular-nums">{thisVersion.length} до v{version.v}</span>
                </span>
                <CaretUp size={18} aria-hidden="true" className={`text-grey transition-transform duration-300 ${sheet ? "rotate-180" : ""}`} />
              </button>
            }
          />
        </aside>
      </div>
    </div>
  );
}
