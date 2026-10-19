"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import {
  AUDIT,
  COMMENTS,
  current,
  DECISIONS,
  DEMO_NOW,
  FILE_BY_ID,
  FILES,
  finalVersion,
  g,
  STATUS_META,
  versionById,
  type AppComment,
  type AuditEntry,
  type Category,
  type Decision,
  type DemoFile,
  type PlanId,
  type ProjectId,
  type Status,
} from "@/lib/demo-files";
import type { View } from "./Sidebar";

/**
 * Client store for /app (context + useReducer). Lives in app/app/layout.tsx, so it survives
 * list ↔ file navigation. Finals, comments, statuses, review decisions, the audit log and the plan
 * persist to localStorage (best effort); list UI state (filters, scroll) is memory only.
 */

export type Sort = "updated" | "name" | "size" | "due";
export type SortDir = "asc" | "desc";
export type Layout ="grid" | "list" | "board";

type Ui = {
  view: View;
  project: ProjectId | null;
  chip: Category | "all";
  status: Status | "all";
  sort: Sort;
  /** asc / desc for the current sort; picking a sort resets it to that sort's natural order */
  dir: SortDir;
  layout: Layout;
  query: string;
  selected: string | null;
  /** list scroll + the file to refocus when coming back from the file view */
  scroll: number;
  returnTo: string | null;
  /** skeletons only on the first visit of the session */
  loaded: boolean;
  /** true when the file view was opened from the list (Back = history back) */
  fromList: boolean;
  starred: string[];
};

export type Persisted = {
  /** fileId → final versionId (null = none); missing = seed data */
  finals: Record<string, string | null>;
  /** fileId → the version that was final before the last change */
  wasFinal: Record<string, string>;
  comments: AppComment[];
  plan: PlanId | null;
  /** fileId → stored status; missing = seed data */
  status: Record<string, Status>;
  decisions: Decision[];
  audit: AuditEntry[];
};

type State = Persisted & { ui: Ui };

export type Action =
  | { type: "hydrate"; data: Partial<Persisted> }
  | { type: "final"; fileId: string; versionId: string | null; who: string; at: string }
  | { type: "status"; fileId: string; to: Status; finalId?: string | null; who: string; at: string }
  | { type: "decide"; fileId: string; who: string; decision: Decision["decision"]; at: string; comment?: AppComment }
  | { type: "add"; comment: AppComment }
  | { type: "resolve"; id: string }
  | { type: "move"; id: string; versionId: string }
  | { type: "plan"; plan: PlanId }
  | { type: "ui"; patch: Partial<Ui> };

const KEY = "cs-app-v2";

const initial: State = {
  finals: {},
  wasFinal: {},
  comments: COMMENTS,
  plan: null,
  status: {},
  decisions: DECISIONS,
  audit: AUDIT,
  ui: {
    view: "all",
    project: null,
    chip: "all",
    status: "all",
    sort: "updated",
    dir: "desc",
    layout: "grid",
    query: "",
    selected: null,
    scroll: 0,
    returnTo: null,
    loaded: false,
    fromList: false,
    starred: FILES.filter((f) => f.starred).map((f) => f.id),
  },
};

// ---------- pure derivations (used by the reducer and the context) ----------

export const finalIdOf = (s: Persisted, f: DemoFile) => (f.id in s.finals ? s.finals[f.id] : (finalVersion(f)?.id ?? null));

export type Shown = { id: Status; note?: string };

/** «Погоджено» = the final version was approved; a newer version reopens the file as «В роботі» */
export function shownStatus(s: Persisted, f: DemoFile): Shown {
  const st = s.status[f.id] ?? f.status;
  if (st !== "approved") return { id: st };
  const fin = versionById(f, finalIdOf(s, f));
  const last = current(f);
  if (fin?.id === last.id) return { id: "approved" };
  return { id: "progress", note: fin ? `Погоджено v${fin.v} · є новіша v${last.v}` : undefined };
}

export type ReviewState = Decision["decision"] | "waiting";
export type Reviewer = { id: string; state: ReviewState; at?: string };

