"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { current, formatDate, g, ME, PEOPLE, STATUS_META, versionById, type DemoFile, type Status } from "@/lib/demo-files";
import { newComment } from "./FilePanel";
import { stamp, useAppStore } from "./store";
import { Thumb } from "./Thumb";

/**
 * Native modal <dialog>: top layer, focus trapped by the browser, Esc / backdrop click cancel.
 * Keys are stopped here so Esc doesn't also close the details panel or leave the file view.
 */
export function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // keys stay inside: Esc / arrows must not reach the page shortcuts behind the dialog
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(440px,calc(100%-32px))] overflow-visible border-0 bg-transparent p-0 text-fg backdrop:bg-[#05070d]/70"
    >
      {open && <div className="card max-h-[calc(100dvh-32px)] overflow-y-auto p-6">{children}</div>}
    </dialog>
  );
}

const SECONDARY = "btn-secondary inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-semibold";
const PRIMARY = "btn-primary inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-semibold disabled:opacity-40";

/** «Погоджено» needs a final version: pick it (latest by default) */
export function ApproveDialog({ file, onCancel, onConfirm }: { file: DemoFile | null; onCancel: () => void; onConfirm: (versionId: string) => void }) {
  const { finalOf } = useAppStore();
  const head = useId();
  const [pick, setPick] = useState<string | null>(null);
  const latest = file ? current(file) : null;
  const chosen = file ? (versionById(file, pick) ?? latest!) : null;
  // reset the choice for every new file
  const [forFile, setForFile] = useState<string | null>(null);
  if (file && file.id !== forFile) {
    setForFile(file.id);
    setPick(null);
  }

  return (
    <Modal open={!!file} onClose={onCancel} labelledBy={head}>
      {file && latest && chosen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(chosen.id);
          }}
        >
          <h2 id={head} className="text-[20px] font-semibold tracking-[-0.02em]">
            Погодити «{file.name}»?
          </h2>
          <p className="mt-1.5 text-[14px] text-body">Погоджена версія стає фінальною. Яку позначити?</p>
          <fieldset className="mt-5">
            <legend className="sr-only">Фінальна версія</legend>
            <div className="flex max-h-[280px] flex-col gap-1.5 overflow-y-auto pr-1">
              {[...file.versions].reverse().map((v) => {
                const on = v.id === chosen.id;
                return (
                  <label
                    key={v.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-[12px] border p-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue ${
                      on ? "border-mint/60 bg-mint/[0.06]" : "border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <input type="radio" name="final" value={v.id} checked={on} onChange={() => setPick(v.id)} className="sr-only" />
                    <span className="h-9 w-12 shrink-0 overflow-hidden rounded-[7px] border border-hairline">
                      <Thumb file={file} look={v.look} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                        v{v.v}
                        {v.id === latest.id && <span className="rounded-full bg-blue/12 px-2 py-px text-[12px] text-blue">остання</span>}
                        {v.id === finalOf(file) && <span className="rounded-full bg-white/[0.07] px-2 py-px text-[12px] font-normal text-grey">зараз фінальна</span>}
                      </span>
                      <span className="block truncate text-[12px] text-grey">
                        {v.note} · {PEOPLE[v.author].name.split(" ")[0]}, {formatDate(v.at)}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-mint" : "border-hairline-strong"}`}
                    >
                      {on && <span className="size-2 rounded-full bg-mint" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {/* fixed-height slot so the buttons never jump */}
          <p aria-live="polite" className="mt-3 min-h-[40px] text-[13px] leading-snug text-amber">
            {chosen.id !== latest.id
              ? `Є новіша v${latest.v}, тож файл лишиться «${STATUS_META.progress.label}» з позначкою «Погоджено v${chosen.v}».`
              : ""}
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className={SECONDARY}>
              Скасувати
            </button>
            <button type="submit" className={PRIMARY}>
              Погодити v{chosen.v}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/** «Потрібні правки» needs a short comment; it lands on the latest version's comments */
export function ChangesDialog({ file, onCancel, onSend }: { file: DemoFile | null; onCancel: () => void; onSend: (text: string) => void }) {
  const head = useId();
  const field = useId();
  const [text, setText] = useState("");
  const ok = text.trim().length >= 3;
  const latest = file ? current(file) : null;
  return (
    <Modal
      open={!!file}
      onClose={() => {
        setText("");
        onCancel();
      }}
      labelledBy={head}
    >
      {file && latest && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!ok) return;
            onSend(text.trim());
            setText("");
          }}
        >
          <h2 id={head} className="text-[20px] font-semibold tracking-[-0.02em]">
            Потрібні правки до v{latest.v}
          </h2>
          <p className="mt-1.5 text-[14px] text-body">Коротко, що виправити. Коментар додасться до v{latest.v}.</p>
          <label htmlFor={field} className="sr-only">
            Що виправити
          </label>
          <textarea
            id={field}
            autoFocus
            rows={3}
            required
            minLength={3}
            maxLength={280}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ok) {
                e.preventDefault();
                onSend(text.trim());
                setText("");
              }
            }}
            placeholder="Напр.: логотип на 10% менший"
            className="mt-4 block w-full resize-none rounded-[12px] border border-hairline bg-white/[0.03] px-3.5 py-3 text-[14px] text-fg outline-none! transition-[border-color,box-shadow] duration-150 placeholder:text-grey focus:border-blue/60 focus:ring-4 focus:ring-blue/15"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setText("");
                onCancel();
              }}
              className={SECONDARY}
            >
              Скасувати
            </button>
            <button type="submit" disabled={!ok} className={PRIMARY}>
              Надіслати правки
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/**
 * Status changes from the board, the details menu and the file view: one path, one toast with
 * «Скасувати». «Погоджено» first asks which version becomes final.
 */
export function useStatusChange() {
  const { act, statusOf } = useAppStore();
  const [ask, setAsk] = useState<{ file: DemoFile; done?: () => void } | null>(null);

  const commit = (file: DemoFile, to: Status, finalId?: string) => {
    const latest = current(file);
    const fin = finalId ? versionById(file, finalId) : undefined;
    const text =
      to === "approved" && fin && fin.id !== latest.id
        ? `«${file.name}»: погоджено v${fin.v}, є новіша v${latest.v}`
        : `«${file.name}» → ${STATUS_META[to].label}${fin ? `, v${fin.v} фінальна` : ""}`;
    act(text, [{ type: "status", fileId: file.id, to, finalId, who: ME, at: stamp() }]);
  };

  /** done runs after the change is committed (focus restore); not on cancel */
  const change = (file: DemoFile, to: Status, done?: () => void) => {
    if (to === statusOf(file).id) return;
    if (to === "approved") return setAsk({ file, done });
    commit(file, to);
    done?.();
  };

  const dialog = (
    <ApproveDialog
      file={ask?.file ?? null}
      onCancel={() => setAsk(null)}
      onConfirm={(vid) => {
        if (!ask) return;
        commit(ask.file, "approved", vid);
        setAsk(null);
        ask.done?.();
      }}
    />
  );

  return { change, dialog, asking: !!ask };
}

/** the current viewer's decision on the latest version, with toast + undo */
export function useDecide() {
  const { act, reviewersOf } = useAppStore();
  return (file: DemoFile, decision: "approved" | "changes", text?: string) => {
    const latest = current(file);
    // the last missing approval closes the round: say that the version became final
    const last = decision === "approved" && reviewersOf(file).every((r) => r.id === ME || r.state === "approved");
    const msg =
      decision === "changes"
        ? `Правки до v${latest.v} надіслано`
        : last
          ? `Погоджено всіма: v${latest.v} стала фінальною`
          : `Ти ${g(ME, "погодив", "погодила")} v${latest.v}`;
    act(msg, [
      {
        type: "decide",
        fileId: file.id,
        who: ME,
        decision,
        at: stamp(),
        comment: text ? newComment(file.id, latest.id, text, null, null) : undefined,
      },
    ]);
  };
}
