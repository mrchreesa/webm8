"use client";

import Link from "next/link";
import type { FormEvent, InputHTMLAttributes, MouseEvent, ReactNode, RefObject } from "react";
import { useEffect, useId, useRef } from "react";
import { TradeIcon } from "@/components/home/story/TradeIcon";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { demoLimits, demoStepCount, type DemoField } from "@/lib/demoRequest";
import { whatsappHref } from "@/lib/leadAttribution";
import { brand, intakeEmail } from "@/lib/site";
import { tradeGroups, trades, type TradeKey } from "@/lib/trades";
import { DemoMiniSketch } from "./DemoSketch";
import styles from "./demo.module.css";
import type { useDemoJourney } from "./useDemoJourney";

type Journey = ReturnType<typeof useDemoJourney>;

const tradeKeys: TradeKey[] = tradeGroups.flatMap(({ keys }) => keys);

/** Long enough to see the chip light up before the next step slides in. */
const ADVANCE_DELAY_MS = 220;

const stepLabel = (step: number) =>
  step === 1 ? "Step 1 of 4 · 2 minutes" : step === demoStepCount ? "Last step" : `Step ${step} of 4`;

type FieldProps = {
  label: ReactNode;
  name: DemoField;
  error?: string;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

function Field({ label, name, error, hint, className, ...input }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          "w-full rounded-xl bg-white px-4 py-3 text-base text-ink shadow-[0_1px_2px_rgb(7_26_51/0.2)] outline-none",
          "ring-2 ring-transparent transition-shadow placeholder:text-muted/70 focus:ring-brand",
          error && "ring-error focus:ring-error",
        )}
        {...input}
      />
      {error ? (
        <p id={messageId} className="w-fit rounded-md bg-error px-2 py-1 text-xs font-medium text-white">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted-invert">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function NextButton({ children = "Next" }: { children?: ReactNode }) {
  return (
    <Button type="submit" size="lg" className="mt-5 w-full sm:w-fit">
      {children}
      <Icon name="arrow" size={18} aria-hidden />
    </Button>
  );
}

export function DemoJourney({
  journey,
  onSeeMore,
  cardRef,
}: {
  journey: Journey;
  onSeeMore: () => void;
  cardRef: RefObject<HTMLDivElement | null>;
}) {
  const { answers, step, direction, errors, checks, formError, status, done, moves, trade, setAnswer, next, back, submit } = journey;
  const legendRef = useRef<HTMLLegendElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef(0);
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // Move focus to the new question whenever the visitor changes step.
  useEffect(() => {
    if (moves === 0) return;
    legendRef.current?.focus({ preventScroll: true });
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 80) {
      card.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [moves, cardRef]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // After a check finds errors, the first field with one takes focus, so its
  // message is read out. Typing clears errors without moving focus.
  useEffect(() => {
    if (checks === 0) return;
    const first = Object.keys(errorsRef.current)[0];
    if (first) cardRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [checks, cardRef]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    if (step < demoStepCount) next();
    else void submit(honeypotRef.current?.value ?? "");
  }

  // A tap or click on a trade moves straight on. Keyboard users choose with
  // the arrow keys and press Enter, so a selection alone never advances.
  function onTradeClick(event: MouseEvent<HTMLInputElement>, key: TradeKey) {
    if (event.detail === 0 || key === "other") return;
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => next(), ADVANCE_DELAY_MS);
  }

  const card = "relative scroll-mt-24 rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm sm:p-7";

  if (status === "done" && done) {
    return (
      <div ref={cardRef} id="demo-journey" className={card}>
        <DemoSuccess done={done} onSeeMore={onSeeMore} />
      </div>
    );
  }

  const business = answers.business.trim();

  return (
    <div ref={cardRef} id="demo-journey" className={card}>
    <form noValidate onSubmit={onSubmit} aria-label="Get your free demo">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.68rem] tracking-[0.12em] text-muted-invert uppercase">{stepLabel(step)}</p>
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="-my-2 rounded-full px-2 py-2 text-sm font-medium text-muted-invert transition-colors hover:text-white"
          >
            <span aria-hidden>←</span> Back
          </button>
        ) : null}
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/12" aria-hidden="true">
        <div className={cn(styles.progress, "h-full rounded-full bg-brand")} style={{ width: `${(step / demoStepCount) * 100}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {`Step ${step} of ${demoStepCount}`}
      </p>

      <fieldset key={step} className={cn("mt-4 min-w-0 sm:mt-5", direction > 0 ? styles.stepForward : styles.stepBack)}>
        <legend
          ref={legendRef}
          tabIndex={-1}
          data-demo-legend
          className="float-left w-full text-[1.35rem] leading-tight font-semibold tracking-tight text-white outline-none sm:text-2xl"
        >
          {step === 1 && "What kind of business do you run?"}
          {step === 2 && "What’s your business called?"}
          {step === 3 && "Where do you work?"}
          {step === 4 && (business ? `Where should we call you about ${business}’s demo?` : "Where should we call you about your demo?")}
        </legend>

        <div className="clear-both pt-3.5 sm:pt-4">
          {step === 1 ? (
            <>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type of business">
                {tradeKeys.map((key) => (
                  <label key={key} className="relative">
                    <input
                      type="radio"
                      name="trade"
                      value={key}
                      checked={answers.trade === key}
                      onChange={() => setAnswer("trade", key)}
                      onClick={(event) => onTradeClick(event, key)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold",
                        "bg-white/[0.07] text-white ring-1 ring-white/15 transition-all",
                        "hover:bg-white/[0.12] hover:ring-white/30",
                        "peer-checked:bg-brand peer-checked:text-brand-ink peer-checked:ring-brand",
                        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
                      )}
                    >
                      {key === "other" ? null : <TradeIcon trade={key} className="h-4 w-4" />}
                      {trades[key].short}
                    </span>
                  </label>
                ))}
              </div>
              {errors.trade ? (
                <p className="mt-3 w-fit rounded-md bg-error px-2 py-1 text-xs font-medium text-white">{errors.trade}</p>
              ) : null}
              {answers.trade === "other" ? (
                <Field
                  className="mt-5"
                  label="What do you do?"
                  name="tradeOther"
                  value={answers.tradeOther}
                  onChange={(event) => setAnswer("tradeOther", event.target.value)}
                  placeholder="Dog grooming, accountancy, tattoos…"
                  maxLength={demoLimits.tradeOther}
                  autoComplete="off"
                  error={errors.tradeOther}
                />
              ) : null}
              {trade ? <NextButton /> : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field
                label={<span className="sr-only">Business name</span>}
                name="business"
                value={answers.business}
                onChange={(event) => setAnswer("business", event.target.value)}
                placeholder="Reyes Plumbing"
                autoComplete="organization"
                enterKeyHint="next"
                maxLength={demoLimits.business}
                error={errors.business}
              />
              {trade ? <DemoMiniSketch trade={trade} business={answers.business} className="mt-3 lg:hidden" /> : null}
              <NextButton />
            </>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <Field
                label={<span className="sr-only">Town, city or area</span>}
                name="area"
                value={answers.area}
                onChange={(event) => setAnswer("area", event.target.value)}
                placeholder="Austin, TX or West London"
                autoComplete="address-level2"
                enterKeyHint="next"
                maxLength={demoLimits.area}
                error={errors.area}
              />
              <Field
                label={
                  <>
                    Got a website, Google or Facebook page? <span className="text-muted-invert">(optional)</span>
                  </>
                }
                name="link"
                value={answers.link}
                onChange={(event) => setAnswer("link", event.target.value)}
                placeholder="Paste a link"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                maxLength={demoLimits.link}
                error={errors.link}
              />
              {trade ? (
                <DemoMiniSketch trade={trade} business={answers.business} area={answers.area} className="lg:hidden" />
              ) : null}
              <div>
                <NextButton />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-4">
              <Field
                label="Your name"
                name="name"
                value={answers.name}
                onChange={(event) => setAnswer("name", event.target.value)}
                autoComplete="name"
                enterKeyHint="next"
                maxLength={demoLimits.name}
                error={errors.name}
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={answers.phone}
                onChange={(event) => setAnswer("phone", event.target.value)}
                autoComplete="tel"
                enterKeyHint="next"
                maxLength={demoLimits.phone}
                error={errors.phone}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                inputMode="email"
                value={answers.email}
                onChange={(event) => setAnswer("email", event.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="send"
                maxLength={demoLimits.email}
                error={errors.email}
              />
              <div>
                <Button type="submit" size="lg" disabled={status === "sending"} className="mt-1 w-full sm:w-fit">
                  {status === "sending" ? "Sending…" : "Get my free demo"}
                  {status === "sending" ? null : <Icon name="arrow" size={18} aria-hidden />}
                </Button>
                <p className="mt-3 text-sm leading-relaxed text-muted-invert">
                  We’ll call you today, or first thing tomorrow if it’s late. No payment. No obligation.
                </p>
                <p className="mt-1.5 text-xs text-muted-invert">
                  We only use your details to talk to you about your demo.{" "}
                  <Link href="/privacy/" className="underline underline-offset-2 hover:text-white">
                    Privacy
                  </Link>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </fieldset>

      {/* Hidden from people; a bot that fills every field fills this one too. */}
      <div aria-hidden="true" className="absolute top-0 left-0 h-px w-px overflow-hidden opacity-0">
        <label>
          Company website
          <input ref={honeypotRef} type="text" name="website_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {formError ? (
        <div role="alert" className="mt-5 rounded-2xl bg-error/15 p-4 text-sm text-white ring-1 ring-error/60">
          <p className="font-semibold">{formError}</p>
          {formError.includes(intakeEmail) ? null : (
            <p className="mt-1 text-muted-invert">
              Still stuck? Email{" "}
              <a href={`mailto:${intakeEmail}`} className="font-semibold text-link-invert underline-offset-2 hover:underline">
                {intakeEmail}
              </a>
              .
            </p>
          )}
        </div>
      ) : null}
    </form>
    </div>
  );
}

function DemoSuccess({ done, onSeeMore }: { done: NonNullable<Journey["done"]>; onSeeMore: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const whatsapp = whatsappHref(brand.whatsapp, `Hi, it's ${done.firstName} from ${done.business}. I've just asked for a free website demo.`);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const timeline = [
    { title: "Request received", body: "Just now", done: true },
    { title: "A quick call", body: `Today, about 5 minutes, to learn about ${done.business}` },
    { title: "Your demo", body: "Ready within 48 hours of that call, shown on a short video call" },
    { title: "You decide", body: "Love it? We’ll recommend a plan. If not, walk away." },
  ];

  return (
    <div className={styles.success}>
      <p className="inline-flex items-center gap-2 rounded-full bg-white/8 py-1 pr-3.5 pl-1 text-sm font-semibold text-brand ring-1 ring-white/12">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-brand-ink">
          <Icon name="check" size={14} aria-hidden />
        </span>
        Request saved
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-[clamp(2rem,6vw,2.6rem)] leading-[1] font-bold text-white outline-none">
        {done.firstName ? (
          <>
            You’re in, <span className="text-brand">{done.firstName}.</span>
          </>
        ) : (
          "You’re in."
        )}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-invert">
        We’ll call you today on <span className="font-semibold whitespace-nowrap text-white">{done.phone}</span>. We’ve emailed
        a copy to <span className="font-semibold text-white [overflow-wrap:anywhere]">{done.email}</span>.
        {brand.phone ? (
          <>
            {" "}
            Our call will come from{" "}
            <a href={`tel:${brand.phone}`} className="font-semibold whitespace-nowrap text-link-invert">
              {brand.phoneLabel || brand.phone}
            </a>
            .
          </>
        ) : null}
      </p>

      <ol className="mt-6 grid gap-3.5">
        {timeline.map((item, index) => (
          <li key={item.title} className="grid grid-cols-[1.5rem_1fr] gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-6 w-6 place-items-center rounded-full font-mono text-[0.7rem] font-semibold",
                item.done ? "bg-brand text-brand-ink" : "text-muted-invert ring-1 ring-white/25",
              )}
            >
              {item.done ? <Icon name="check" size={13} aria-hidden /> : index + 1}
            </span>
            <p>
              <span className="block font-semibold text-white">{item.title}</span>
              <span className="text-sm text-muted-invert">{item.body}</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="ghost-invert" onClick={onSeeMore}>
          See more demos we’ve designed
          <Icon name="arrow" size={16} aria-hidden />
        </Button>
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/6 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 ring-inset hover:bg-white/10"
          >
            <Icon name="whatsapp" size={16} aria-hidden />
            Message us on WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
