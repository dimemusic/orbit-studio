"use client";

import { Check, CheckCircle, EnvelopeSimple, TelegramLogo } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Content } from "@/lib/content";
import { useContent } from "../Lang";
import { PACKAGE_PICK } from "../home";
import { Button } from "../ui/Button";
import { SplitTitle } from "../ui/SplitTitle";

type Field = "name" | "contact" | "needs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG = /^@?[a-zA-Z0-9_]{4,32}$/;

function validate(CONTACT: Content["CONTACT"], v: { name: string; contact: string; needs: Set<string> }) {
  const e: Partial<Record<Field, string>> = {};
  if (v.name.trim().length < 2) e.name = CONTACT.errName;
  const c = v.contact.trim();
  if (!EMAIL.test(c) && !TG.test(c)) e.contact = CONTACT.errContact;
  if (v.needs.size === 0) e.needs = CONTACT.errNeeds;
  return e;
}

const inputCls =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[16px] text-fg outline-none transition-[border-color,background-color] duration-300 " +
  "placeholder:text-faint hover:border-white/25 focus:border-blue focus-visible:outline-offset-2 aria-[invalid=true]:border-[#fb7185]";

const labelCls = "text-[14px] text-body";

/** rendered only when there is a message, so an untouched form shows no error rows */
function Err({ id, children }: { id: string; children?: string }) {
  if (!children) return <span id={id} hidden />;
  return (
    <p id={id} role="alert" className="text-[13px] leading-snug text-[#fb7185]">
      {children}
    </p>
  );
}


/**
 * Last screen: request form. Left: stacked title, one line, direct contacts. Right: the form in one .card
 * («Що потрібно» chips = website types, prefilled from a pricing card). Two columns from xl, stacked below.
 * Sends to /api/contact (Resend); without the env keys the route answers 503 and the form points to Telegram / email.
 */
