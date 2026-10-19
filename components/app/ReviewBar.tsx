"use client";

import { ArrowCounterClockwise, Check } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { current, g, ME, PEOPLE, type DemoFile } from "@/lib/demo-files";
import { ChangesDialog, useDecide, useStatusChange } from "./Approval";
import { Avatar, DueChip, REVIEW_META, ReviewBadge, StatusMenu } from "./status";
import { useAppStore } from "./store";

const BTN = "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-[14px] font-semibold transition-colors sm:px-4";

/**
 * File view, under the header: status menu (+ «Погоджено v6 · є новіша v7»), reviewers with their
 * state on the latest version, deadline, and the viewer's own «Погодити» / «Потрібні правки».
 */
export function ReviewBar({ file }: { file: DemoFile }) {
  const { statusOf, reviewersOf } = useAppStore();
  const { change, dialog } = useStatusChange();
  const decide = useDecide();
  const [asking, setAsking] = useState(false);
  const shown = statusOf(file);
  const list = reviewersOf(file);
  const latest = current(file);
  const mine = list.find((r) => r.id === ME)?.state;

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 overflow-x-auto border-b border-hairline px-3 [scrollbar-width:none] sm:px-4 lg:px-6">
      <StatusMenu status={shown.id} note={shown.note} onPick={(to) => change(file, to)} />
      {shown.note && <span className="hidden shrink-0 text-[13px] font-semibold text-mint md:inline">{shown.note}</span>}

      <span aria-hidden="true" className="hidden h-5 w-px shrink-0 bg-hairline sm:block" />

      <ul aria-label={`Рецензенти v${latest.v}`} className="flex shrink-0 items-center gap-1.5 nav:gap-3">
        {list.map((r) => {
          const M = REVIEW_META[r.state];
          return (
            <li key={r.id} className="flex items-center gap-2" title={`${PEOPLE[r.id].name}${PEOPLE[r.id].company ? `, ${PEOPLE[r.id].company}` : ""}: ${M.text(r.id).slice(2)}`}>
              <span className="relative">
                <Avatar id={r.id} size={28} />
                <ReviewBadge state={r.state} />
              </span>
              <span className="hidden whitespace-nowrap text-[13px] leading-tight nav:block">
                <span className="block font-semibold text-fg">{r.id === ME ? "Ти" : PEOPLE[r.id].name.split(" ")[0]}</span>
                <span className="block text-[12px]" style={{ color: M.color }}>
                  {M.text(r.id)}
                </span>
              </span>
              <span className="sr-only nav:hidden">
                {PEOPLE[r.id].name}: {M.text(r.id).slice(2)}
              </span>
            </li>
          );
        })}
      </ul>

      <DueChip due={file.due} />

      <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
        <button
          type="button"
          onClick={() => setAsking(true)}
          aria-pressed={mine === "changes"}
          title={`Потрібні правки до v${latest.v}`}
          className={`${BTN} ${mine === "changes" ? "bg-rose/15 text-rose" : "btn-secondary"}`}
        >
          <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" className="text-rose" />
          <span className="max-sm:sr-only">Потрібні правки</span>
        </button>
        <button
          type="button"
          onClick={() => mine !== "approved" && decide(file, "approved")}
          aria-pressed={mine === "approved"}
          title={mine === "approved" ? `Ти вже ${g(ME, "погодив", "погодила")} v${latest.v}` : `Погодити v${latest.v}`}
          className={`${BTN} ${mine === "approved" ? "bg-mint/15 text-mint" : "btn-primary"}`}
        >
          <Check size={16} weight="bold" aria-hidden="true" />
          {mine === "approved" ? `${g(ME, "Погодив", "Погодила")}` : "Погодити"}
        </button>
      </div>

      <ChangesDialog
        file={asking ? file : null}
        onCancel={() => setAsking(false)}
        onSend={(text) => {
          decide(file, "changes", text);
          setAsking(false);
        }}
      />
      {dialog}
    </div>
  );
}
