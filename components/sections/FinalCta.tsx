"use client";

import { Check, CheckCircle, EnvelopeSimple, TelegramLogo } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BRAND, CONTACT } from "@/lib/content";
import { PACKAGE_PICK } from "../home";
import { Button } from "../ui/Button";
import { RevealWords } from "../ui/RevealWords";

type Field = "name" | "contact" | "needs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG = /^@?[a-zA-Z0-9_]{4,32}$/;

function validate(v: { name: string; contact: string; needs: Set<string> }) {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = CONTACT.errName;
  const c = v.contact.trim();
  if (!EMAIL.test(c) && !TG.test(c)) e.contact = CONTACT.errContact;
  if (v.needs.size === 0) e.needs = CONTACT.errNeeds;
  return e;
}

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

/** «Все під ключ» excludes the single services and back */
const TURNKEY_CHIP = CONTACT.chips[0];

/**
 * Last screen: request form. Same header as Services (word-by-word title + one line on the right), then one .card:
 * direct contacts on the left, the form on the right («Що потрібно» chips = the services, prefilled from «Ваш пакет»).
 * Sends to /api/contact (Resend); without the env keys the route answers 503 and the form points to Telegram / email.
 */
export function FinalCta() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="snap-section relative flex min-h-[100dvh] w-full flex-col justify-center px-gutter pb-[clamp(24px,4.5vh,48px)] pt-[clamp(88px,12vh,128px)]"
    >
      <header className="relative z-[1] flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 id="contact-title" className="legible text-mega font-semibold">
          <RevealWords text={CONTACT.title[0]} accent={CONTACT.title[1]} tone="aurora" />
        </h2>
        <p className="legible text-lead text-body">{CONTACT.lead}</p>
      </header>
      <div className="relative z-[1] w-full min-w-0 pt-[clamp(32px,5vh,56px)]">
        <ContactForm />
      </div>
    </section>
  );
}

function ContactForm() {
  const uid = useId();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [needs, setNeeds] = useState<Set<string>>(() => new Set([CONTACT.chips[0]]));
  // an error is visible only after the field was left (blur) or after a submit attempt
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const refs = { name: useRef<HTMLInputElement>(null), contact: useRef<HTMLInputElement>(null), needs: useRef<HTMLInputElement>(null) };
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (done) doneRef.current?.focus({ preventScroll: true });
  }, [done]);

  // «Обговорити проєкт» in «Ваш пакет» brings the picked services along
  useEffect(() => {
    const onPick = (e: Event) => {
      const picked = (e as CustomEvent<string[]>).detail;
      if (picked?.length) setNeeds(new Set(picked));
    };
    window.addEventListener(PACKAGE_PICK, onPick);
    return () => window.removeEventListener(PACKAGE_PICK, onPick);
  }, []);

  const errors = validate({ name, contact, needs });
  const shown = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const toggle = (chip: string) =>
    setNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else if (chip === TURNKEY_CHIP) return new Set([chip]);
      else {
        next.delete(TURNKEY_CHIP);
        next.add(chip);
      }
      return next;
    });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const first = (["name", "contact", "needs"] as const).find((f) => errors[f]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setBusy(true);
    setFailed(false);
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), contact: contact.trim(), message: message.trim(), needs: [...needs] }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        setDone(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  }

  function reset() {
    setName("");
    setContact("");
    setMessage("");
    setFailed(false);
    setNeeds(new Set([CONTACT.chips[0]]));
    setTouched({});
    setSubmitted(false);
    setDone(false);
  }

  return (
    <div data-reveal className="w-full">
      <div className="card grid overflow-hidden text-left lg:grid-cols-[2fr_3fr]">
        {/* direct contacts */}
        <div className="flex flex-col justify-between gap-10 border-b border-white/[0.07] p-7 sm:p-10 lg:border-b-0 lg:border-r" style={{ background: MESH }}>
          <div>
            <p className="text-[13px] text-grey">{CONTACT.or}</p>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={BRAND.telegramUrl}
                  className="group inline-flex items-center gap-3 rounded-full py-1 text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.02em] text-fg"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-blue/12 text-blue">
                    <TelegramLogo size={20} weight="light" aria-hidden="true" />
                  </span>
                  <span className="underline decoration-white/20 underline-offset-4 transition-colors group-hover:decoration-fg">{BRAND.telegram}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="group inline-flex items-center gap-3 rounded-full py-1 text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.02em] text-fg"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-violet/12 text-violet-soft">
                    <EnvelopeSimple size={20} weight="light" aria-hidden="true" />
                  </span>
                  <span className="underline decoration-white/20 underline-offset-4 transition-colors group-hover:decoration-fg">{BRAND.email}</span>
                </a>
              </li>
            </ul>
          </div>
          <p className="text-[14px] text-body">
            <span translate="no">{BRAND.name}</span> · {BRAND.city}
          </p>
        </div>

        {/* form and thanks state share one grid cell, so the card never jumps */}
        <div className="grid p-7 sm:p-10">
          <form
            noValidate
            onSubmit={onSubmit}
            inert={done}
            aria-hidden={done}
            className={`flex flex-col gap-5 transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:1/1] ${
              done ? "pointer-events-none translate-y-2 opacity-0" : ""
            }`}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${uid}-contact`} className={labelCls}>
                  {CONTACT.contact}
                </label>
                <input
                  ref={refs.contact}
                  id={`${uid}-contact`}
                  name="contact"
                  autoComplete="email"
                  placeholder={CONTACT.contactPh}
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${uid}-message`} className={labelCls}>
                {CONTACT.message}
              </label>
              <textarea
                id={`${uid}-message`}
                name="message"
                rows={3}
                maxLength={1500}
                placeholder={CONTACT.messagePh}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} h-auto resize-none py-3 leading-snug`}
              />
            </div>

            <fieldset className="flex flex-col gap-2.5" aria-describedby={`${uid}-needs-err`}>
              <legend className={`${labelCls} mb-2.5`}>{CONTACT.needs}</legend>
              <div className="flex flex-wrap gap-2">
                {CONTACT.chips.map((chip, i) => {
                  const on = needs.has(chip);
                  return (
                    <label key={chip} className="cursor-pointer">
                      <input
                        ref={i === 0 ? refs.needs : undefined}
                        type="checkbox"
                        name="needs"
                        value={chip}
                        checked={on}
                        onChange={() => {
                          toggle(chip);
                          setTouched((t) => ({ ...t, needs: true }));
                        }}
                        className="peer sr-only"
                      />
                      <span
                        className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
                          on ? "border-blue bg-blue/12 text-fg" : "border-white/15 text-body hover:border-white/30 hover:text-fg"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-4 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-blue text-white" : "border border-white/25"}`}
                        >
                          {on && <Check size={10} weight="bold" />}
                        </span>
                        {chip}
                      </span>
                    </label>
                  );
                })}
              </div>
              <Err id={`${uid}-needs-err`}>{shown("needs")}</Err>
            </fieldset>

            <Button type="submit" disabled={busy} className="mt-1 w-full disabled:cursor-progress disabled:opacity-80 sm:w-auto sm:self-start">
              {busy ? CONTACT.sending : CONTACT.submit}
            </Button>
            {failed && (
              <p role="alert" className="text-[14px] leading-snug text-[#fb7185]">
                {CONTACT.errSend}
              </p>
            )}
            <p className="text-[14px] text-grey">{CONTACT.availability}</p>
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
                <p className="mt-3 max-w-[40ch] text-[16px] text-body">{CONTACT.thanksText}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
                >
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
