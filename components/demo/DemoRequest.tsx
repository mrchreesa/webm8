"use client";

import Link from "next/link";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { TradeIcon } from "@/components/home/story/TradeIcon";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { demoLimits, type DemoField } from "@/lib/demoRequest";
import { whatsappHref } from "@/lib/leadAttribution";
import { brand, intakeEmail } from "@/lib/site";
import { tradeGroups, trades } from "@/lib/trades";
import { DemoSketch } from "./DemoSketch";
import { DemoStickyCta } from "./DemoStickyCta";
import styles from "./demo.module.css";
import { useDemoRequest, type DemoDone } from "./useDemoRequest";

/** The chips' order: home services first, "Something else" last. */
const tradeKeys = tradeGroups.flatMap(({ keys }) => keys);

const legendCls = "font-display text-[1.6rem] leading-[1.05] font-bold tracking-[-0.03em] text-ink";
const labelCls = "text-[0.95rem] font-semibold text-ink";
const inputCls = cn(
  "h-13 w-full rounded-xl border border-border bg-white px-4 text-[1.0625rem] text-ink",
  "shadow-[0_1px_2px_rgb(7_26_51/0.04)] transition-[border-color,box-shadow] duration-150 placeholder:text-muted/60",
  "hover:border-ink/30 focus:border-ink focus:ring-[3px] focus:ring-ink/15 focus:outline-none",
);

/** The form and its success panel share this frame: the answers on the left, the sketch on the right. */
const frameCls = cn(
  "grid rounded-[2rem] bg-surface p-2.5 shadow-card ring-1 ring-border/70 sm:p-3",
  "lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-x-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]",
);
const paneCls = "px-3 sm:px-5 lg:col-start-1 lg:px-8";

