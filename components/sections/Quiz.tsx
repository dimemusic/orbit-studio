"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowCounterClockwise,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { QUIZ_SEND } from "../home";
import { useContent } from "../Lang";
import { Button } from "../ui/Button";
import { G } from "../ui/Bits";

/**
 * Price quiz under the plans: one question at a time (type → admin → support → launch), a live estimate beside it,
 * and «Обговорити на дзвінку» that carries the type and the answers into the contact form (QUIZ_SEND).
 * The estimate is built ONLY from numbers already on the page: the plan price / days and the extras
 * (admin panel, monthly support). Shop and corporate sites already include the admin panel.
 */
export function Quiz() {
  const { SERVICES, CONTACT, UI } = useContent();
  const Q = SERVICES.quiz;
  const plans = SERVICES.plans;
  const n = Q.questions.length;
  const [step, setStep] = useState(0);
  // answers[i] = chosen option index (for step 0: plan index, plans.length = «not sure»)
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(n).fill(null),
  );

  const typeIdx = answers[0];
  const plan =
    typeIdx !== null && typeIdx < plans.length ? plans[typeIdx] : null;
  const unsure = typeIdx === plans.length;
  const hasAdmin = plan ? plan.id === "shop" || plan.id === "corp" : false;
  const wantsAdmin = answers[1] === 0;
  const wantsSupport = answers[2] === 0;
  const base = plan
    ? plan.price
    : unsure
      ? Math.min(...plans.map((p) => p.price))
      : 0;
  const days = plan ? plan.days : Math.min(...plans.map((p) => p.days));
  const adminAdd = wantsAdmin && !hasAdmin ? Q.adminPrice : 0;
  const total = base + adminAdd;
  const done = answers.every((a) => a !== null);
  const money = (v: number) =>
    `${SERVICES.currency}${v.toLocaleString(UI.locale)}`;

  const options = (i: number): string[] =>
    i === 0
      ? [...plans.map((p) => p.name), Q.unsure]
      : ((Q.questions[i] as { options?: string[] }).options ?? []);

  const pick = (i: number, v: number) => {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
    // no auto-advance (asked): a misclick can be changed, «Далі» moves on
  };

  const send = () => {
    const chip = plan
      ? CONTACT.chips[typeIdx!]
      : CONTACT.chips[CONTACT.chips.length - 1];
    const parts = Q.questions.map(
      (q, i) => `${q.q} ${options(i)[answers[i] ?? 0]}`,
    );
    const message = `${Q.summary}: ${Q.from} ${money(total)}${wantsSupport ? ` + ${money(Q.supportPrice)} ${Q.perMonth}` : ""}.\n${parts.join("\n")}`;
    window.dispatchEvent(
      new CustomEvent(QUIZ_SEND, { detail: { needs: [chip], message } }),
    );
  };

  const q = Q.questions[step];
  const opts = options(step);

  return (
    <div data-reveal className="relative z-[1] mx-auto mt-16 w-full min-w-0 max-w-[68rem]">
      <div className="card grid w-full min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        {/* left: one question at a time */}
        <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
          <h3 className="text-headline font-semibold text-fg">
            {Q.title[0]} <G tone="violet">{Q.title[1]}</G>
          </h3>
          <p className="mt-4 max-w-[32rem] text-base text-body">{Q.lead}</p>

          {/* progress */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm text-grey" aria-live="polite">
              {Q.step(step + 1, n)}
            </span>
            <span className="flex flex-1 gap-2" aria-hidden="true">
              {Q.questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${answers[i] !== null ? "bg-violet-soft" : i === step ? "bg-white/30" : "bg-white/[0.08]"}`}
                />
              ))}
            </span>
          </div>

          <fieldset key={step} className="quiz-step mt-6 min-w-0">
            <legend className="text-title font-medium text-fg">{q.q}</legend>
            <div
              className={`mt-6 grid gap-3 ${opts.length > 3 ? "sm:grid-cols-2" : ""}`}
            >
              {opts.map((o, v) => {
                const on = answers[step] === v;
                return (
                  <label
                    key={o}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-base transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue ${
                      on
                        ? "border-violet-soft/60 bg-violet/12 text-fg"
                        : "border-white/[0.09] text-body hover:border-white/25 hover:text-fg"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`quiz-${q.id}`}
                      className="sr-only"
                      checked={on}
                      onChange={() => pick(step, v)}
                    />
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${on ? "border-violet-soft bg-violet-soft text-[#05070d]" : "border-white/30"}`}
                    >
                      {on && <Check size={12} weight="bold" />}
                    </span>
                    {o}
                  </label>
                );
              })}
            </div>
            {step === 1 && hasAdmin && (
              <p className="mt-4 text-sm text-grey">{Q.adminIncluded}</p>
            )}
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 rounded-full py-2 text-sm font-medium text-body transition-colors hover:text-fg"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {Q.back}
              </button>
            )}
            {step < n - 1 && (
              <Button
                size="nav"
                variant={answers[step] !== null ? "primary" : "secondary"}
                disabled={answers[step] === null}
                onClick={() => setStep(step + 1)}
                className={`order-last ml-auto w-36 gap-2 ${answers[step] === null ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {Q.next}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            )}
            {done && (
              <button
                type="button"
                onClick={() => {
                  setAnswers(Array(n).fill(null));
                  setStep(0);
                }}
                className="inline-flex items-center gap-2 rounded-full py-2 text-sm font-medium text-body transition-colors hover:text-fg"
              >
                <ArrowCounterClockwise size={16} aria-hidden="true" />
                {Q.restart}
              </button>
            )}
          </div>
        </div>

        {/* right: the live estimate */}
        <div
          className="flex min-w-0 flex-col border-t border-white/[0.08] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10"
          aria-live="polite"
        >
          <p className="text-sm text-grey">{Q.estimate}</p>
          {typeIdx === null ? (
            <p className="mt-4 text-base text-body">{Q.empty}</p>
          ) : (
            <>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-sm text-grey">
                  {SERVICES.pricePrefix}
                </span>
                <span className="text-3xl font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
                  {money(total)}
                </span>
              </p>
              {wantsSupport && (
                <p className="mt-2 text-sm text-body">
                  + {money(Q.supportPrice)} {Q.perMonth}
                </p>
              )}
              <dl className="mt-6 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-grey">
                    {plan ? plan.name : Q.lines.base}
                  </dt>
                  <dd className="text-fg tabular-nums">{money(base)}</dd>
                </div>
                {answers[1] !== null && wantsAdmin && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-grey">{Q.lines.admin}</dt>
                    <dd className="text-fg tabular-nums">
                      {hasAdmin ? Q.lines.included : `+ ${money(Q.adminPrice)}`}
                    </dd>
                  </div>
                )}
                {wantsSupport && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-grey">{Q.lines.support}</dt>
                    <dd className="text-fg tabular-nums">
                      {money(Q.supportPrice)} {Q.perMonth}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-grey">{Q.termLabel}</dt>
                  <dd className="text-fg">
                    {SERVICES.term} {UI.days(days)}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-sm text-grey">
                {unsure ? Q.unsureNote : Q.note}
              </p>
            </>
          )}
          <div className="mt-auto pt-8">
            {done ? (
              <Button href="#contact" onClick={send} className="w-full">
                {Q.cta}
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full opacity-60"
                disabled
                aria-disabled="true"
              >
                {Q.cta}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