/** reviewers and their decision on the latest version (anyone who decided on it counts as a reviewer) */
export function reviewersOf(s: Persisted, f: DemoFile): Reviewer[] {
  const last = current(f).id;
  const mine = s.decisions.filter((d) => d.fileId === f.id && d.versionId === last).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const ids = [...new Set([...f.reviewers, ...mine.map((d) => d.who)])];
  return ids.map((id) => {
    const d = mine.filter((x) => x.who === id).pop();
    return { id, state: d?.decision ?? "waiting", at: d?.at };
  });
}

const L = (s: Status) => STATUS_META[s].label;

/** timestamp for new events: never earlier than the demo «now», so the log stays in order */
export const stamp = () => new Date(Math.max(Date.now(), DEMO_NOW + 60000)).toISOString();

function withFinal(s: State, f: DemoFile, versionId: string | null): State {
  const prev = finalIdOf(s, f);
  const wasFinal = { ...s.wasFinal };
  if (prev && prev !== versionId) wasFinal[f.id] = prev;
  else delete wasFinal[f.id];
  return { ...s, finals: { ...s.finals, [f.id]: versionId }, wasFinal };
}

function reducer(s: State, a: Action): State {
  // audit ids follow the log length, so they stay stable across StrictMode double calls
  const log = (entries: Omit<AuditEntry, "id">[]) => [...s.audit, ...entries.map((e, i) => ({ ...e, id: `a${s.audit.length + i}-${e.fileId}` }))];
  switch (a.type) {
    case "hydrate":
      return { ...s, ...a.data, ui: s.ui };
    case "final": {
      const f = FILE_BY_ID[a.fileId];
      const prev = versionById(f, finalIdOf(s, f));
      const v = versionById(f, a.versionId);
      const text = v ? `${g(a.who, "позначив", "позначила")} v${v.v} фінальною` : `${g(a.who, "зняв", "зняла")} позначку фінальної з v${prev?.v}`;
      return { ...withFinal(s, f, a.versionId), audit: log([{ fileId: f.id, at: a.at, who: a.who, kind: "final", text }]) };
    }
    case "status": {
      const f = FILE_BY_ID[a.fileId];
      const from = shownStatus(s, f).id;
      const entries: Omit<AuditEntry, "id">[] = [
        { fileId: f.id, at: a.at, who: a.who, kind: "status", to: a.to, text: `${g(a.who, "змінив", "змінила")} статус: ${L(from)} → ${L(a.to)}` },
      ];
      let next: State = { ...s, status: { ...s.status, [f.id]: a.to } };
      // back to review = a new round: change requests on the latest version are cleared
      if (a.to === "review")
        next.decisions = s.decisions.filter((d) => !(d.fileId === f.id && d.versionId === current(f).id && d.decision === "changes"));
      if (a.finalId !== undefined && a.finalId !== finalIdOf(s, f)) {
        next = withFinal(next, f, a.finalId);
        const v = versionById(f, a.finalId);
        if (v) entries.push({ fileId: f.id, at: a.at, who: a.who, kind: "final", text: `${g(a.who, "позначив", "позначила")} v${v.v} фінальною` });
      }
      return { ...next, audit: log(entries) };
    }
    case "decide": {
      const f = FILE_BY_ID[a.fileId];
      const last = current(f);
      const from = shownStatus(s, f).id;
      let next: State = {
        ...s,
        // one decision per person per version: a new one replaces the old
        decisions: [
          ...s.decisions.filter((d) => !(d.fileId === f.id && d.who === a.who && d.versionId === last.id)),
          { fileId: f.id, who: a.who, versionId: last.id, decision: a.decision, at: a.at },
        ],
        comments: a.comment ? [...s.comments, a.comment] : s.comments,
      };
      const states = reviewersOf(next, f).map((r) => r.state);
      const to: Status = states.every((x) => x === "approved") ? "approved" : states.includes("changes") ? "changes" : "review";
      next.status = { ...s.status, [f.id]: to };
      const entries: Omit<AuditEntry, "id">[] = [
        a.decision === "approved"
          ? { fileId: f.id, at: a.at, who: a.who, kind: "approve", text: `${g(a.who, "погодив", "погодила")} v${last.v}` }
          : { fileId: f.id, at: a.at, who: a.who, kind: "changes", text: `${g(a.who, "попросив", "попросила")} правки до v${last.v}` },
      ];
      if (from !== to) entries.push({ fileId: f.id, at: a.at, who: null, kind: "status", to, text: `Статус: ${L(from)} → ${L(to)}` });
      // all approved: the approved version becomes the final one
      if (to === "approved" && finalIdOf(s, f) !== last.id) {
        next = withFinal(next, f, last.id);
        entries.push({ fileId: f.id, at: a.at, who: null, kind: "final", text: `v${last.v} стала фінальною` });
      }
      return { ...next, audit: log(entries) };
    }
    case "add":
      return { ...s, comments: [...s.comments, a.comment] };
    case "resolve":
      return { ...s, comments: s.comments.map((c) => (c.id === a.id ? { ...c, resolved: !c.resolved } : c)) };
    case "move":
      return { ...s, comments: s.comments.map((c) => (c.id === a.id ? { ...c, versionId: a.versionId } : c)) };
    case "plan":
      return { ...s, plan: a.plan };
    case "ui":
      return { ...s, ui: { ...s.ui, ...a.patch } };
  }
}

