"use client";

import { CheckCircle, Circle, Fingerprint, GlobeHemisphereWest, LockKey, LockKeyOpen } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { G, IconTile, Tag } from "../ui/Bits";
import { useInView, useReducedMotion, useTween } from "../ui/hooks";
import { HomeSection } from "../ui/HomeSection";
import { Section } from "../ui/Section";

type Point = { icon: ReactNode; title: string; short: string; text: string; tags: string[]; status: string };

const POINTS: Point[] = [
  {
    icon: <LockKey size={22} />,
    title: "Шифрування на пристрої",
    short: "Ключ ніколи не залишає твій пристрій.",
    text: "Файл зашифрований ще до відправки.",
    tags: ["AES-256", "Zero-knowledge"],
    status: "Ключ лише в команди",
  },
  {
    icon: <Fingerprint size={22} />,
    title: "Біометрія і 2FA",
    short: "Вхід через Face ID, Touch ID або ключ.",
    text: "Вхід через Face ID, Touch ID або апаратний ключ.",
    tags: ["FIDO2", "Журнал доступу"],
    status: "Кожен вхід записано",
  },
  {
    icon: <GlobeHemisphereWest size={22} />,
    title: "Дані в Європі",
    short: "Три незалежні зони, GDPR.",
    text: "Копії у трьох незалежних зонах: Франкфурт, Варшава, Амстердам.",
    tags: ["Франкфурт", "Варшава", "Амстердам"],
    status: "GDPR",
  },
];

const TITLE = (
  <>
    Ми зберігаємо файли, але не можемо їх <G tone="shield">прочитати.</G>
  </>
);

/** Home: one statement, then ONE card: the encryption animation with the three short points inside it. */
export function Security() {
  return (
    <HomeSection
      id="security"
      label="Безпека"
      color="green"
      title={
        <>
          Зберігаємо, але <G tone="shield">не читаємо.</G>
        </>
      }
      lead="Файл шифрується на твоєму пристрої. Ключ є тільки в команди."
      more={{ href: "/security", label: "Детальніше про безпеку" }}
    >
      <div data-reveal className="w-full">
        <Cipher
          tilt={false}
          footer={
            <ul className="mt-10 grid grid-cols-1 gap-6 border-t border-white/[0.07] pt-8 sm:grid-cols-3">
              {POINTS.map((p) => (
                <li key={p.title} className="flex items-start gap-4">
                  <IconTile color="green">{p.icon}</IconTile>
                  <span className="pt-0.5">
                    <span className="block text-[16px] font-semibold text-fg">{p.title}</span>
                    <span className="mt-1 block text-[14px] text-body">{p.short}</span>
                  </span>
                </li>
              ))}
            </ul>
          }
        />
      </div>
    </HomeSection>
  );
}

