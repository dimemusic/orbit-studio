"use client";

import { ArrowCounterClockwise, ArrowLeft, ArrowRight, ChatCircleDots, Check, CheckCircle, EnvelopeSimple, PencilSimple, Phone, TelegramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";
import { PACKAGE_PICK } from "../home";
import { Button } from "../ui/Button";
import { RevealWords } from "../ui/RevealWords";

type Field = "name" | "contact";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG = /^@?[a-zA-Z0-9_]{4,32}$/;
/** 9 to 15 digits, with optional +, spaces, dashes, brackets */
const isPhone = (c: string) => /^\+?[\d\s()-]+$/.test(c) && (c.match(/\d/g)?.length ?? 0) >= 9 && (c.match(/\d/g)?.length ?? 0) <= 15;

type Channel = Content["CONTACT"]["channels"][number];

function validate(CONTACT: Content["CONTACT"], v: { name: string; contact: string; channel: Channel }) {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = CONTACT.errName;
  const c = v.contact.trim();
  const ok = v.channel.id === "email" ? EMAIL.test(c) : v.channel.id === "telegram" ? TG.test(c) || isPhone(c) : isPhone(c);
  if (!ok) e.contact = v.channel.err;
  return e;
}

const inputCls =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-base text-fg outline-none transition-[border-color,background-color] duration-300 " +
  "placeholder:text-faint hover:border-white/25 focus:border-blue focus-visible:outline-offset-2 aria-[invalid=true]:border-[#fb7185]";

const labelCls = "text-sm text-body";

/** rendered only when there is a message, so an untouched form shows no error rows */
function Err({ id, children }: { id: string; children?: string }) {
  if (!children) return <span id={id} hidden />;
  return (
    <p id={id} role="alert" className="text-sm text-[#fb7185]">
      {children}
    </p>
  );
}


/**
 * Last screen: request form. Left: stacked title, one line, direct contacts. Right: the form in one .card, built as
 * a short step-by-step request (asked, Nov 2026: the price quiz became the form): type of site → admin panel →
 * support → launch → «Ваш запит» (summary with a rough price, free text, name + contact, send). Any step can be
 * changed; «Пропустити» jumps straight to writing in your own words. Two columns from xl, stacked below.
 * Sends to /api/contact (Resend); without the env keys the route answers 503 and the form points to Telegram / email.
 */
export function FinalCta() {
  const { BRAND, CONTACT } = useContent();
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative flex w-full flex-col px-gutter pb-12 pt-24"
    >
      <div className="relative z-[1] grid w-full min-w-0 items-center xl:gap-x-24 2xl:gap-x-32 gap-y-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] wide:grid-cols-[minmax(0,38rem)_minmax(0,46rem)] wide:justify-center">
        {/* left: the invitation + direct contacts */}
        <div data-parallax="0.06" className="min-w-0">
          <h2 id="contact-title" className="legible text-mega font-semibold">
            <RevealWords text={CONTACT.title[0]} accent={CONTACT.title[1]} tone="teal" stack />
          </h2>
          <p data-boot className="legible mt-6 max-w-[26rem] text-lead text-body">{CONTACT.lead}</p>

          <div data-reveal style={{ ["--d" as string]: "120ms" }} className="mt-12">
            <p className="text-sm text-grey">{CONTACT.or}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href={BRAND.telegramUrl}
                  className="group inline-flex items-center gap-3 rounded-full py-1 text-lg font-medium xl:text-xl tracking-[-0.02em] text-fg"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-blue/12 text-blue">
                    <TelegramLogo size={20} weight="light" aria-hidden="true" />
                  </span>
                  <span className="underline decoration-white/20 underline-offset-4 transition-colors group-hover:decoration-fg">{BRAND.telegram}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="group inline-flex items-center gap-3 rounded-full py-1 text-lg font-medium xl:text-xl tracking-[-0.02em] text-fg"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-violet/12 text-violet-soft">
                    <EnvelopeSimple size={20} weight="light" aria-hidden="true" />
                  </span>
                  <span className="underline decoration-white/20 underline-offset-4 transition-colors group-hover:decoration-fg">{BRAND.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* right: the form */}
        <ContactForm />
      </div>
    </section>
  );
}

const CHANNEL_ICON = { telegram: TelegramLogo, viber: ChatCircleDots, whatsapp: WhatsappLogo, phone: Phone, email: EnvelopeSimple } as const;

