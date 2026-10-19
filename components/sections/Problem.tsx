"use client";

import {
  EnvelopeSimple,
  FileImage,
  GoogleDriveLogo,
  Laptop,
  TelegramLogo,
  Usb,
} from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { G } from "../ui/Bits";
import { HomeSection } from "../ui/HomeSection";
import { useInView } from "../ui/hooks";

// «problem» marker colour, used sparingly: rose #fb7185 (not part of the category accents)
const ROSE_TEXT = "text-[#fb7185]";
const ROSE_TINT = "bg-[#fb7185]/12";

/** 02: the pain before the product. Chaos here, order from «How it works» on (the dust collapses into roots meanwhile). */
export function Problem() {
  return (
    <HomeSection
      id="problem"
      label="Знайомо?"
      color="violet"
      title={
        <>
          Де ж <G tone="warm">фінальна версія?</G>
        </>
      }
      lead="Якщо хоч раз шукав файл довше, ніж його робив, ти знаєш, про що ми."
    >
      <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
        <ProblemCard i={0} title="Чотири «фінали»" text="І жоден не точно фінальний.">
          <Duplicates />
        </ProblemCard>
        <ProblemCard i={1} title="Правки не туди" text="Клієнт коментує стару версію, а ти нову.">
          <WrongVersion />
        </ProblemCard>
        <ProblemCard i={2} title="П'ять місць" text="Файли живуть усюди, крім одного місця.">
          <Scattered />
        </ProblemCard>
      </ul>

      <a
        href="#how"
        data-reveal
        style={{ ["--d" as string]: "300ms" }}
        className="legible group mt-12 inline-flex items-center gap-2 rounded-full py-1 text-[15px] text-body transition-colors hover:text-fg"
      >
        <span>
          <span translate="no">Cloud Sphere</span> з&apos;єднує все це в одну пам&apos;ять
        </span>
        <span aria-hidden="true" className="inline-block animate-[bob_2s_ease-in-out_infinite]">
          ↓
        </span>
      </a>
    </HomeSection>
  );
}

function ProblemCard({ i, title, text, children }: { i: number; title: string; text: string; children: ReactNode }) {
  return (
    <li data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
      <div className="card group flex h-full flex-col p-5 text-left sm:p-6">
        <div aria-hidden="true" className="relative h-[140px]">
          {children}
        </div>
        <h3 className="mt-5 text-title font-semibold">{title}</h3>
        <p className="mt-1.5 text-[15px] text-body">{text}</p>
      </div>
    </li>
  );
}

/* ---------- 1: duplicates pile up on reveal, shiver on hover ---------- */

const DUPES = ["kv_final.psd", "kv_final_v2.psd", "kv_final_FINAL.psd", "kv_final_REAL_2.psd"];