/** /security: the full picture. Cipher + checklist with ring, then the three detailed points. */
export function SecurityDetail() {
  return (
    <>
      <Section id="encryption" eyebrow={{ label: "Шифрування", color: "green" }} title={TITLE} lead="Ключ живе тільки на ваших пристроях. До нас доїжджає шифротекст.">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div data-reveal>
            <Cipher />
          </div>
          <div data-reveal style={{ ["--d" as string]: "120ms" }}>
            <Checklist />
          </div>
        </div>
      </Section>

      <Section
        id="access"
        eyebrow={{ label: "Доступ і дані", color: "green" }}
        title={
          <>
            Три рівні <G tone="shield">захисту.</G>
          </>
        }
        lead="Шифрування, вхід і зберігання працюють разом."
      >
        <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
          {POINTS.map((p, i) => (
            <li key={p.title} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }}>
              <div className="card flex h-full flex-col items-center px-6 py-8 text-center sm:px-8">
                <IconTile color="green">{p.icon}</IconTile>
                <h3 className="mt-5 text-title font-semibold">{p.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[15px] text-body">{p.text}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                  {p.tags.map((t) => (
                    <Tag key={t} color="green">
                      {t}
                    </Tag>
                  ))}
                </div>
                <p className="mt-auto flex items-center gap-1.5 pt-5 text-[13px] text-grey">
                  <CheckCircle size={15} weight="fill" className="text-green" aria-hidden="true" />
                  {p.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ---------- left: plaintext scrambles into hex as you scroll, decrypts on hover ---------- */

const LINES = ["spring_kv.psd", "Клієнт: Varta Coffee", "Бюджет: 240 000 ₴", "Дедлайн: 14 березня"];
const HEX = "0123456789abcdef";
const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

function Cipher({ tilt = true, footer }: { tilt?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false); // hover / focus / tap = decrypt
  const [enc, setEnc] = useState(0); // 0 plaintext → 1 ciphertext
  const [, setFrame] = useState(0); // re-render for flicker while chars are mid-change
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let cur = 0;
    const target = () => {
      if (open) return 0;
      if (reduced) return 1;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
    };
    const loop = () => {
      const t = target();
      const k = reduced ? 1 : open ? 0.09 : 0.14;
      cur += (t - cur) * k;
      if (Math.abs(t - cur) < 0.002) cur = t;
      setEnc(cur);
      setFrame((f) => f + 1);
      raf = cur === t ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      window.removeEventListener("scroll", kick);
      cancelAnimationFrame(raf);
    };
  }, [open, reduced]);

  const locked = enc > 0.5;

  return (
    <div data-tilt={tilt || undefined} className="card flex h-full flex-col p-6 text-left sm:p-9">
      <div
        ref={ref}
        tabIndex={0}
        role="button"
        aria-pressed={open}
        aria-label="Розшифрувати файл: наведи, натисни або сфокусуй"
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onClick={(e) => (e.nativeEvent as PointerEvent).pointerType !== "mouse" && setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="-m-2 flex flex-1 cursor-pointer flex-col rounded-xl p-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none transition-colors duration-500 ${
              locked ? "bg-green/12 text-green" : "bg-blue/12 text-blue"
            }`}
          >
            {locked ? <LockKey size={14} weight="bold" aria-hidden="true" /> : <LockKeyOpen size={14} weight="bold" aria-hidden="true" />}
            {locked ? "Так файл бачить сервер" : "Так файл бачиш ти"}
          </span>
          <span className="text-[13px] text-grey">{locked ? "Наведи, щоб розшифрувати" : "Ключ є лише на пристрої"}</span>
        </div>

        <div className="mt-10 flex flex-1 flex-col justify-center gap-3" aria-hidden="true">
          {LINES.map((line, li) => (
            <p
              key={li}
              className={`break-all font-medium tabular-nums ${
                li === 0 ? "text-headline font-semibold" : "text-lead text-body"
              }`}
            >
              {Array.from(line).map((ch, i) => {
                const seed = li * 97 + i + 1;
                const t = 0.05 + 0.9 * hash(seed * 1.31 + 7);
                if (enc > t + 0.04) return <span key={i} className="text-green">{HEX[Math.floor(hash(seed) * 16)]}</span>;
                if (enc < t - 0.04) return <span key={i}>{ch}</span>;
                return <span key={i} className="text-green/60">{HEX[Math.floor(Math.random() * 16)]}</span>;
              })}
            </p>
          ))}
        </div>
        <p className="sr-only">
          Файл spring_kv.psd з даними клієнта на сервері зберігається лише як шифротекст. Розшифрувати його можна тільки ключем на твоєму
          пристрої.
        </p>
      </div>

      {footer ?? (
        <div className="mt-10 flex flex-wrap gap-1.5">
          <Tag color="green">AES-256</Tag>
          <Tag color="green">Zero-knowledge</Tag>
          <Tag>Шифрується до відправки</Tag>
        </div>
      )}
    </div>
  );
}

/* ---------- right: checklist ticks in sequence, ring fills with it ---------- */

const CHECKS: { title: string; meta: string }[] = [
  { title: "Ключ створено на твоєму пристрої", meta: "Ми його не бачимо" },
  { title: "Файл розбито на блоки по 64 МБ", meta: "Обрив не страшний" },
  { title: "Кожен блок зашифровано", meta: "AES-256" },
  { title: "Вхід підтверджено Face ID", meta: "FIDO2, журнал доступу" },
  { title: "Копії у трьох зонах ЄС", meta: "Франкфурт, Варшава, GDPR" },
];
const R = 54;
const C = 2 * Math.PI * R;

function Checklist() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, 0.45);
  const [ticked, setTicked] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTicked(CHECKS.length);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setTicked(n);
      if (n >= CHECKS.length) window.clearInterval(id);
    }, 520);
    return () => window.clearInterval(id);
  }, [seen]);

  const pct = useTween((ticked / CHECKS.length) * 100, 500);
  const done = ticked >= CHECKS.length;

  return (
    <div ref={ref} data-tilt className="card flex h-full flex-col gap-8 p-6 text-left sm:flex-row sm:items-center sm:gap-10 sm:p-9">
      <div className="relative mx-auto grid size-[148px] shrink-0 place-items-center sm:mx-0">
        <svg aria-hidden="true" viewBox="0 0 128 128" className="absolute inset-0 size-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="6" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="var(--green)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ticked / CHECKS.length)}
            style={{ transition: "stroke-dashoffset 0.5s var(--ease)" }}
          />
        </svg>
        <div className="text-center">
          <p className="text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-fg">{Math.round(pct)}%</p>
          <p className={`mt-1.5 text-[12px] transition-colors duration-500 ${done ? "text-green" : "text-grey"}`}>
            {done ? "зашифровано" : "шифрування"}
          </p>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1" aria-label="Що відбувається з файлом">
        {CHECKS.map((c, i) => {
          const on = i < ticked;
          return (
            <li key={c.title} className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors duration-300 hover:bg-white/[0.03]">
              <span className="relative mt-0.5 size-5 shrink-0">
                <Circle size={20} weight="light" aria-hidden="true" className="absolute inset-0 text-faint" />
                <CheckCircle
                  size={20}
                  weight="fill"
                  aria-hidden="true"
                  className={`absolute inset-0 text-green transition-[transform,opacity] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                    on ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
              </span>
              <span className={`transition-opacity duration-500 ${on ? "opacity-100" : "opacity-50"}`}>
                <span className="block text-[15px] text-fg">{c.title}</span>
                <span className="block text-[13px] text-grey">{c.meta}</span>
                <span className="sr-only">{on ? "виконано" : "очікує"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