type FieldProps = {
  label: ReactNode;
  name: DemoField;
  error?: string;
  hint?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className">;

function Field({ label, name, error, hint, className, ...input }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(inputCls, error && "border-error hover:border-error focus:border-error focus:ring-error/15")}
        {...input}
      />
      {message ? (
        <p id={messageId} className={cn("text-sm leading-snug", error ? "text-error" : "text-muted")}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The /free-demo/ request form, under the hero. Every "Get my free demo"
 * button on the page scrolls here (`#demo-request`). Beside it (above it on
 * a phone), DemoSketch draws their homepage as they answer. The success
 * panel replaces the form only once /api/demo-request/ has saved the request.
 */
export function DemoRequest() {
  const { answers, errors, checks, formError, status, done, justSaved, setAnswer, submit } = useDemoRequest();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const tradeMessageId = useId();

  // After a check finds errors, the first field with one takes focus, so its
  // message is read out (for the type of business, its first chip). Typing
  // clears errors without moving focus.
  useEffect(() => {
    if (checks === 0) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid?.matches("input") ? invalid : invalid?.querySelector<HTMLElement>("input"))?.focus();
  }, [checks]);

  // The moment a request is saved, bring the success panel into view. A
  // reload that restores it stays where it is.
  useEffect(() => {
    if (!justSaved) return;
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 80) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    }
  }, [justSaved]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    void submit(honeypotRef.current?.value ?? "");
  }

  return (
    <section data-analytics-section="Demo request form"
      ref={sectionRef}
      id="demo-request"
      aria-labelledby="demo-request-title"
      className="scroll-mt-16 bg-bg-alt py-16 md:scroll-mt-20 md:py-24"
    >
      <div className="container-page">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-end lg:gap-x-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <h2
            id="demo-request-title"
            tabIndex={-1}
            data-demo-focus
            className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-bold text-ink outline-none"
          >
            Get your free demo.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted lg:pb-1">
            It takes about two minutes. We’ll call you the same day, then show you a homepage designed for your
            business within 48 hours of that call.
          </p>
        </div>

        <div ref={cardRef} className="mt-8 scroll-mt-24 md:mt-10">
          {status === "done" && done ? (
            <div className={frameCls}>
              <div className={cn(paneCls, "py-6 lg:py-9")}>
                <DemoRequestSuccess done={done} focus={justSaved} />
              </div>
              <DemoSketch trade={done.trade} business={done.business} className="mt-2 lg:col-start-2 lg:row-start-1 lg:mt-0" />
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="demo-request-title" className={cn(frameCls, "relative")}>
              <DemoSketch trade={answers.trade} business={answers.business} className="lg:col-start-2 lg:row-start-1" />

              <div className={cn(paneCls, "pt-7 pb-6 lg:row-start-1 lg:pt-9 lg:pb-9")}>
                <fieldset>
                  <legend className={legendCls}>About your business</legend>
                  <p className="mt-1.5 text-muted">We design your demo from this.</p>

                  <fieldset
                    role="radiogroup"
                    aria-invalid={errors.trade ? true : undefined}
                    aria-describedby={errors.trade ? tradeMessageId : undefined}
                    className="mt-7"
                  >
                    <legend className={labelCls}>Type of business</legend>
                    <div className={cn(styles.chips, "mt-3")} data-invalid={errors.trade ? "" : undefined}>
                      {tradeKeys.map((key) => (
                        <label key={key} className={styles.chip} data-checked={answers.trade === key ? "" : undefined}>
                          <input
                            type="radio"
                            name="trade"
                            value={key}
                            checked={answers.trade === key}
                            onChange={() => setAnswer("trade", key)}
                            className="sr-only"
                          />
                          <TradeIcon trade={key} strokeWidth={2} />
                          {trades[key].short}
                        </label>
                      ))}
                    </div>
                    {errors.trade ? (
                      <p id={tradeMessageId} className="mt-2.5 text-sm leading-snug text-error">
                        {errors.trade}
                      </p>
                    ) : null}
                  </fieldset>

                  {answers.trade === "other" ? (
                    <Field
                      className="mt-5"
                      label="What does your business do?"
                      name="tradeOther"
                      value={answers.tradeOther}
                      onChange={(event) => setAnswer("tradeOther", event.target.value)}
                      placeholder="Dog grooming, accountancy, tattoos…"
                      maxLength={demoLimits.tradeOther}
                      autoComplete="off"
                      enterKeyHint="next"
                      error={errors.tradeOther}
                    />
                  ) : null}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Business name"
                      name="business"
                      value={answers.business}
                      onChange={(event) => setAnswer("business", event.target.value)}
                      placeholder="Reyes Plumbing"
                      autoComplete="organization"
                      enterKeyHint="next"
                      maxLength={demoLimits.business}
                      error={errors.business}
                    />

                    <Field
                      label={
                        <>
                          Website or social page <span className="font-normal text-muted">(optional)</span>
                        </>
                      }
                      hint="Your current site, Google listing or Facebook page."
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
                  </div>
                </fieldset>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                    className="sm:col-span-2"
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
                </div>

                {formError ? (
                  <div role="alert" className="mt-7 rounded-2xl bg-error/10 p-4 text-sm text-ink ring-1 ring-error/40">
                    <p className="font-semibold">{formError}</p>
                    {formError.includes(intakeEmail) ? null : (
                      <p className="mt-1 text-muted">
                        Still stuck? Email{" "}
                        <a data-analytics-id="Email support" href={`mailto:${intakeEmail}`} className="font-semibold text-link underline-offset-2 hover:underline">
                          {intakeEmail}
                        </a>
                        .
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Button data-analytics-id="Submit demo request" type="submit" size="lg" disabled={status === "sending"} className="w-full shrink-0 sm:w-fit">
                    {status === "sending" ? "Sending…" : "Get my free demo"}
                    {status === "sending" ? null : <Icon name="arrow" size={18} aria-hidden />}
                  </Button>
                  <p className="text-sm leading-relaxed text-muted">
                    We’ll call you today, or first thing tomorrow if it’s late. No payment. No obligation.
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted">
                  We only use your details to talk to you about your demo.{" "}
                  <Link data-analytics-id="Read privacy policy" href="/privacy/" className="text-link underline underline-offset-2">
                    Privacy
                  </Link>
                </p>
              </div>

              {/* Hidden from people; a bot that fills every field fills this one too. */}
              <div aria-hidden="true" className="absolute top-0 left-0 h-px w-px overflow-hidden opacity-0">
                <label>
                  Company website
                  <input ref={honeypotRef} type="text" name="website_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>
            </form>
          )}
        </div>
      </div>

      <DemoStickyCta formRef={sectionRef} done={status === "done"} />
    </section>
  );
}

function DemoRequestSuccess({ done, focus }: { done: DemoDone; focus: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const whatsapp = whatsappHref(brand.whatsapp, `Hi, it's ${done.firstName} from ${done.business}. I've just asked for a free website demo.`);

  useEffect(() => {
    if (focus) headingRef.current?.focus({ preventScroll: true });
  }, [focus]);

  const timeline = [
    { title: "Request received", body: "Just now", done: true },
    { title: "A quick call", body: `Today, about 5 minutes, to learn about ${done.business}` },
    { title: "Your demo", body: "Ready within 48 hours of that call, shown on a short video call" },
    { title: "You decide", body: "Love it? We’ll recommend a plan. If not, walk away." },
  ];

  return (
    <div data-analytics-section="Demo request confirmation" className={styles.success}>
      <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 py-1 pr-3.5 pl-1 text-sm font-semibold text-accent">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
          <Icon name="check" size={14} aria-hidden />
        </span>
        Request saved
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[clamp(2rem,6vw,2.6rem)] leading-[1] font-bold tracking-[-0.035em] text-ink outline-none">
        {done.firstName ? `You’re in, ${done.firstName}.` : "You’re in."}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-muted">
        We’ll call you today on <span className="font-semibold whitespace-nowrap text-ink">{done.phone}</span>.
        {done.confirmationSent ? <> We’ve emailed a copy to <span className="font-semibold text-ink [overflow-wrap:anywhere]">{done.email}</span>.</> : <> Your details are saved.</>}
        {brand.phone ? (
          <>
            {" "}
            Our call will come from{" "}
            <a data-analytics-id="Call WebM8" href={`tel:${brand.phone}`} className="font-semibold whitespace-nowrap text-link">
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
                item.done ? "bg-accent text-white" : "text-muted ring-1 ring-border",
              )}
            >
              {item.done ? <Icon name="check" size={13} aria-hidden /> : index + 1}
            </span>
            <p>
              <span className="block font-semibold text-ink">{item.title}</span>
              <span className="text-sm text-muted">{item.body}</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <LinkButton data-analytics-id="See more examples" href="/work/" variant="ghost">
          See more of our work
          <Icon name="arrow" size={16} aria-hidden />
        </LinkButton>
        {whatsapp ? (
          <a data-analytics-id="Message on WhatsApp"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            <Icon name="whatsapp" size={16} aria-hidden />
            Message us on WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
