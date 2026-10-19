"use client";

import { useEffect, useRef } from "react";
import { formatDate, PEOPLE, type DemoFile } from "@/lib/demo-files";
import { Thumb } from "./Thumb";

/** v1…vN along the bottom: shown version = blue ring, final = mint ring + soft glow + «Фінальна». ← / → switch (FileScreen). */
export function VersionStrip({
  file,
  selectedId,
  finalId,
  wasId,
  onSelect,
}: {
  file: DemoFile;
  selectedId: string;
  finalId: string | null;
  wasId?: string;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>("[aria-current='true']");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [selectedId]);

  return (
    <div className="shrink-0 border-t border-hairline">
      <p className="sr-only">Версії: стрілки вліво і вправо перемикають версію</p>
      <ol ref={ref} aria-label="Версії" className="flex gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:thin] lg:px-6">
        {file.versions.map((v) => {
          const sel = v.id === selectedId;
          const fin = v.id === finalId;
          return (
            <li key={v.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(v.id)}
                aria-current={sel ? "true" : undefined}
                aria-label={`v${v.v}, ${PEOPLE[v.author].name}, ${formatDate(v.at)}${fin ? ", фінальна" : ""}`}
                className="group block w-[112px] rounded-[12px] p-1 text-left"
              >
                <span
                  className={`relative block aspect-[4/3] overflow-hidden rounded-[10px] transition-shadow duration-300 ${
                    fin
                      ? "ring-2 ring-mint shadow-[0_0_22px_-2px_rgb(79_227_193/0.55)]"
                      : sel
                        ? "ring-2 ring-blue"
                        : "ring-1 ring-hairline group-hover:ring-hairline-strong"
                  } ${fin && sel ? "outline outline-2 outline-offset-2 outline-blue" : ""}`}
                >
                  <Thumb file={file} look={v.look} />
                  {fin && (
                    <span className="absolute inset-x-1 bottom-1 rounded-full bg-mint py-0.5 text-center text-[11px] font-semibold text-[#05070d]">Фінальна</span>
                  )}
                  {!fin && v.id === wasId && (
                    <span className="absolute inset-x-1 bottom-1 rounded-full bg-[#05070d]/80 py-0.5 text-center text-[11px] text-grey">була фінальна</span>
                  )}
                </span>
                <span className="mt-2 flex items-baseline justify-between gap-1 px-0.5">
                  <span className={`text-[13px] font-semibold ${sel ? "text-blue" : fin ? "text-mint" : ""}`}>v{v.v}</span>
                  <span className="truncate text-[11px] text-grey">{PEOPLE[v.author].name.split(" ")[0]}</span>
                </span>
                <span className="block px-0.5 text-[11px] text-faint">{formatDate(v.at).split(",")[0]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