function ContactForm() {
  const { BRAND, CONTACT, SERVICES, UI } = useContent();
  const Q = SERVICES.quiz;
  const plans = SERVICES.plans;
  const uid = useId();
  const N = Q.questions.length; // answer steps; the last screen is N
  const [step, setStep] = useState(0);
  // answers[i] = option index (step 0: plan index, plans.length = «Інше»)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(N).fill(null));
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [channelId, setChannelId] = useState("telegram");
  const channel = CONTACT.channels.find((c) => c.id === channelId) ?? CONTACT.channels[0];
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  // an error is visible only after the field was left (blur) or after a submit attempt
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const refs = { name: useRef<HTMLInputElement>(null), contact: useRef<HTMLInputElement>(null) };
  const doneRef = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef<HTMLLegendElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (done) doneRef.current?.focus({ preventScroll: true });
  }, [done]);
  // keyboard / screen reader users land on the new question (not on first render)
  useEffect(() => {
    if (moved.current) stepRef.current?.focus({ preventScroll: true });
  }, [step]);
  const go = (i: number) => {
    moved.current = true;
    setStep(i);
  };

  // «Обговорити проєкт» in a plan's dialog brings that website type along and skips the first question
  useEffect(() => {
    const onPick = (e: Event) => {
      const picked = (e as CustomEvent<string[]>).detail?.[0];
      const i = picked ? CONTACT.chips.indexOf(picked) : -1;
      if (i < 0) return;
      setAnswers((a) => [i, ...a.slice(1)]);
      setStep((s) => (s === 0 ? 1 : s));
    };
    window.addEventListener(PACKAGE_PICK, onPick);
    return () => window.removeEventListener(PACKAGE_PICK, onPick);
  }, [CONTACT.chips]);

  // the rough price: only numbers already on the page (plan price / days + the extras)
  const typeIdx = answers[0];
  const plan = typeIdx !== null && typeIdx < plans.length ? plans[typeIdx] : null;
  const hasAdmin = plan ? plan.id === "shop" || plan.id === "corp" : false;
  const adminAdd = answers[1] === 0 && !hasAdmin ? Q.adminPrice : 0;
  const support = answers[2] === 0;
  const money = (v: number) => `${SERVICES.currency}${v.toLocaleString(UI.locale)}`;
  const estimate = plan
    ? `${Q.from} ${money(plan.price + adminAdd)}${support ? ` + ${money(Q.supportPrice)} ${Q.perMonth}` : ""} · ${SERVICES.term} ${UI.days(plan.days)}`
    : "";

  const options = (i: number): string[] =>
    i === 0 ? [...plans.map((p) => p.name), CONTACT.chips[CONTACT.chips.length - 1]] : ((Q.questions[i] as { options?: string[] }).options ?? []);
  const answer = (i: number) => (answers[i] === null ? "" : options(i)[answers[i]!]);
  const pick = (i: number, v: number) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));

  const errors = validate(CONTACT, { name, contact, channel });
  const shown = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (step < N) {
      if (answers[step] !== null) go(step + 1);
      return;
    }
    setSubmitted(true);
    const first = (["name", "contact"] as const).find((f) => errors[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const chip = plan ? CONTACT.chips[typeIdx!] : CONTACT.chips[CONTACT.chips.length - 1];
    const lines = [
      ...(estimate ? [`${Q.estimate}: ${estimate}`] : []),
      ...Q.questions.flatMap((q, i) => (answers[i] === null ? [] : [`${q.short}: ${answer(i)}`])),
      ...(message.trim() ? ["", message.trim()] : []),
    ];
    setBusy(true);
    setFailed(false);
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), contact: contact.trim(), channel: channel.label, message: lines.join("\n"), needs: [chip], website: trap.current?.value ?? "" }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        setDone(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  }

  /** «Скинути відповіді»: back to the first question, the typed name / contact stay */
  function clearAnswers() {
    setAnswers(Array(N).fill(null));
    setMessage("");
    setSubmitted(false);
    setTouched({});
    go(0);
  }

  function reset() {
    setAnswers(Array(N).fill(null));
    setStep(0);
    setName("");
    setContact("");
    setMessage("");
    setFailed(false);
    setTouched({});
    setSubmitted(false);
    setDone(false);
  }

  const total = N + 1;
  const linkBtn = "inline-flex items-center gap-2 rounded-full py-2 text-sm font-medium text-body transition-colors hover:text-fg";

  return (
    <div data-reveal style={{ ["--d" as string]: "160ms" }} className="w-full min-w-0 max-w-[40rem] xl:max-w-none">
      <div className="card overflow-hidden text-left">
        {/* form and thanks state share one grid cell, so the card never jumps */}
        <div className="grid p-6 sm:p-10 wide:p-12">
          <form
            noValidate
            onSubmit={onSubmit}
            inert={done}
            aria-hidden={done}
            className={`flex min-w-0 flex-col transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:1/1] ${
              done ? "pointer-events-none translate-y-2 opacity-0" : ""
            }`}
          >
            {/* honeypot for bots: off-screen, out of the tab order and hidden from assistive tech */}
            <input ref={trap} name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

            {/* progress */}
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-sm text-grey">{Q.step(step + 1, total)}</span>
              <span className="flex flex-1 gap-2" aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step || (i < N && answers[i] !== null) ? "bg-blue" : i === step ? "bg-white/30" : "bg-white/[0.08]"}`}
                  />
                ))}
              </span>
            </div>

            {step < N ? (
              <fieldset key={step} className="quiz-step mt-6 min-w-0">
                <legend ref={stepRef} tabIndex={-1} className="text-title font-medium text-fg outline-none">
                  {Q.questions[step].q}
                </legend>
                <div className={`mt-6 grid gap-3 ${options(step).length > 3 ? "sm:grid-cols-2" : ""}`}>
                  {options(step).map((o, v) => {
                    const on = answers[step] === v;
                    return (
                      <label
                        key={o}
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-base transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                          on ? "border-blue bg-blue/12 text-fg" : "border-white/[0.12] text-body hover:border-white/25 hover:text-fg"
                        }`}
                      >
                        <input type="radio" name={`q-${Q.questions[step].id}`} className="sr-only" checked={on} onChange={() => pick(step, v)} />
                        <span
                          aria-hidden="true"
                          className={`grid size-5 shrink-0 place-items-center rounded-full ${on ? "bg-blue text-white" : "border border-white/30"}`}
                        >
                          {on && <Check size={12} weight="bold" />}
                        </span>
                        {o}
                      </label>
                    );
                  })}
                </div>
                {step === 1 && hasAdmin && <p className="mt-4 text-sm text-grey">{Q.adminIncluded}</p>}
                {step === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers((a) => [a[0] ?? plans.length, ...a.slice(1)]);
                      go(N);
                    }}
                    className={`${linkBtn} mt-4`}
                  >
                    <PencilSimple size={16} aria-hidden="true" />
                    {Q.skip}
                  </button>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6">
                  {step > 0 && (
                    <button type="button" onClick={() => go(step - 1)} className={linkBtn}>
                      <ArrowLeft size={16} aria-hidden="true" />
                      {Q.back}
                    </button>
                  )}
                  {step > 0 && (
                    <button type="button" onClick={clearAnswers} className={linkBtn}>
                      <ArrowCounterClockwise size={16} aria-hidden="true" />
                      {Q.reset}
                    </button>
                  )}
                  {estimate && (
                    <p className="min-w-0 text-sm text-body" aria-live="polite">
                      <span className="text-grey">{Q.estimate}: </span>
                      <span className="font-semibold text-fg tabular-nums">{estimate}</span>
                    </p>
                  )}
                  <Button
                    type="submit"
                    size="nav"
                    variant={answers[step] !== null ? "primary" : "secondary"}
                    disabled={answers[step] === null}
                    className={`ml-auto w-36 gap-2 ${answers[step] === null ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {Q.next}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </fieldset>
            ) : (
              <div key="final" className="quiz-step mt-6 flex min-w-0 flex-col gap-5">
                <h3 className="text-title font-medium text-fg">
                  <span ref={stepRef as React.RefObject<HTMLSpanElement | null>} tabIndex={-1} className="outline-none">
                    {Q.final}
                  </span>
                </h3>

                {/* the answers, each changeable, and the rough price */}
                {answers.some((a) => a !== null) && (
                  <dl className="flex flex-col divide-y divide-white/[0.08] rounded-xl border border-white/[0.09]">
                    {Q.questions.map((q, i) =>
                      answers[i] === null ? null : (
                        <div key={q.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                          <dt className="text-grey">{q.short}</dt>
                          <dd className="col-start-1 text-fg sm:col-start-2 sm:row-start-1">{answer(i)}</dd>
                          <button
                            type="button"
                            onClick={() => go(i)}
                            className="col-start-2 row-start-1 justify-self-end rounded-full text-sm font-medium text-blue transition-colors hover:text-fg sm:col-start-3"
                          >
                            {Q.change}
                          </button>
                        </div>
                      ),
                    )}
                    {estimate && (
                      <div className="flex flex-col gap-1 px-4 py-4">
                        <div className="flex items-baseline justify-between gap-4">
                          <dt className="text-sm text-grey">{Q.estimate}</dt>
                          <dd className="text-base font-semibold text-fg tabular-nums">{estimate}</dd>
                        </div>
                        <p className="text-xs text-grey">{Q.note}</p>
                      </div>
                    )}
                  </dl>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor={`${uid}-message`} className={labelCls}>
                    {Q.free}
                  </label>
                  <textarea
                    id={`${uid}-message`}
                    name="message"
                    rows={3}
                    maxLength={1200}
                    placeholder={Q.freePh}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${inputCls} h-auto resize-none py-3`}
                  />
                </div>

                {/* where to reach them: the contact field below follows this choice */}
                <fieldset className="flex min-w-0 flex-col gap-3">
                  <legend className={`${labelCls} mb-3`}>{CONTACT.channelLabel}</legend>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT.channels.map((c) => {
                      const on = c.id === channelId;
                      const Icon = CHANNEL_ICON[c.id as keyof typeof CHANNEL_ICON] ?? ChatCircleDots;
                      return (
                        <label key={c.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="channel"
                            value={c.id}
                            checked={on}
                            onChange={() => {
                              setChannelId(c.id);
                              setTouched((t) => ({ ...t, contact: false }));
                            }}
                            className="peer sr-only"
                          />
                          <span
                            className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
                              on ? "border-blue bg-blue/12 text-fg" : "border-white/15 text-body hover:border-white/30 hover:text-fg"
                            }`}
                          >
                            <Icon size={16} weight={on ? "fill" : "light"} aria-hidden="true" />
                            {c.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`${uid}-name`} className={labelCls}>
                      {CONTACT.name}
                    </label>
                    <input
                      ref={refs.name}
                      id={`${uid}-name`}
                      name="name"
                      autoComplete="name"
                      placeholder={CONTACT.namePh}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={touch("name")}
                      aria-invalid={!!shown("name")}
                      aria-describedby={`${uid}-name-err`}
                      className={inputCls}
                    />
                    <Err id={`${uid}-name-err`}>{shown("name")}</Err>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={`${uid}-contact`} className={labelCls}>
                      {channel.field}
                    </label>
                    <input
                      ref={refs.contact}
                      id={`${uid}-contact`}
                      name="contact"
                      type={channel.id === "email" ? "email" : channel.id === "telegram" ? "text" : "tel"}
                      inputMode={channel.id === "email" ? "email" : channel.id === "telegram" ? "text" : "tel"}
                      autoComplete={channel.id === "email" ? "email" : channel.id === "telegram" ? "off" : "tel"}
                      placeholder={channel.ph}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      onBlur={touch("contact")}
                      aria-invalid={!!shown("contact")}
                      aria-describedby={`${uid}-contact-err`}
                      className={inputCls}
                    />
                    <Err id={`${uid}-contact-err`}>{shown("contact")}</Err>
                  </div>
                </div>

                <div className="h-px bg-white/[0.08]" aria-hidden="true" />

                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={busy} className="w-full disabled:cursor-progress disabled:opacity-80">
                    {busy ? CONTACT.sending : CONTACT.submit}
                  </Button>
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <span className="flex flex-wrap gap-x-6">
                      <button type="button" onClick={() => go(answers[0] === null ? 0 : N - 1)} className={linkBtn}>
                        <ArrowLeft size={16} aria-hidden="true" />
                        {Q.back}
                      </button>
                      <button type="button" onClick={clearAnswers} className={linkBtn}>
                        <ArrowCounterClockwise size={16} aria-hidden="true" />
                        {Q.reset}
                      </button>
                    </span>
                    <p className="text-xs text-grey">
                      {CONTACT.consent}{" "}
                      <a href={BRAND.privacyHref} className="text-body underline decoration-white/20 underline-offset-2 transition-colors hover:text-fg">
                        {CONTACT.consentLink}
                      </a>
                    </p>
                  </div>
                  {failed && (
                    <p role="alert" className="text-sm text-[#fb7185]">
                      {CONTACT.errSend}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>

          <div
            aria-live="polite"
            inert={!done}
            className={`flex flex-col items-start justify-center transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:1/1] ${
              done ? "" : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            {done && (
              <>
                <CheckCircle size={44} weight="fill" aria-hidden="true" className="animate-[quote-in_0.5s_var(--ease)_both] text-green" />
                <h3 ref={doneRef} tabIndex={-1} className="mt-5 text-headline font-semibold outline-none">
                  {CONTACT.thanksTitle}
                </h3>
                <p className="mt-3 max-w-[26rem] text-base text-body">{CONTACT.thanksText}</p>
                <button type="button" onClick={reset} className="mt-6 rounded-full py-1 text-sm font-medium text-blue transition-colors hover:text-fg">
                  {CONTACT.again}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
