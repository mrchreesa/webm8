"use client";

import Link from "next/link";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { fieldBase, labelCls } from "@/components/forms/FormField";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { demoLimits, type DemoField } from "@/lib/demoRequest";
import { whatsappHref } from "@/lib/leadAttribution";
import { brand, intakeEmail } from "@/lib/site";
import { tradeGroups, trades } from "@/lib/trades";
import { DemoStickyCta } from "./DemoStickyCta";
import styles from "./demo.module.css";
import { useDemoRequest, type DemoDone } from "./useDemoRequest";

const reassurances = ["Takes about two minutes", "No payment details, ever", "No obligation. Not for you? Walk away."];

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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(fieldBase, error && "border-error focus:border-error")}
        {...input}
      />
      {message ? (
        <p id={messageId} className={cn("text-xs leading-relaxed", error ? "text-error" : "text-muted")}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The /free-demo/ request form, under the hero. Every "Get my free demo"
 * button on the page scrolls here (`#demo-request`). The success panel
 * replaces the form only once /api/demo-request/ has saved the request.
 */
export function DemoRequest() {
  const { answers, errors, checks, formError, status, done, justSaved, setAnswer, submit } = useDemoRequest();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const tradeId = useId();

  // After a check finds errors, the first field with one takes focus, so its
  // message is read out. Typing clears errors without moving focus.
  useEffect(() => {
    if (checks === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
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
    <section
      ref={sectionRef}
      id="demo-request"
      aria-labelledby="demo-request-title"
      className="scroll-mt-16 bg-bg-alt py-16 md:scroll-mt-20 md:py-24"
    >
      <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:pt-4">
          <h2
            id="demo-request-title"
            tabIndex={-1}
            data-demo-focus
            className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-bold text-ink outline-none"
          >
            Get your free demo.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Tell us about your business. We’ll call you the same day, then show you a homepage designed for it within 48
            hours of that call.
          </p>
          <ul className="mt-6 grid gap-3">
            {reassurances.map((item) => (
              <li key={item} className="flex items-center gap-3 font-medium text-ink">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-brand">
                  <Icon name="check" size={14} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <div ref={cardRef} className="scroll-mt-24 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-8">
          {status === "done" && done ? (
            <DemoRequestSuccess done={done} focus={justSaved} />
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="demo-request-title" className="relative">
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={tradeId} className={labelCls}>
                    Type of business
                  </label>
                  <select
                    id={tradeId}
                    name="trade"
                    value={answers.trade}
                    onChange={(event) => setAnswer("trade", event.target.value)}
                    aria-invalid={errors.trade ? true : undefined}
                    aria-describedby={errors.trade ? `${tradeId}-message` : undefined}
                    className={cn(fieldBase, !answers.trade && "text-muted", errors.trade && "border-error focus:border-error")}
                  >
                    <option value="" disabled>
                      Choose one
                    </option>
                    {tradeGroups.map(({ group, keys }) =>
                      group === trades.other.group ? (
                        keys.map((key) => (
                          <option key={key} value={key} className="text-ink">
                            {trades[key].short}
                          </option>
                        ))
                      ) : (
                        <optgroup key={group} label={group} className="text-ink">
                          {keys.map((key) => (
                            <option key={key} value={key}>
                              {trades[key].short}
                            </option>
                          ))}
                        </optgroup>
                      ),
                    )}
                  </select>
                  {errors.trade ? (
                    <p id={`${tradeId}-message`} className="text-xs leading-relaxed text-error">
                      {errors.trade}
                    </p>
                  ) : null}
                </div>

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

                {answers.trade === "other" ? (
                  <Field
                    className="sm:col-span-2"
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

                <Field
                  label="Town, city or area"
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
                  label="Website or social page (optional)"
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

              {/* Hidden from people; a bot that fills every field fills this one too. */}
              <div aria-hidden="true" className="absolute top-0 left-0 h-px w-px overflow-hidden opacity-0">
                <label>
                  Company website
                  <input ref={honeypotRef} type="text" name="website_hp" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {formError ? (
                <div role="alert" className="mt-6 rounded-2xl bg-error/10 p-4 text-sm text-ink ring-1 ring-error/40">
                  <p className="font-semibold">{formError}</p>
                  {formError.includes(intakeEmail) ? null : (
                    <p className="mt-1 text-muted">
                      Still stuck? Email{" "}
                      <a href={`mailto:${intakeEmail}`} className="font-semibold text-link underline-offset-2 hover:underline">
                        {intakeEmail}
                      </a>
                      .
                    </p>
                  )}
                </div>
              ) : null}

              <div className="mt-6">
                <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-fit">
                  {status === "sending" ? "Sending…" : "Get my free demo"}
                  {status === "sending" ? null : <Icon name="arrow" size={18} aria-hidden />}
                </Button>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  We’ll call you today, or first thing tomorrow if it’s late. No payment. No obligation.
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  We only use your details to talk to you about your demo.{" "}
                  <Link href="/privacy/" className="text-link underline underline-offset-2">
                    Privacy
                  </Link>
                </p>
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
    <div className={styles.success}>
      <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 py-1 pr-3.5 pl-1 text-sm font-semibold text-accent">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
          <Icon name="check" size={14} aria-hidden />
        </span>
        Request saved
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-[clamp(2rem,6vw,2.6rem)] leading-[1] font-bold text-ink outline-none">
        {done.firstName ? `You’re in, ${done.firstName}.` : "You’re in."}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-muted">
        We’ll call you today on <span className="font-semibold whitespace-nowrap text-ink">{done.phone}</span>. We’ve emailed a
        copy to <span className="font-semibold text-ink [overflow-wrap:anywhere]">{done.email}</span>.
        {brand.phone ? (
          <>
            {" "}
            Our call will come from{" "}
            <a href={`tel:${brand.phone}`} className="font-semibold whitespace-nowrap text-link">
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
        <LinkButton href="/work/" variant="ghost">
          See more of our work
          <Icon name="arrow" size={16} aria-hidden />
        </LinkButton>
        {whatsapp ? (
          <a
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
