"use client";

import { Check, ClockCounterClockwise, CloudArrowUp, Eye, EyeSlash, LockKey } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { G, IconTile, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { useReducedMotion } from "../ui/hooks";
import { Logo } from "../ui/Logo";

export type PlanId = "free" | "pro" | "team";
type Field = "name" | "email" | "pw" | "terms";

// Fictional prices (UAH), same as the pricing section (yearly billing)
const PLANS: {
  id: PlanId;
  name: string;
  space: string;
  price: string;
  perk: string;
  /** capacity bar fill, % (log-ish scale) */
  share: number;
  color: string;
  tag: "green" | "blue" | "violet";
}[] = [
  { id: "free", name: "Free", space: "20 ГБ", price: "0 ₴ назавжди", perk: "2 пристрої", share: 12, color: "#4fe3c1", tag: "green" },
  { id: "pro", name: "Pro", space: "2 ТБ", price: "279 ₴/міс", perk: "Уся історія версій", share: 55, color: "#3d8bff", tag: "blue" },
  { id: "team", name: "Team", space: "10 ТБ", price: "199 ₴ за людину/міс", perk: "Ролі й доступи", share: 100, color: "#a78bfa", tag: "violet" },
];

// scene palette, one colour per key nibble
const KEY_COLORS = ["#3d8bff", "#22d3ee", "#8b5cf6", "#2dd4bf", "#6366f1", "#f472b6"] as const;
const KEY_LEN = 16;

const STRENGTH: [string, string][] = [
  ["", "#8b919c"],
  ["Слабкий", "#fb7185"],
  ["Так собі", "#ffb27a"],
  ["Добрий", "#3d8bff"],
  ["Надійний", "#4fe3c1"],
];

const score = (v: string) =>
  !v
    ? 0
    : Math.max(
        1,
        Math.min(
          4,
          Number(v.length >= 10) +
            Number(/[A-ZА-ЯІЇЄҐ]/.test(v)) +
            Number(/\d/.test(v)) +
            Number(/[^\wА-Яа-яІіЇїЄєҐґ]/.test(v)) +
            Number(v.length >= 14) -
            Number(v.length < 8),
        ),
      );

/** visual fingerprint only: 16 nibbles derived from the password and a per-visit salt; nothing is sent or stored */
const fingerprint = (v: string, salt: string) => {
  let h = 2166136261;
  const out: number[] = [];
  for (let k = 0; k < KEY_LEN; k++) {
    for (const ch of salt + v + k) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    out.push((h >>> 0) & 15);
  }
  return out;
};

const hex = (n: number[]) => n.map((x) => x.toString(16)).join("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: { name: string; email: string; pw: string; terms: boolean }): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = "Напиши, як до тебе звертатись (від 2 літер).";
  if (!v.email.trim()) e.email = "Вкажи робочу пошту.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Схоже, в адресі помилка. Приклад: you@studio.ua";
  if (!v.pw) e.pw = "Придумай пароль.";
  else if (v.pw.length < 8) e.pw = "Потрібно щонайменше 8 символів.";
  if (!v.terms) e.terms = "Підтвердь згоду, щоб продовжити.";
  return e;
}

const sphereBg = "radial-gradient(circle at 35% 30%, #fff 0%, var(--c) 38%, color-mix(in srgb, var(--c) 38%, #05070d) 100%)";

// brand panel: blue → violet mesh inside the glass
const MESH =
  "radial-gradient(90% 70% at 0% 0%, rgb(61 139 255 / 0.26), transparent 70%), radial-gradient(80% 70% at 100% 100%, rgb(139 92 246 / 0.24), transparent 70%)";

const inputCls =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[16px] text-fg outline-none transition-[border-color,background-color] duration-300 " +
  "placeholder:text-faint hover:border-white/25 focus:border-blue focus-visible:outline-offset-2 aria-[invalid=true]:border-[#fb7185]";

const labelCls = "text-[13px] text-body";

/** rendered only when there is a message, so an untouched form shows no error rows */
function Err({ id, children }: { id: string; children?: string }) {
  if (!children) return <span id={id} hidden />;
  return (
    <p id={id} role="alert" className="text-[13px] leading-snug text-[#fb7185]">
      {children}
    </p>
  );
}

export function SignupForm({ initialPlan }: { initialPlan: PlanId }) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  // an error is visible only after the field was left (blur) or after a submit attempt
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string; email: string; plan: PlanId; key: number[] } | null>(null);
  // random per visit, so the fingerprint is not a plain hash of the password
  const [salt] = useState(() => Math.random().toString(36).slice(2));

  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    pw: useRef<HTMLInputElement>(null),
    terms: useRef<HTMLInputElement>(null),
  };
  const doneRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (done) doneRef.current?.focus({ preventScroll: true });
  }, [done]);

  const errors = validate({ name, email, pw, terms });
  const shown = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const planIdx = PLANS.findIndex((p) => p.id === plan);
  const chosen = PLANS[planIdx];
  const level = score(pw);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const first = (["name", "email", "pw", "terms"] as const).find((f) => errors[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const finish = () => {
      setDone({ name: name.trim(), email: email.trim(), plan, key: fingerprint(pw, salt) });
      // the password never leaves this component and is gone once the key exists
      setPw("");
      setShow(false);
      setBusy(false);
    };
    setBusy(true);
    if (reduced) finish();
    else timer.current = window.setTimeout(finish, 900);
  }

  const donePlan = PLANS.find((p) => p.id === (done?.plan ?? plan))!;

  return (
    <section
      aria-labelledby="signup-title"
      className="relative isolate flex min-h-dvh w-full items-center justify-center px-4 pb-10 pt-24 sm:px-gutter lg:py-24"
    >
      {/* neutral stage: one very soft blue glow behind the card, no ivy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(50% 60% at 50% 50%, rgb(61 139 255 / 0.07), transparent 75%)" }}
      />

      {/* minimal header: logo (the brand panel carries it on desktop) + login */}
      <header className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4 sm:px-gutter lg:justify-end">
        <Link href="/" aria-label="Cloud Sphere, на головну" className="lg:hidden">
          <Logo />
        </Link>
        {/* TODO: replace with real /login page before publishing */}
        <Link href="/app?plan=pro" className="py-2.5 text-[14px] text-body transition-colors hover:text-fg">
          Увійти
        </Link>
      </header>

      <div data-reveal className="w-full max-w-[960px]">
        <div className="card grid overflow-hidden rounded-[28px] lg:grid-cols-[2fr_3fr]">
          {/* brand panel; on small screens it is just a short header above the form */}
          <aside
            style={{ background: MESH }}
            className="flex flex-col gap-3 border-b border-white/[0.08] p-6 sm:p-8 lg:justify-between lg:gap-8 lg:border-b-0 lg:border-r lg:p-10"
          >
            <div className="flex flex-col gap-6 lg:gap-8">
              <Link href="/" aria-label="Cloud Sphere, на головну" className="hidden self-start lg:inline-flex">
                <Logo />
              </Link>
              <h1 id="signup-title" className="text-[clamp(28px,3vw,40px)] font-semibold leading-[1.05] tracking-[-0.04em]">
                Створи свою <G tone="aurora">сферу.</G>
              </h1>
              <p className="text-[15px] text-body lg:hidden">20 ГБ безкоштовно, без картки.</p>

              <ul className="hidden flex-col gap-4 lg:flex">
                {(
                  [
                    ["green", LockKey, "Шифрування на пристрої"],
                    ["blue", CloudArrowUp, "20 ГБ безкоштовно, без картки"],
                    ["violet", ClockCounterClockwise, "Кожен файл пам'ятає свої версії"],
                  ] as const
                ).map(([color, Icon, text]) => (
                  <li key={text} className="flex items-center gap-4 text-[15px] text-fg">
                    <IconTile color={color}>
                      <Icon size={22} weight="light" aria-hidden="true" />
                    </IconTile>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <figure className="hidden border-t border-white/[0.08] pt-6 lg:block">
              <blockquote className="text-[15px] leading-relaxed text-body">
                «Ми перестали питати в чаті, де фінальна версія. <span translate="no">Cloud Sphere</span> просто її показує.»
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-blue/12 text-[13px] font-semibold text-blue"
                >
                  МС
                </span>
                <span className="text-[13px] leading-snug text-grey">
                  <span className="block text-[14px] font-medium text-fg">Марта Савчук</span>
                  керівниця студії Varta
                </span>
              </figcaption>
            </figure>
          </aside>

          {/* form and success share one grid cell, so the card never jumps; they cross-fade inside it */}
          <div className="grid">
            <form
              noValidate
              onSubmit={onSubmit}
              aria-busy={busy}
              inert={!!done}
              aria-hidden={!!done}
              style={{ gridArea: "1 / 1" }}
              className={`flex flex-col gap-3.5 p-6 transition-opacity duration-500 sm:p-8 lg:px-10 lg:py-9 ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Тариф</legend>
                {/* segmented pill: the thumb slides under the active option */}
                <div className="relative grid h-11 grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full transition-[transform,background-color,box-shadow] duration-[400ms] ease-[cubic-bezier(.22,1,.36,1)]"
                    style={{
                      transform: `translateX(${planIdx * 100}%)`,
                      background: `color-mix(in srgb, ${chosen.color} 14%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${chosen.color} 45%, transparent)`,
                    }}
                  />
                  {PLANS.map((p) => {
                    const on = p.id === plan;
                    return (
                      <label key={p.id} className="relative z-10 cursor-pointer">
                        <input type="radio" name="plan" value={p.id} checked={on} onChange={() => setPlan(p.id)} className="peer sr-only" />
                        <span
                          className={`flex h-full items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${on ? "text-fg" : "text-body"}`}
                        >
                          <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
                          {p.name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* capacity on a log-ish scale */}
                <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease)]"
                    style={{
                      width: `${chosen.share}%`,
                      background: `linear-gradient(90deg, ${chosen.color}, color-mix(in srgb, ${chosen.color} 55%, white))`,
                    }}
                  />
                </div>

                <p aria-live="polite" className="flex flex-wrap justify-between gap-x-3 text-[13px] leading-snug">
                  <span className="text-body">
                    <span className="text-fg">{chosen.space}</span> · {chosen.price}
                  </span>
                  <span className="text-faint">{chosen.perk}</span>
                </p>
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${uid}-name`} className={labelCls}>
                  Як тебе звати?
                </label>
                <input
                  ref={refs.name}
                  id={`${uid}-name`}
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={touch("name")}
                  autoComplete="name"
                  placeholder="Олена Коваль"
                  aria-invalid={!!shown("name")}
                  aria-describedby={`${uid}-name-err`}
                  className={inputCls}
                />
                <Err id={`${uid}-name-err`}>{shown("name")}</Err>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${uid}-email`} className={labelCls}>
                  Робоча пошта
                </label>
                <input
                  ref={refs.email}
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={touch("email")}
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="you@studio.ua"
                  aria-invalid={!!shown("email")}
                  aria-describedby={`${uid}-email-err`}
                  className={inputCls}
                />
                <Err id={`${uid}-email-err`}>{shown("email")}</Err>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${uid}-pw`} className={labelCls}>
                  Пароль
                </label>
                <div className="relative">
                  <input
                    ref={refs.pw}
                    id={`${uid}-pw`}
                    name="password"
                    type={show ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    onBlur={touch("pw")}
                    autoComplete="new-password"
                    spellCheck={false}
                    placeholder="Від 8 символів"
                    aria-invalid={!!shown("pw")}
                    aria-describedby={`${uid}-pw-hint ${uid}-pw-err`}
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-pressed={show}
                    aria-label={show ? "Сховати пароль" : "Показати пароль"}
                    className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-grey transition-colors hover:text-fg"
                  >
                    {show ? <EyeSlash size={20} weight="light" aria-hidden="true" /> : <Eye size={20} weight="light" aria-hidden="true" />}
                  </button>
                </div>
                <Err id={`${uid}-pw-err`}>{shown("pw")}</Err>
                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="grid w-20 shrink-0 grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="h-1 rounded-full transition-colors duration-300"
                        style={{ background: i <= level ? STRENGTH[level][1] : "rgb(255 255 255 / 0.1)" }}
                      />
                    ))}
                  </div>
                  <span id={`${uid}-pw-hint`} aria-live="polite" className="text-[12px] leading-snug text-grey">
                    {level > 0 && (
                      <>
                        <span style={{ color: STRENGTH[level][1] }}>{STRENGTH[level][0]}</span>
                        {" · "}
                      </>
                    )}
                    ключ лишається на твоєму пристрої
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-snug text-body">
                  <input
                    ref={refs.terms}
                    type="checkbox"
                    name="terms"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    onBlur={touch("terms")}
                    aria-invalid={!!shown("terms")}
                    aria-describedby={`${uid}-terms-err`}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-items-center rounded-md border border-white/25 text-white transition-colors duration-300 peer-checked:border-blue peer-checked:bg-blue peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue peer-aria-[invalid=true]:border-[#fb7185]"
                  >
                    <Check size={14} weight="bold" className={`transition-opacity duration-200 ${terms ? "opacity-100" : "opacity-0"}`} />
                  </span>
                  <span>Погоджуюсь з умовами використання та політикою приватності</span>
                </label>
                <Err id={`${uid}-terms-err`}>{shown("terms")}</Err>
              </div>

              <Button type="submit" disabled={busy} className="mt-1 w-full disabled:cursor-progress disabled:opacity-80">
                {busy ? "Шифруємо ключ…" : "Створити акаунт"}
              </Button>
              <p className="text-center text-[14px] text-body">
                Вже є акаунт?{" "}
                {/* TODO: replace with real /login page before publishing */}
                <Link href="/app?plan=pro" className="text-fg underline decoration-white/30 underline-offset-4 hover:decoration-fg">
                  Увійти
                </Link>
              </p>
            </form>

            {/* success: the key's dots now orbit your sphere */}
            <div
              aria-live="polite"
              inert={!done}
              style={{ gridArea: "1 / 1", ["--c" as string]: donePlan.color }}
              className={`flex flex-col items-center justify-center p-6 text-center transition-opacity duration-700 sm:p-8 lg:px-10 ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              {done && (
                <>
                  <Orbit key={done.key.join("")} nibbles={done.key} letter={done.name.charAt(0).toUpperCase()} />
                  <h2 ref={doneRef} tabIndex={-1} className="mt-7 text-[clamp(26px,2.6vw,34px)] font-semibold leading-tight tracking-[-0.035em] outline-none">
                    Ласкаво просимо, <G>{done.name.split(/\s+/)[0]}.</G>
                  </h2>
                  <p className="mt-3 max-w-[38ch] text-[15px] text-body">
                    Твоя сфера готова, а ключ шифрування вже на цьому пристрої. Лист для підтвердження прийде на{" "}
                    <span className="break-all text-fg">{done.email}</span>.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Tag color={donePlan.tag}>
                      {donePlan.name} · {donePlan.space}
                    </Tag>
                    <Tag>
                      <span className="tabular-nums">
                        Ключ {hex(done.key).slice(0, 4)} {hex(done.key).slice(4, 8)} … {hex(done.key).slice(12)}
                      </span>
                    </Tag>
                  </div>
                  <div className="mt-7 flex w-full flex-col items-center gap-3">
                    <Button href={`/app?plan=${done.plan}`} className="w-full sm:w-auto">
                      Перейти в хмару
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** the 16 dots of the key on a slowly turning ring around a sphere in the plan colour */
function Orbit({ nibbles, letter }: { nibbles: number[]; letter: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div aria-hidden="true" className="relative size-40">
      <div className="absolute inset-0 animate-[spin_48s_linear_infinite]">
        {nibbles.map((n, i) => {
          const a = (i / KEY_LEN) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={i}
              className="absolute size-2 rounded-full transition-[scale,opacity] duration-700 ease-[var(--ease)]"
              style={{
                left: Math.round(80 + 68 * Math.cos(a) - 4),
                top: Math.round(80 + 68 * Math.sin(a) - 4),
                background: KEY_COLORS[n % KEY_COLORS.length],
                scale: on ? "1" : "0",
                opacity: on ? 1 : 0,
                transitionDelay: `${300 + i * 60}ms`,
              }}
            />
          );
        })}
      </div>
      <span
        className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[32px] font-semibold text-bg transition-[scale,opacity] duration-[900ms] ease-[var(--ease)]"
        style={{ background: sphereBg, scale: on ? "1" : "0.4", opacity: on ? 1 : 0 }}
      >
        {letter}
      </span>
    </div>
  );
}