function Duplicates() {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useInView(ref, 0.5);
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(DUPES.length);
      return;
    }
    let n = 1;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= DUPES.length) window.clearInterval(id);
    }, 450);
    return () => window.clearInterval(id);
  }, [seen]);

  return (
    <ul ref={ref} className="flex h-full flex-col justify-center gap-1.5">
      {DUPES.map((name, i) => (
        <li
          key={name}
          className={`transition-[opacity,transform] duration-500 ease-[var(--ease)] ${
            i < shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {/* inner row carries the hover jitter so it never fights the reveal transform */}
          <span
            className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5 group-hover:animate-[jitter_0.3s_steps(2)_infinite]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <FileImage size={16} weight="light" className="shrink-0 text-grey" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{name}</span>
            <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${ROSE_TINT} ${ROSE_TEXT}`}>
              ?
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 2: the comment lands on v3 while v7 is current ---------- */

// Two versions side by side. Everything runs once when the wrapping <li data-reveal> gets the data-in ATTRIBUTE
// (`[[data-in]_&]:` = inside an element that has it); reduced motion shows the final state.
const WV_SKELETON = "block h-1.5 rounded-full bg-white/[0.08]";
const WV_TAG = "block max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium leading-none";

function WrongVersion() {
  return (
    <div className="flex h-full items-start">
      {/* old version (v3): the one the client commented on */}
      <div className="relative flex min-w-0 flex-1 flex-col pt-3.5">
        <div className="h-[100px] -rotate-3 rounded-xl border border-white/10 p-2.5 opacity-[0.55]">
          <span className={`${WV_TAG} w-fit bg-white/[0.07] text-grey`}>v3 · березень</span>
          <span className={`${WV_SKELETON} mt-2.5 w-3/4`} />
          <span className={`${WV_SKELETON} mt-1.5 w-1/2`} />
          <span className="mt-2.5 block h-6 w-full rounded-md bg-white/[0.05]" />
        </div>

        {/* client comment pinned to the top-right corner, drops in at 300ms with a tiny overshoot */}
        <span
          className="absolute right-1.5 top-0 flex max-w-[calc(100%-6px)] -translate-y-3 scale-[0.8] items-center gap-1 opacity-0 transition-[opacity,translate,scale] duration-500 delay-300 ease-[cubic-bezier(.22,1.3,.36,1)] [[data-in]_&]:translate-y-0 [[data-in]_&]:scale-100 [[data-in]_&]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#fb7185] text-[11px] font-semibold leading-none text-bg">К</span>
          <span className={`min-w-0 truncate rounded-xl border border-[#fb7185]/30 bg-[#fb7185]/10 px-2 py-1 text-[12px] leading-none ${ROSE_TEXT}`}>
            Логотип більше!
          </span>
        </span>

        <span className="mt-1.5 w-fit max-w-full truncate rounded-full bg-[#fb7185]/15 px-2 py-[3px] text-[11px] leading-none text-[#fb7185] opacity-0 transition-opacity duration-500 delay-[900ms] [[data-in]_&]:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none">
          ✕ не та версія
        </span>
      </div>

      {/* what sits between them */}
      <div className="relative h-full w-10 shrink-0">
        <span className="absolute inset-x-0.5 top-[64px] border-t border-dashed border-white/20" />
        <span className="absolute inset-x-0 top-[70px] text-center text-[11px] leading-[1.15] text-faint">4 версії</span>
      </div>

      {/* current version (v7) */}
      <div className="flex min-w-0 flex-1 flex-col pt-3.5">
        <div className="flex h-[100px] flex-col rounded-xl border border-blue/40 p-2.5 shadow-[0_0_24px_rgb(61_139_255/0.16)]">
          <span className={`${WV_TAG} w-fit bg-blue/12 text-blue`}>v7 · сьогодні</span>
          <span className={`${WV_SKELETON} mt-2.5 w-3/4`} />
          <span className={`${WV_SKELETON} mt-1.5 w-1/2`} />
          <span className="mt-auto flex items-center gap-1.5">
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-blue text-[9px] font-semibold leading-none text-bg">Ти</span>
            <span className="size-1.5 shrink-0 rounded-full bg-blue [animation-delay:1.5s] [[data-in]_&]:animate-pulse motion-reduce:animate-none" />
            <span className="min-w-0 truncate text-[11px] leading-none text-grey">0 коментарів</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3: five places, lines toward the centre that never connect ---------- */

// The same layout in five places under five names: each place is a mini file card.
// x/y = card centre (% of the 140px visual), w = card width, sx/sy = where its dashed line leaves the card (none for the side cards).
const PLACES: { label: string; file: string; Icon: typeof Usb; x: number; y: number; w: number; sx?: number; sy?: number }[] = [
  { label: "Drive", file: "kv_final_v4.psd", Icon: GoogleDriveLogo, x: 18, y: 14, w: 36, sx: 36, sy: 14 },
  { label: "Telegram", file: "kv_final (1).psd", Icon: TelegramLogo, x: 82, y: 14, w: 36, sx: 64, sy: 14 },
  { label: "Пошта", file: "kv_готово.psd", Icon: EnvelopeSimple, x: 18, y: 50, w: 36 },
  { label: "Флешка", file: "kv_final_NEW.psd", Icon: Usb, x: 82, y: 50, w: 36 },
  { label: "Ноутбук", file: "kv_final_copy.psd", Icon: Laptop, x: 50, y: 86, w: 40, sx: 50, sy: 73 },
];
const CX = 50;
const CY = 50;

function Scattered() {
  return (
    <div className="relative h-full">
      <svg className="absolute inset-0 h-[140px] w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {PLACES.filter((p) => p.sx !== undefined && p.sy !== undefined).map((p) => {
          // stop well short of the centre: the line never reaches it
          const sx = p.sx as number;
          const sy = p.sy as number;
          const ex = sx + (CX - sx) * 0.6;
          const ey = sy + (CY - sy) * 0.6;
          return (
            <line
              key={p.label}
              x1={sx}
              y1={sy}
              x2={ex}
              y2={ey}
              stroke="#9cc4ff"
              strokeOpacity={0.3}
              strokeWidth={1}
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* empty centre */}
      <span
        className={`absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-dashed border-white/20 text-[15px] font-semibold ${ROSE_TEXT}`}
        style={{ left: `${CX}%`, top: `${CY}%` }}
      >
        ?
      </span>

      {PLACES.map((p) => {
        // drift outward from the centre on hover
        const dx = p.x - CX;
        const dy = p.y - CY;
        const len = Math.hypot(dx, dy) || 1;
        const drift = { ["--dx" as string]: `${Math.round((dx / len) * 6)}px`, ["--dy" as string]: `${Math.round((dy / len) * 6)}px` } as CSSProperties;
        return (
          <span key={p.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%` }}>
            <span
              style={drift}
              className="block rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left transition-transform duration-500 ease-[var(--ease)] group-hover:[transform:translate(var(--dx),var(--dy))]"
            >
              <span className="flex items-center gap-1 text-grey">
                <p.Icon size={12} weight="light" className="shrink-0" />
                <span className="min-w-0 truncate text-[10px] leading-none text-faint">{p.label}</span>
              </span>
              <span className="mt-1 block truncate text-[11px] leading-none text-fg/85">{p.file}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