export type Toast = { id: number; text: string; action?: { label: string; run: () => void } };

type Ctx = {
  state: State;
  dispatch: (a: Action) => void;
  toast: (text: string, action?: Toast["action"]) => void;
  /** run actions and offer «Скасувати», which restores everything persisted to how it was */
  act: (text: string, actions: Action[]) => void;
  /** final versionId of a file (store override, else seed) */
  finalOf: (f: DemoFile) => string | null;
  commentsOf: (fileId: string) => AppComment[];
  statusOf: (f: DemoFile) => Shown;
  reviewersOf: (f: DemoFile) => Reviewer[];
  auditOf: (fileId: string) => AuditEntry[];
};

const StoreCtx = createContext<Ctx | null>(null);

export function useAppStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useAppStore outside AppStoreProvider");
  return c;
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const hydrated = useRef(false);
  const seq = useRef(0);

  // load once on the client; the app renders from seed data until then (same as the server)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<Persisted>;
        if (Array.isArray(d.comments)) dispatch({ type: "hydrate", data: d });
      }
    } catch {}
    hydrated.current = true;
  }, []);

  const { finals, wasFinal, comments, plan, status, decisions, audit } = state;
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ finals, wasFinal, comments, plan, status, decisions, audit }));
    } catch {}
  }, [finals, wasFinal, comments, plan, status, decisions, audit]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (text: string, action?: Toast["action"]) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-1), { id, text, action }]);
      setTimeout(() => dismiss(id), action ? 6000 : 3200);
    },
    [dismiss],
  );

  const value = useMemo<Ctx>(() => {
    const snap: Persisted = { finals, wasFinal, comments, plan, status, decisions, audit };
    return {
      state,
      dispatch,
      toast,
      act: (text, actions) => {
        actions.forEach(dispatch);
        toast(text, { label: "Скасувати", run: () => dispatch({ type: "hydrate", data: snap }) });
      },
      finalOf: (f) => finalIdOf(state, f),
      commentsOf: (id) => state.comments.filter((c) => c.fileId === id),
      statusOf: (f) => shownStatus(state, f),
      reviewersOf: (f) => reviewersOf(state, f),
      auditOf: (id) => state.audit.filter((e) => e.fileId === id),
    };
  }, [state, toast, finals, wasFinal, comments, plan, status, decisions, audit]);

  return (
    <StoreCtx.Provider value={value}>
      {children}
      {/* toasts: one polite live region, always mounted */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id} className="card card-nav pointer-events-auto flex animate-[quote-in_.4s_var(--ease)] items-center gap-4 rounded-full py-2 pl-5 pr-2 text-[14px] text-fg">
            <span>{t.text}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action!.run();
                  dismiss(t.id);
                }}
                className="h-8 rounded-full px-3 text-[13px] font-semibold text-blue hover:bg-white/[0.06] hover:text-fg"
              >
                {t.action.label}
              </button>
            ) : (
              <span className="w-3" />
            )}
          </div>
        ))}
      </div>
    </StoreCtx.Provider>
  );
}