export function FinalCta() {
  const { BRAND, CONTACT } = useContent();
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative flex min-h-[100dvh] w-full flex-col justify-center px-gutter pb-10 pt-28"
    >
      <div className="relative z-[1] grid w-full min-w-0 items-center gap-x-[clamp(48px,7vw,140px)] gap-y-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] wide:grid-cols-[minmax(0,38rem)_minmax(0,46rem)] wide:justify-center">
        {/* left: the invitation + direct contacts */}
        <div className="min-w-0">
          <h2 id="contact-title" className="legible text-mega font-semibold">
            <SplitTitle text={CONTACT.title[0]} accent={CONTACT.title[1]} tone="teal" stack />
          </h2>
          <p data-reveal className="legible mt-6 max-w-[40ch] text-lead text-body">{CONTACT.lead}</p>

          <div data-reveal className="mt-12">
            <p className="text-[14px] text-grey">{CONTACT.or}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href={BRAND.telegramUrl}
                  className="group inline-flex items-center gap-3 rounded-full py-1 text-[clamp(18px,1.6vw,22px)] font-medium tracking-[-0.02em] text-fg"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-blue/12 text-blue">
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
                  <span className="grid size-11 place-items-center rounded-full bg-violet/12 text-violet-soft">
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

function ContactForm() {
  const { BRAND, CONTACT } = useContent();
  const uid = useId();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [needs, setNeeds] = useState<Set<string>>(() => new Set());
  // an error is visible only after the field was left (blur) or after a submit attempt
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const refs = { name: useRef<HTMLInputElement>(null), contact: useRef<HTMLInputElement>(null), needs: useRef<HTMLInputElement>(null) };
  const doneRef = useRef<HTMLHeadingElement>(null);
  const trap = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (done) doneRef.current?.focus({ preventScroll: true });
  }, [done]);

  // «Обрати» on a pricing card brings that website type along
  useEffect(() => {
    const onPick = (e: Event) => {
      const picked = (e as CustomEvent<string[]>).detail;
      if (picked?.length) setNeeds(new Set(picked));
    };
    window.addEventListener(PACKAGE_PICK, onPick);
    return () => window.removeEventListener(PACKAGE_PICK, onPick);
  }, []);

  const errors = validate(CONTACT, { name, contact, needs });
  const shown = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const toggle = (chip: string) =>
    setNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const first = (["name", "contact", "needs"] as const).find((f) => errors[f]);
    if (first) {
      const el = refs[first].current;
      el?.focus();
      // a short firm shake on the first field that needs attention (2 swings, no bounce)
      const box = first === "needs" ? el?.closest("fieldset")?.querySelector("[data-chips]") : el;
      if (box && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        box.animate(
          [{ transform: "none" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-3px)" }, { transform: "none" }],
          { duration: 380, easing: "ease-in-out" },
        );
      }
      return;
    }
    setBusy(true);
    setFailed(false);
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), contact: contact.trim(), message: message.trim(), needs: [...needs], website: trap.current?.value ?? "" }),
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
    setNeeds(new Set());
    setTouched({});
    setSubmitted(false);
    setDone(false);
  }

  return (
    <div data-reveal className="w-full min-w-0 max-w-[40rem] xl:max-w-none">
      <div className="card overflow-hidden text-left">
        {/* form and thanks state share one grid cell, so the card never jumps */}
        <div className="grid p-6 sm:p-9 wide:p-11">
          <form
            noValidate
            onSubmit={onSubmit}
            inert={done}
            aria-hidden={done}
            className={`flex flex-col gap-5 transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:1/1] ${
              done ? "pointer-events-none translate-y-2 opacity-0" : ""
            }`}
          >
            {/* honeypot for bots: off-screen, out of the tab order and hidden from assistive tech */}
            <input ref={trap} name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
            <fieldset className="flex flex-col gap-2.5" aria-describedby={`${uid}-needs-err`}>
              <legend className="mb-3 text-[16px] font-medium text-fg">{CONTACT.needs}</legend>
              <div data-chips className="flex flex-wrap gap-2">
                {CONTACT.chips.map((chip, i) => {
                  const on = needs.has(chip);
                  return (
                    <label key={chip} className="min-w-0 cursor-pointer">
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
                        className={`chip flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[15px] font-medium peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
                          on ? "border-blue bg-blue/12 text-fg" : "border-white/15 text-body hover:border-white/30 hover:text-fg"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-blue text-white" : "border border-white/25"}`}
                        >
                          {on && <Check size={10} weight="bold" className="chip-check" />}
                        </span>
                        {chip}
                      </span>
                    </label>
                  );
                })}
              </div>
              <Err id={`${uid}-needs-err`}>{shown("needs")}</Err>
            </fieldset>

            <div className="h-px bg-white/[0.08]" aria-hidden="true" />

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
                rows={4}
                maxLength={1500}
                placeholder={CONTACT.messagePh}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} h-auto resize-none py-3 leading-snug`}
              />
            </div>


            <div className="h-px bg-white/[0.08]" aria-hidden="true" />

            <Button type="submit" disabled={busy} className="w-full disabled:cursor-progress disabled:opacity-80">
              {busy ? CONTACT.sending : CONTACT.submit}
            </Button>
            <p className="-mt-1 text-center text-[13px] leading-snug text-grey">
              {CONTACT.consent}{" "}
              <a href={BRAND.privacyHref} className="text-body underline decoration-white/20 underline-offset-2 transition-colors hover:text-fg">
                {CONTACT.consentLink}
              </a>
            </p>
            {failed && (
              <p role="alert" className="text-[14px] leading-snug text-[#fb7185]">
                {CONTACT.errSend}
              </p>
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
                <CheckCircle size={44} weight="fill" aria-hidden="true" className="done-icon text-green" />
                <h3 ref={doneRef} tabIndex={-1} className="done-step mt-5 text-headline font-semibold outline-none" style={{ ["--s" as string]: 1 }}>
                  {CONTACT.thanksTitle}
                </h3>
                <p className="done-step mt-3 max-w-[40ch] text-[16px] text-body" style={{ ["--s" as string]: 2 }}>
                  {CONTACT.thanksText}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  style={{ ["--s" as string]: 3 }}
                  className="done-step mt-6 rounded-full py-1 text-[14px] font-medium text-blue transition-colors hover:text-fg"
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
