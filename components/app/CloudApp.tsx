"use client";

import {
  ArrowDown,
  ArrowsDownUp,
  ArrowUp,
  CalendarBlank,
  Clock,
  FolderOpen,
  HardDrives,
  Kanban,
  List,
  MagnifyingGlass,
  Rows,
  SquaresFour,
  TextAa,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_NOW, FILE_BY_ID, FILES, ME, PEOPLE, PROJECTS, STATUS_META, STATUS_ORDER, type Category, type PlanId, type Status } from "@/lib/demo-files";
import { Board, BoardSkeleton } from "./Board";
import { Details } from "./Details";
import { FileView, Skeleton } from "./FileView";
import { Sidebar, VIEWS, type View } from "./Sidebar";
import { STATUS_ICON } from "./status";
import { useAppStore, type Layout, type Sort, type SortDir } from "./store";
import { Menu, type MenuItem } from "@/components/ui/Menu";

const CHIPS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Усе" },
  { id: "layout", label: "Макети" },
  { id: "export", label: "Експорти" },
  { id: "video", label: "Відео" },
  { id: "doc", label: "Документи" },
];

const SORTS: MenuItem<Sort>[] = [
  { value: "updated", label: "Спочатку нові", icon: Clock },
  { value: "name", label: "За назвою", icon: TextAa },
  { value: "size", label: "За розміром", icon: HardDrives },
  { value: "due", label: "За терміном", icon: CalendarBlank },
];
// order a sort starts in when picked (newest / biggest first, A→Я / soonest first)
const NATURAL: Record<Sort, SortDir> = { updated: "desc", name: "asc", size: "desc", due: "asc" };

const LAYOUTS = [
  ["grid", "Сітка", SquaresFour],
  ["list", "Список", Rows],
  ["board", "Дошка за статусами", Kanban],
] as const;

const WEEK = 7 * 24 * 3600000;

export function CloudApp({ plan: planParam }: { plan: PlanId | null }) {
  const router = useRouter();
  const { state, dispatch, toast, statusOf } = useAppStore();
  // list UI state lives in the store, so it survives a trip to the file view and back
  const { view, project, chip, status, layout, sort, dir, query, selected, loaded } = state.ui;
  const set = (patch: Partial<typeof state.ui>) => dispatch({ type: "ui", patch });
  const setChip = (c: Category | "all") => set({ chip: c });
  const setStatus = (st: Status | "all") => set({ status: st });
  const setSort = (s: Sort) => set({ sort: s, dir: NATURAL[s] });
  const setQuery = (q: string) => set({ query: q });
  const setSelected = (id: string | null) => set({ selected: id });
  const starred = useMemo(() => new Set(state.ui.starred), [state.ui.starred]);
  const plan = planParam ?? state.plan ?? "free";
  const [drawer, setDrawer] = useState(false);
  const [ready, setReady] = useState(loaded);
  // reveal cards only on the first visit, not when coming back from a file
  const [reveal] = useState(!loaded);
  const [mac, setMac] = useState(true);
  const opener = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // first load of the session: skeletons for 400ms
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    if (loaded) return;
    const t = setTimeout(() => {
      setReady(true);
      set({ loaded: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?plan= from signup wins and is remembered
  useEffect(() => {
    if (planParam) dispatch({ type: "plan", plan: planParam });
  }, [planParam, dispatch]);

  // back from the file view: same scroll, focus on the file that was open
  useEffect(() => {
    const id = state.ui.returnTo;
    if (!ready || !id) return;
    const y = state.ui.scroll;
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
      document.querySelector<HTMLElement>(`[data-item][data-id="${id}"]`)?.focus({ preventScroll: true });
    });
    set({ returnTo: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const openFile = (id: string) => {
    set({ scroll: window.scrollY, returnTo: id, fromList: true, selected: null });
    router.push(`/app/file/${id}`);
  };

  // remember the layout per viewer (convenience only)
  useEffect(() => {
    if (loaded) return;
    try {
      const v = localStorage.getItem("cs-app-layout");
      if (v === "grid" || v === "list" || v === "board") set({ layout: v });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const changeLayout = (v: Layout) => {
    set({ layout: v });
    try {
      localStorage.setItem("cs-app-layout", v);
    } catch {}
  };

  const close = () => {
    setSelected(null);
    opener.current?.focus({ preventScroll: true });
  };
  const closeDrawer = () => {
    setDrawer(false);
    menuRef.current?.focus();
  };

  // Esc closes the drawer first, then the details panel; ⌘K / Ctrl K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key !== "Escape") return;
      if (drawer) closeDrawer();
      else if (selected) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const inView = (v: View) =>
    FILES.filter((f) =>
      v === "trash"
        ? f.trashed
        : !f.trashed &&
          (v === "all" ||
            (v === "recent" && DEMO_NOW - new Date(f.updatedAt).getTime() < WEEK) ||
            (v === "shared" && f.shared && f.owner !== ME) ||
            (v === "starred" && starred.has(f.id))),
    );

  const counts = { starred: inView("starred").length, trash: inView("trash").length };

  // everything but the status filter (the board shows all statuses as columns; chips count from here)
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = project ? FILES.filter((f) => !f.trashed && f.project === project) : inView(view);
    const list = base.filter(
      (f) =>
        (chip === "all" || f.category === chip) &&
        (!q || `${f.name} ${f.folder} ${PROJECTS.find((p) => p.id === f.project)!.name}`.toLowerCase().includes(q)),
    );
    const k = dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      // files without a due date stay last in both directions
      if (sort === "due" && !a.due !== !b.due) return a.due ? -1 : 1;
      const d =
        sort === "name"
          ? a.name.localeCompare(b.name, "uk")
          : sort === "size"
            ? a.size - b.size
            : sort === "due"
              ? (a.due ?? "").localeCompare(b.due ?? "")
              : a.updatedAt.localeCompare(b.updatedAt);
      return d * k || b.updatedAt.localeCompare(a.updatedAt);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, project, chip, sort, dir, query, starred]);
  const board = layout === "board";
  const files = useMemo(
    () => (board || status === "all" ? scoped : scoped.filter((f) => statusOf(f).id === status)),
    [scoped, board, status, statusOf],
  );
  const statusCount = (st: Status) => scoped.filter((f) => statusOf(f).id === st).length;

  const pr = project ? PROJECTS.find((p) => p.id === project)! : null;
  const title = pr ? pr.name : VIEWS.find((v) => v.id === view)!.label;
  const me = PEOPLE[ME];

  const go = (patch: Partial<typeof state.ui>) => {
    set({ ...patch, selected: null });
    setDrawer(false);
  };

  const sel = selected ? FILE_BY_ID[selected] : null;

  return (
    <div data-app className="min-h-dvh">
      <a href="#files" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-blue focus:px-4 focus:py-2">
        До файлів
      </a>

      <Sidebar
        plan={plan}
        view={view}
        project={project}
        counts={counts}
        open={drawer}
        onClose={closeDrawer}
        onView={(v) => go({ view: v, project: null })}
        onProject={(p) => go({ project: p })}
        onUpload={() => toast("Це демо: завантаження тут вимкнене.")}
      />

      <div className={`transition-[padding] duration-300 ease-[var(--ease)] md:pl-[72px] nav:pl-[248px] ${sel ? "wide:pr-[360px]" : ""}`}>
        {/* top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline bg-[#05070d]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            ref={menuRef}
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Меню"
            aria-expanded={drawer}
            className="grid size-10 shrink-0 place-items-center rounded-full text-body hover:bg-white/[0.06] hover:text-fg md:hidden"
          >
            <List size={22} weight="light" />
          </button>
          {/* the pill owns the focus ring (focus-within); hover never overrides it */}
          <label className="relative flex h-11 min-w-0 max-w-[560px] flex-1 items-center rounded-full border border-hairline bg-white/[0.03] transition-[border-color,box-shadow] duration-150 focus-within:border-blue/60 focus-within:ring-4 focus-within:ring-blue/15 [&:not(:focus-within)]:hover:border-hairline-strong">
            <MagnifyingGlass size={18} weight="light" className="ml-4 shrink-0 text-grey" aria-hidden="true" />
            <span className="sr-only">Пошук файлів</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Опиши файл словами…"
              // outline-none! beats the unlayered global :focus-visible outline in globals.css; the pill shows focus instead
              className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-[14px] text-fg shadow-none outline-none! ring-0 placeholder:text-grey [&::-webkit-search-cancel-button]:appearance-none"
            />
            <kbd className="mr-3 hidden shrink-0 rounded-md border border-hairline px-1.5 py-0.5 font-sans text-[12px] text-grey sm:block">{mac ? "⌘K" : "Ctrl K"}</kbd>
          </label>
          <button
            type="button"
            aria-label={`${me.name}, акаунт`}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #3d8bff, #8b5cf6)" }}
          >
            {me.initials}
          </button>
        </header>

        <div id="files" className="px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <nav aria-label="Шлях" className="text-[13px] text-grey">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <button type="button" onClick={() => go({ view: "all", project: null })} className="hover:text-fg">
                  Моя хмара
                </button>
              </li>
              {pr && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>Проєкти</li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-body">
                {title}
              </li>
            </ol>
          </nav>

          <div className="mt-2 flex items-baseline gap-3">
            {pr && <span aria-hidden="true" className="size-2.5 shrink-0 translate-y-[-3px] rounded-full" style={{ background: pr.color }} />}
            <h1 className="text-[clamp(26px,2.4vw,34px)] font-semibold leading-tight tracking-[-0.035em]">{title}</h1>
            <span className="text-[14px] tabular-nums text-grey">{ready ? files.length : ""}</span>
          </div>

          {/* toolbar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Тип файлів" className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
              {CHIPS.map((c) => {
                const on = chip === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setChip(c.id)}
                    className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                      on ? "bg-blue/15 text-blue" : "border border-hairline text-body hover:border-hairline-strong hover:text-fg"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Menu
                label="Сортування"
                icon={ArrowsDownUp}
                items={SORTS}
                value={sort}
                onChange={setSort}
                current={
                  <>
                    {SORTS.find((s) => s.value === sort)!.label}
                    <span aria-hidden="true" className="ml-1 text-grey">
                      {dir === "asc" ? "↑" : "↓"}
                    </span>
                    <span className="sr-only">, {dir === "asc" ? "за зростанням" : "за спаданням"}</span>
                  </>
                }
                footer={
                  <div role="group" aria-label="Напрям сортування" className="grid grid-cols-2 gap-1 rounded-full border border-hairline p-0.5">
                    {(
                      [
                        ["asc", "За зростанням", ArrowUp],
                        ["desc", "За спаданням", ArrowDown],
                      ] as const
                    ).map(([d, l, I]) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={dir === d}
                        onClick={() => set({ dir: d })}
                        className={`inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold transition-colors ${
                          dir === d ? "bg-white/[0.08] text-fg" : "text-grey hover:text-fg"
                        }`}
                      >
                        <I size={13} weight="bold" aria-hidden="true" />
                        {l}
                      </button>
                    ))}
                  </div>
                }
              />
              <div role="group" aria-label="Вигляд" className="flex h-9 rounded-full border border-hairline p-0.5">
                {LAYOUTS.map(([id, label, I]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={layout === id}
                    aria-label={label}
                    title={label}
                    onClick={() => changeLayout(id)}
                    className={`grid w-9 place-items-center rounded-full transition-colors ${layout === id ? "bg-white/[0.08] text-fg" : "text-grey hover:text-fg"}`}
                  >
                    <I size={17} weight={layout === id ? "regular" : "light"} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!board && (
            <div role="group" aria-label="Статус" className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
              {(["all", ...STATUS_ORDER] as const).map((st) => {
                const on = status === st;
                const I = st === "all" ? null : STATUS_ICON[st];
                const color = st === "all" ? null : STATUS_META[st].color;
                return (
                  <button
                    key={st}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStatus(st)}
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors ${
                      on ? "" : "border border-hairline text-body hover:border-hairline-strong hover:text-fg"
                    }`}
                    style={on ? { color: color ?? "var(--fg)", background: color ? `${color}24` : "rgba(255,255,255,.08)" } : undefined}
                  >
                    {I && <I size={14} weight="bold" aria-hidden="true" style={{ color: color! }} />}
                    {st === "all" ? "Усі статуси" : STATUS_META[st].label}
                    {st !== "all" && <span className="font-normal tabular-nums text-grey">{ready ? statusCount(st) : ""}</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6" aria-busy={!ready}>
            {!ready ? (
              board ? <BoardSkeleton /> : <Skeleton layout={layout === "list" ? "list" : "grid"} />
            ) : board && files.length ? (
              <Board files={files} selected={selected} onOpenFile={openFile} onOpen={(id, el) => ((opener.current = el), setSelected(id))} />
            ) : files.length ? (
              <FileView
                files={files}
                layout={layout === "list" ? "list" : "grid"}
                selected={selected}
                reveal={reveal}
                onOpenFile={openFile}
                onOpen={(id, el) => {
                  opener.current = el;
                  setSelected(id);
                }}
              />
            ) : (
              <div className="flex flex-col items-center rounded-[16px] border border-dashed border-hairline-strong px-6 py-16 text-center">
                <span className="grid size-11 place-items-center rounded-xl bg-blue/12 text-blue">
                  <FolderOpen size={22} weight="light" />
                </span>
                <p className="mt-4 text-[16px] font-semibold">{view === "trash" && !project ? "Кошик порожній" : "Тут нічого не знайшлося"}</p>
                <p className="mt-1 max-w-[42ch] text-[14px] text-body">
                  {query ? "Спробуй інші слова або зніми фільтр." : "Зміни фільтр або завантаж перший файл."}
                </p>
                {(chip !== "all" || query || (!board && status !== "all")) && (
                  <button type="button" onClick={() => (setChip("all"), setQuery(""), setStatus("all"))} className="mt-4 text-[14px] font-semibold text-blue hover:text-fg">
                    Скинути фільтри
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Details
        file={sel}
        starred={!!sel && starred.has(sel.id)}
        onStar={() => sel && set({ starred: starred.has(sel.id) ? state.ui.starred.filter((x) => x !== sel.id) : [...state.ui.starred, sel.id] })}
        onClose={close}
        onOpen={(id) => setSelected(id)}
        onOpenFile={openFile}
      />

    </div>
  );
}
