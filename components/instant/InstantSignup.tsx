"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { FormStatus, TextAreaField, TextField } from "@/components/forms/FormField";
import { InstantSummary } from "./InstantSummary";
import { CheckoutLoading } from "./CheckoutLoading";
import { useInstantAnalytics } from "./useInstantAnalytics";
import { canSubmitBrief, type BillingStatus } from "@/lib/instantBilling";
import {
  DRAFT_KEY, INSTANT_PRICE, INSTANT_TRIAL_DAYS, contactMethods, emptyAnswers, features, industries, scopes,
  needsQuote, trialEndDate, readDraft, suggestedContacts, validateAttachment, validateStep,
  type Answers, type ContactMethod, type Errors, type Industry, type Step,
} from "@/lib/instantWebsite";
import styles from "./instant.module.css";
const InstantPayment = dynamic(() => import("./InstantPayment").then(module => module.InstantPayment), { loading: () => <CheckoutLoading /> });

const stageCopy: Record<Step, { title: string; intro: string }> = {
  business: { title: "Your new website. Ready in one working day.", intro: "Tell us about your business. We’ll design, build and look after your website—with unlimited revisions until you’re happy." },
  checkout: { title: "Secure free trial", intro: `Start your ${INSTANT_TRIAL_DAYS}-day free trial. £${INSTANT_PRICE}/month after your trial ends.` },
  brief: { title: "Tell us about your business.", intro: "Add your services, links and preferences. A few lines are enough to get started." },
  complete: { title: "You're all set!", intro: "Your website will be ready within one working day." },
  quote: { title: "A little more than a landing page.", intro: "We can put together a custom quote for the features you need." },
  "quote-complete": { title: "Your quote brief is ready.", intro: "Your requirements are together in one place." },
};
const stages = ["Your details", "Payment", "Website details"];
const serviceLabels: Record<string, { label: string; placeholder: string }> = {
  trades: { label: "What jobs do you most want enquiries for?", placeholder: "For example: boiler repairs, annual servicing and new installations." },
  food: { label: "What food or drinks should we highlight?", placeholder: "For example: wood-fired pizza, weekend brunch and speciality coffee." },
  beauty: { label: "Which treatments should we feature?", placeholder: "For example: facials, massage and brow treatments." },
};

export function InstantSignup({ billing = false, publishableKey = "", testMode = false }: { billing?: boolean; publishableKey?: string; testMode?: boolean }) {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState<Step>("business");
  const [loaded, setLoaded] = useState(false);
  const [checkoutPreviewed, setCheckoutPreviewed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [today, setToday] = useState("");
  const [billingOrder, setBillingOrder] = useState<BillingStatus | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");
  const [pollTrial, setPollTrial] = useState(false);
  const [checkoutLoadFailed, setCheckoutLoadFailed] = useState(false);
  const checkoutLoadRequested = useRef(false);
  const trialObserved = useRef(false);
  const pending = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const draftKey = billing ? "webm8:instant-billing:v1" : DRAFT_KEY;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const billingStatusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const complete = step === "complete" || step === "quote-complete";
  const quote = needsQuote(answers);
  const stage = step === "business" ? 0 : step === "checkout" ? 1 : 2;
  const analyticsEnabled = billing && !testMode && !quote;
  const analytics = useInstantAnalytics(analyticsEnabled, step, loaded);
  useEffect(() => {
    if (!loaded || !billingOrder || !canSubmitBrief(billingOrder) || trialObserved.current) return;
    trialObserved.current = true;
    analytics.form("step_complete", 2);
    analytics.action("trial_confirmed");
  }, [loaded, billingOrder, analytics]);
  useEffect(() => () => requestController.current?.abort(), []);
  useEffect(() => {
    if (!loaded || !billingMessage) return;
    billingStatusRef.current?.focus({ preventScroll: true });
    billingStatusRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [billingMessage, loaded]);

  useEffect(() => {
    let draft: ReturnType<typeof readDraft> = null;
    let savedOrderId: string | undefined;
    try {
      const raw = sessionStorage.getItem(draftKey);
      draft = readDraft(raw);
      if (raw && billing) savedOrderId = JSON.parse(raw).billingOrderId;
      if (draft) {
        setAnswers(draft.answers); setStep(billing ? "business" : draft.step); setCheckoutPreviewed(!billing && draft.checkoutPreviewed);
      } else if (raw) sessionStorage.removeItem(draftKey);
    } catch { setStorageAvailable(false); }
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
    if (!billing) { setLoaded(true); return; }
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let disposed = false;
    fetch("/api/instant/session/", { signal: controller.signal, cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.errors?.form || "Checkout is temporarily unavailable.");
      if (disposed) return;
      const order = data.order as BillingStatus | null;
      setBillingOrder(order);
      if (order) {
        const restoredAnswers = order.checkoutConfirmed && !order.submitted && !order.briefPending && savedOrderId === order.id && draft ? draft.answers : order.answers;
        setAnswers(order.checkoutConfirmed ? { ...restoredAnswers, enquiryEmail: restoredAnswers.enquiryEmail || restoredAnswers.email, contacts: restoredAnswers.contacts.length ? restoredAnswers.contacts : suggestedContacts(restoredAnswers) } : restoredAnswers);
        setCheckoutPreviewed(order.checkoutConfirmed);
        setStep(order.submitted ? "complete" : canSubmitBrief(order) ? "brief" : "checkout");
        if (data.checkoutPending) setPollTrial(true);
      }
    }).catch(error => { if (!disposed) setBillingMessage(error instanceof Error && error.name !== "AbortError" ? error.message : "We couldn’t check your trial. Check your connection and try again."); })
      .finally(() => { window.clearTimeout(timeout); if (!disposed) setLoaded(true); });
    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout); };
  }, [billing, draftKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ version: 1, savedAt: Date.now(), answers, step, checkoutPreviewed, billingOrderId: billingOrder?.id }));
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
  }, [answers, step, checkoutPreviewed, loaded, draftKey, billingOrder?.id]);

  useEffect(() => {
    if (!billing || !pollTrial) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const poll = async () => {
      try {
        const response = await fetch("/api/instant/session/", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]), cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error("Trial check failed");
        const order = data.order as BillingStatus | null;
        if (controller.signal.aborted) return;
        setBillingOrder(order);
        if (order?.checkoutConfirmed) {
          setPollTrial(false); setClientSecret(""); setCheckoutPreviewed(true);
          if (canSubmitBrief(order)) {
            setBillingMessage("");
            setAnswers(a => ({ ...a, enquiryEmail: a.enquiryEmail || a.email, contacts: a.contacts.length ? a.contacts : suggestedContacts(a) }));
            setStep(order.submitted ? "complete" : "brief");
            requestAnimationFrame(() => titleRef.current?.focus());
          } else setBillingMessage("Your subscription needs attention. Please email info@webm8agency.com for help.");
          return;
        }
      } catch { if (controller.signal.aborted) return; }
      if (++attempts < 10) timer = setTimeout(poll, 2000);
      else { setPollTrial(false); setBillingMessage("Your trial is not confirmed yet. Refresh this page to check again. Please don’t start a second subscription."); }
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [billing, pollTrial, analytics]);

  useEffect(() => {
    if (complete || (!files.length && storageAvailable)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [complete, files.length, storageAvailable]);

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    if (billingBusy) return;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (Object.keys(errors).length) setErrors(validateStep(step, next));
  }

  const go = useCallback((next: Step) => {
    if (next === "business") { setClientSecret(""); checkoutLoadRequested.current = false; setCheckoutLoadFailed(false); }
    setStep(next); setErrors({});
    requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true });
      titleRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, []);

  function check(current: Step) {
    const nextErrors = validateStep(current, answers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      analytics.form("validation_error", current === "business" ? 1 : current === "checkout" ? 2 : 3, "invalid");
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        const disclosure = invalid?.closest("details");
        if (disclosure) disclosure.open = true;
        invalid?.focus();
      });
      return false;
    }
    return true;
  }

  const billingAction = useCallback(async (kind: "checkout" | "brief") => {
    if (pending.current) return;
    if (kind === "checkout" && !publishableKey) { setCheckoutLoadFailed(true); setBillingMessage("Secure checkout is not available yet. Please contact WebM8."); return; }
    if (kind === "checkout") setCheckoutLoadFailed(false);
    if (kind === "brief") analytics.form("submit", 3);
    pending.current = true; setBillingBusy(true); setBillingMessage("");
    const controller = new AbortController(); requestController.current = controller;
    try {
      const response = await fetch(`/api/instant/${kind}/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]) });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        analytics.form("submission_error", kind === "checkout" ? 2 : 3, response.status === 400 ? "invalid" : "server");
        if (kind === "checkout") setCheckoutLoadFailed(true);
        if (kind === "brief" && result.restoreBrief && result.order) {
          setBillingOrder(result.order);
          setAnswers(result.order.answers);
        }
        setErrors(result.errors || {}); setBillingMessage(result.errors?.form || "Please check your answers and try again.");
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }
      if (result.order) {
        setBillingOrder(result.order);
        if (kind === "brief") {
          setAnswers(result.order.answers);
          if (result.order.submitted) analytics.form("success", 3);
        }
      }
      if (kind === "checkout" && result.clientSecret) setClientSecret(result.clientSecret);
      else if (result.order?.checkoutConfirmed) {
        if (result.order.submitted || canSubmitBrief(result.order)) { setCheckoutPreviewed(true); go(result.order.submitted ? "complete" : "brief"); }
        else setBillingMessage("Your subscription needs attention. Please email info@webm8agency.com for help.");
      }
    } catch { analytics.form("submission_error", kind === "checkout" ? 2 : 3, "network"); if (kind === "checkout") setCheckoutLoadFailed(true); setBillingMessage("We couldn’t confirm that just now. Check your connection and try again; your answers are still here."); }
    finally { pending.current = false; setBillingBusy(false); }
  }, [answers, go, publishableKey, analytics]);

  useEffect(() => {
    if (!billing || !loaded || step !== "checkout" || quote || clientSecret || billingOrder?.checkoutConfirmed || pollTrial || checkoutLoadRequested.current) return;
    checkoutLoadRequested.current = true;
    void billingAction("checkout");
  }, [billing, loaded, step, quote, clientSecret, billingOrder?.checkoutConfirmed, pollTrial, billingAction]);

  async function recordConsent() {
    const response = await fetch("/api/instant/consent/", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acknowledged: true, sessionId: clientSecret.split("_secret_")[0] }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.errors?.form || "We couldn’t save your confirmation. Please try again.");
    setAnswers(a => ({ ...a, checkoutAcknowledged: true }));
  }

  function advance(event: FormEvent) {
    event.preventDefault();
    if (!loaded || pending.current || billingBusy || pollTrial) return;
    if (step !== "checkout" && !check(step)) return;
    if (step === "business") { analytics.form("start", 1); analytics.form("step_complete", 1); go(quote ? "quote" : "checkout"); }
    else if (step === "checkout") {
      if (quote) { go("quote"); return; }
      if (billing) {
        if (clientSecret) return;
        if (billingOrder && canSubmitBrief(billingOrder)) { go("brief"); return; }
        void billingAction("checkout"); return;
      }
      setCheckoutPreviewed(true);
      setAnswers((a) => ({ ...a, checkoutAcknowledged: true, enquiryEmail: a.enquiryEmail || a.email, contacts: a.contacts.length ? a.contacts : suggestedContacts(a) }));
      go("brief");
    } else if (step === "brief") { analytics.form("step_complete", 3); if (billing) void billingAction("brief"); else go(checkoutPreviewed ? "complete" : "checkout"); }
    else if (step === "quote") { if (billing) setBillingMessage("Please contact WebM8 for your custom quote. This route does not start a subscription."); else go("quote-complete"); }
  }

  function back() {
    if (billingBusy) return;
    setClientSecret("");
    const previous: Partial<Record<Step, Step>> = { checkout: "business", brief: "checkout", quote: "business" };
    if (previous[step]) go(previous[step]!);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const accepted = [...files];
    const problems: string[] = [];
    for (const file of Array.from(list)) {
      const error = validateAttachment(file);
      if (error) { problems.push(`${file.name}: ${error}`); continue; }
      if (accepted.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) continue;
      if (accepted.length >= 5) { problems.push(`${file.name}: choose up to five files.`); continue; }
      accepted.push(file);
    }
    setFiles(accepted); setFileErrors(problems);
  }

  function field(name: keyof Answers, label: string, options: { required?: boolean; type?: "text" | "email" | "tel" | "url"; hint?: string; placeholder?: string; autoComplete?: string } = {}) {
    return <TextField data-analytics-field={name.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)} key={name} name={name} label={label} value={String(answers[name])} onChange={(event) => update(name, event.target.value as never)} error={errors[name]} labelVariant="contact" maxLength={options.type === "url" ? 1000 : 200} {...options} />;
  }
  function textarea(name: "services" | "difference" | "notes" | "quoteDetails", label: string, options: { required?: boolean; placeholder?: string; hint?: string } = {}) {
    return <TextAreaField data-analytics-field={name.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)} key={name} name={name} label={label} value={answers[name]} onChange={(event) => update(name, event.target.value)} error={errors[name]} labelVariant="contact" maxLength={2000} rows={4} {...options} />;
  }
  const serviceCopy = serviceLabels[answers.industry] || { label: "What are your main services?", placeholder: "List up to three services, or tell us briefly what you do." };
  const needsEmail = answers.contacts.includes("email") || answers.contacts.includes("request") || (answers.contacts.includes("booking") && answers.bookingLater);
  const firstCharge = today ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/London" }).format(new Date(`${trialEndDate(today)}T12:00:00Z`)) : `${INSTANT_TRIAL_DAYS} days after checkout`;


  return (
    <section id="instant-signup" className={styles.page} data-analytics-section={billing ? "Instant website signup" : "Instant website preview"} aria-labelledby="instant-title">
      <div className={styles.pageHeading}>
        <h1 id="instant-title">Let’s get you online.</h1>
      </div>
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <div className={styles.flowTop}>
            <ol aria-label="Signup progress" className={styles.progress}>
              {(quote ? ["Your details", "Quote details"] : stages).map((label, index) => {
                const current = quote ? step === "business" ? 0 : 1 : stage;
                return <li key={label} aria-current={!complete && index === current ? "step" : undefined} data-active={index <= current}><span>{complete || index < current ? <Icon name="check" size={12} aria-hidden /> : index + 1}</span>{label}</li>;
              })}
            </ol>
          </div>
          {testMode && <p className={styles.notice}>Test checkout — no real payments are taken.</p>}
          {complete && !quote && <div className={styles.successMark}><span><Icon name="check" size={26} aria-hidden /></span>{billing ? "Website brief received" : "Success screen preview"}</div>}
          <h2 className={styles.title} ref={titleRef} tabIndex={-1}>{stageCopy[step].title}</h2>
          <p className={styles.intro}>{stageCopy[step].intro}</p>
          {step === "business" && <p className={styles.offerLine}>{INSTANT_TRIAL_DAYS} days free · Then £{INSTANT_PRICE}/month · No setup fee · Cancel anytime</p>}
          <div aria-live="polite" className={styles.saveStatus}>
            {!loaded ? billing ? "Checking your saved progress…" : "Opening your preview…" : !storageAvailable ? "This browser can’t save your draft. Keep this page open until you submit." : null}
          </div>
          {billingMessage && <div ref={billingStatusRef} tabIndex={-1} role="status" className={styles.notice}>{billingMessage}</div>}
          {pollTrial && <p role="status" className={styles.hint}>Waiting for Stripe to confirm your trial…</p>}
          {billingOrder?.trialEnd && <p className={styles.hint}>{billingOrder.cancelAtPeriodEnd ? "Cancellation scheduled. Your subscription ends" : "Your free trial ends"} on {new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/London" }).format(new Date(billingOrder.cancelAt || billingOrder.trialEnd))}.</p>}
          {!complete && <form ref={formRef} data-analytics-form={analyticsEnabled ? "instant_website" : undefined} data-analytics-step={stage + 1} data-analytics-steps={3} noValidate onSubmit={advance} aria-busy={!loaded || billingBusy || pollTrial} className={styles.form}>
            <fieldset disabled={!loaded || billingBusy || pollTrial} className={`${styles.form} ${styles.formFields}`}>
            {step === "business" && <>
              <div className={styles.fieldGrid}>
                {field("name", "Your name", { required: true, autoComplete: "name" })}
                {field("email", "Your email address", { required: true, type: "email", autoComplete: "email" })}
              </div>
              {field("deliveryPhone", "Phone number (WhatsApp)", { required: true, type: "tel", autoComplete: "tel", placeholder: "For example: +44 7700 900123", hint: "We’ll send your website here and discuss any edits on WhatsApp. This number won’t be added to your website automatically." })}
              <div className={styles.fieldGrid}>
                {field("businessName", "Business name", { required: true, autoComplete: "organization", placeholder: "Your business name" })}
                {field("area", "Town or service area", { required: true, placeholder: "For example: Bromley", hint: "A town, postcode or the area you serve." })}
              </div>
              <ChoiceGroup analyticsField="industry" name="industry" label="Type of business" presentation="chips" options={industries} values={answers.industry ? [answers.industry] : []} onChange={(v) => update("industry", v[0] as Industry)} error={errors.industry} />
              {quote && <p className={styles.notice} role="status">Those features need a custom quote. Continue to share your requirements. There’s no payment on this route.</p>}
            </>}
            {step === "checkout" && <>
              {billing && clientSecret && <InstantPayment clientSecret={clientSecret} publishableKey={publishableKey} onBeforeConfirm={recordConsent} analytics={analytics} onConfirmed={() => { setClientSecret(""); setPollTrial(true); }} onBusy={setBillingBusy} />}
              {billing && !clientSecret && !billingOrder?.checkoutConfirmed && !pollTrial && <div className={styles.group}>
                {checkoutLoadFailed ? <Button size="lg" className={styles.continue} disabled={billingBusy} onClick={() => void billingAction("checkout")} data-analytics-id="Retry checkout">Retry payment form<Icon name="arrow" size={17} aria-hidden /></Button> : <CheckoutLoading />}
              </div>}
              <div className={styles.orderSummary}>
                <div><span>Instant Websites</span><strong>£{INSTANT_PRICE}<small>/month</small></strong></div>
                <p>Hosting &amp; maintenance</p>
                <dl><div><dt>Due today</dt><dd>£0</dd></div><div><dt>Free trial</dt><dd>{INSTANT_TRIAL_DAYS} days</dd></div><div><dt>Setup fee</dt><dd>£0</dd></div><div><dt>{billing ? "After your trial" : "Example first charge"}</dt><dd>{billing ? `£${INSTANT_PRICE}/month` : `£${INSTANT_PRICE} on ${firstCharge}`}</dd></div></dl>
              </div>
              <div className={styles.contactSummary}><div><strong>{answers.businessName}</strong><p>{answers.name} · {answers.email}</p><p>WhatsApp: {answers.deliveryPhone}</p></div><button type="button" className={styles.textButton} onClick={() => go("business")} data-analytics-id="Edit account details">Edit details</button></div>
              <div className={styles.guarantee}><Icon name="shield" size={22} aria-hidden /><p><strong>{INSTANT_TRIAL_DAYS} days free.</strong> Your trial starts when you complete checkout. Cancel anytime with no cancellation fee.</p></div>
              {!billing && <p className={styles.notice}>Checkout preview only. Don’t enter card details. Live checkout and delivery notifications aren’t connected yet.</p>}
            </>}
            {step === "brief" && <>
              {textarea("services", serviceCopy.label, { required: true, placeholder: serviceCopy.placeholder })}
              <ChoiceGroup analyticsField="customer_contact_methods" name="contacts" label="How should customers contact you?" hint="Choose the ways customers should reach you." compact multiple options={contactMethods} values={answers.contacts} onChange={(v) => update("contacts", v as ContactMethod[])} error={errors.contacts} />
              {answers.contacts.includes("phone") && field("phone", "Public business phone number", { required: true, type: "tel", autoComplete: "tel" })}
              {answers.contacts.includes("whatsapp") && <>
                {answers.contacts.includes("phone") && <label data-analytics-id="Reuse public phone" className={styles.acknowledgement}><input data-analytics-field="same_public_phone" type="checkbox" checked={answers.samePhone} onChange={(event) => update("samePhone", event.target.checked)} />Use the same number for WhatsApp</label>}
                {(!answers.samePhone || !answers.contacts.includes("phone")) && field("whatsapp", "WhatsApp number", { required: true, type: "tel" })}
              </>}
              {answers.contacts.includes("booking") && <>
                <label data-analytics-id="Provide booking link later" className={styles.acknowledgement}><input data-analytics-field="booking_link_later" type="checkbox" checked={answers.bookingLater} onChange={(event) => update("bookingLater", event.target.checked)} />I’ll add my booking link later</label>
                {!answers.bookingLater && field("bookingUrl", "Your existing booking link", { required: true, type: "url", placeholder: "https://…" })}
                {answers.bookingLater && <p className={styles.hint}>We’ll use a booking-request form until you provide the link. You’ll confirm appointments yourself.</p>}
              </>}
              {needsEmail && field("enquiryEmail", "Where should enquiries go?", { required: true, type: "email", hint: "Check this address. Your billing email may be different from your business email." })}
              {answers.contacts.includes("request") && <p className={styles.hint}>Booking requests are sent to you to confirm. They don’t reserve a live appointment slot.</p>}
              <ChoiceGroup analyticsField="existing_website" name="hasWebsite" label="Do you already have a website?" compact options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} values={answers.hasWebsite ? [answers.hasWebsite] : []} onChange={(v) => update("hasWebsite", v[0] as "yes" | "no")} error={errors.hasWebsite} />
              {answers.hasWebsite === "yes" && field("website", "Existing website (optional)", { type: "url", placeholder: "yourbusiness.co.uk", hint: "You can add this later if you don’t have the link handy." })}
              <div className={styles.group}>
                {answers.links.map((link, index) => <div className={styles.linkRow} key={index}>
                  <TextField data-analytics-field={`business_link_${index + 1}`} name={`link-${index}`} label={index === 0 ? "Google Business or social page (optional)" : "Another business link (optional)"} type="url" value={link} onChange={(event) => update("links", answers.links.map((old, i) => i === index ? event.target.value : old))} placeholder="Paste a Google, Instagram or Facebook link" labelVariant="contact" maxLength={1000} error={errors[`link-${index}`]} />
                  {index > 0 && <Button variant="ghost" onClick={() => update("links", answers.links.filter((_, i) => i !== index))} data-analytics-id="Remove business link" aria-label={`Remove business link ${index + 1}`}><Icon name="close" size={16} aria-hidden /></Button>}
                </div>)}
                {answers.links.length < 4 && <button type="button" className={styles.textButton} onClick={() => update("links", [...answers.links, ""])} data-analytics-id="Add business link">+ Add another link</button>}
                <p className={styles.hint}>No website or social pages? That’s fine. We can work from your answers.</p>
              </div>
              {textarea("difference", "What makes your business stand out? (optional)", { placeholder: "For example: family-run, evening appointments or a particular speciality.", hint: "Leave this blank if you’d like help choosing what to highlight." })}
              <details className={styles.optionalDetails}>
                <summary data-analytics-id="Open optional details">Branding, photos & extra details <span>(optional)</span></summary>
                <div className={styles.form}>
              {billing ? <p className={styles.hint}>You can send your logo, photos or menu when we contact you about your website.</p> : <div className={styles.upload}>
                <label htmlFor="instant-assets" className="text-sm font-semibold">Have a logo, photos or a menu?</label>
                <p className={styles.hint}>JPG, PNG, WebP or PDF. Up to five files, 10 MB each.</p>
                <input id="instant-assets" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} className={styles.fileInput} aria-describedby="instant-assets-help" />
                <p id="instant-assets-help" className={styles.hint}>Files are selected locally for this preview. They aren’t uploaded or kept after a refresh.</p>
                <ul className={styles.fileList} aria-live="polite">{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`}><span>{file.name}<small>{(file.size / (1024 * 1024)).toFixed(1)} MB · selected locally</small></span><button type="button" className={styles.textButton} onClick={() => setFiles(files.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}>Remove</button></li>)}</ul>
                {fileErrors.length > 0 && <div role="alert" className="text-sm text-error">{fileErrors.map((error, i) => <p key={i}>{error}</p>)}</div>}
              </div>}
              {field("colours", "Any colours you want us to use? (optional)", { placeholder: "Choose for me", hint: "Leave this blank and we’ll choose a suitable starting palette." })}
              {(answers.industry === "food" || answers.industry === "beauty") && <>
                {field("address", "Public business address (optional)", { autoComplete: "street-address", hint: "Only add an address you want customers to see." })}
                {field("hours", "Opening hours (optional)", { placeholder: "For example: Tuesday–Saturday, 9am–6pm" })}
              </>}
              {answers.industry === "food" && field("menuUrl", "Link to your menu (optional)", { type: "url", hint: billing ? "You can send us a PDF when we contact you about your website." : "You can also select a PDF above." })}
              {textarea("notes", "Anything else we should know? (optional)", { placeholder: "A particular style you like, a key message, or anything we should avoid." })}
                </div>
              </details>
            </>}
            {step === "quote" && <>
              <div className={styles.notice}><strong>Your additional requirements</strong><p>{scopes.find((s) => s.value === answers.scope)?.label}</p></div>
              <div className={styles.contactSummary}><div><strong>{answers.businessName}</strong><p>{answers.name} · {answers.email}</p></div><button type="button" className={styles.textButton} onClick={() => go("business")} data-analytics-id="Edit account details">Edit details</button></div>
              {textarea("quoteDetails", answers.scope === "custom" ? "Briefly describe the extra pages or features" : "Tell us a little more (optional)", { required: answers.scope === "custom", placeholder: "What would you like customers to be able to do?" })}
              {field("phone", "Phone number (optional)", { type: "tel", autoComplete: "tel" })}
            </>}
            <div aria-live="polite">{Object.keys(errors).length > 0 && <FormStatus tone="error">Check the highlighted answers before continuing.</FormStatus>}</div>
            <div className={styles.actions}>
              {step !== "business" && <Button data-analytics-id="Previous signup step" variant="ghost" onClick={back}><Icon name="arrow" className="rotate-180" size={16} aria-hidden />Back</Button>}
              {!(billing && step === "checkout" && !billingOrder?.checkoutConfirmed) && <Button data-analytics-id={step === "business" ? "Continue to checkout" : step === "brief" ? "Submit website brief" : "Continue signup"} type="submit" size="lg" className={styles.continue} disabled={!loaded || billingBusy || pollTrial}>
                {billingBusy ? "Saving…" : step === "business" ? "Continue" : step === "checkout" ? billing ? "Continue to website details" : "Preview trial & continue" : step === "quote" ? billing ? "Request a custom quote" : "Preview my quote request" : "Submit"}
                <Icon name="arrow" size={17} aria-hidden />
              </Button>}
            </div>
            </fieldset>
          </form>}
          {loaded && complete && <div className={styles.completion}>
            {!quote && <div className={styles.deliveryNotice}>
              <h3>Keep an eye on your email and WhatsApp.</h3>
              <p>We’ll email your website to you and send it on WhatsApp. Reply with any edits, and we’ll keep refining it until you’re 100% satisfied.</p>
              <dl className={styles.review}>
                <div><dt><Icon name="mail" size={17} aria-hidden />Email</dt><dd>{answers.email}</dd></div>
                <div><dt><Icon name="whatsapp" size={17} aria-hidden />WhatsApp</dt><dd>{answers.deliveryPhone}</dd></div>
              </dl>
              {!billing && <button type="button" className={styles.textButton} onClick={() => go("business")}>Edit contact details</button>}
            </div>}
            {billing ? <div className={styles.notice}><strong>Your website brief has been received.</strong><p>WebM8 will use the email address and WhatsApp number above to deliver your website and discuss edits. To correct your contact details, contact WebM8.</p></div> : <div className={styles.notice}><strong>{quote ? "Preview complete — nothing has been sent." : "Preview only — no request has been sent."}</strong><p>{quote ? "Review your details below. No order, payment, email or quote request has been created." : "This shows the success screen for a real submission. Website delivery, email and WhatsApp messages aren’t active in this preview."}</p></div>}
            <details className={styles.optionalDetails}>
            <summary data-analytics-id="Open optional details">Review your details</summary>
            <dl className={styles.review}>
              <div><dt>Business</dt><dd>{answers.businessName}</dd></div>
              {!quote && <div><dt>Service area</dt><dd>{answers.area}</dd></div>}
              <div><dt>Account contact</dt><dd>{answers.name}<br />{answers.email}<br />{answers.deliveryPhone}</dd></div>
              {answers.features.length > 0 && <div><dt>Website requirements</dt><dd>{features.filter((f) => answers.features.includes(f.value)).map((f) => f.label).join(" · ")}</dd></div>}
              {quote ? <div><dt>Extra details</dt><dd>{answers.quoteDetails || "Online sales, ordering or payments"}</dd></div> : <>
                <div><dt>Main services</dt><dd>{answers.services}</dd></div>
                <div><dt>Customer contact</dt><dd>{contactMethods.filter((c) => answers.contacts.includes(c.value)).map((c) => c.label).join(" · ")}{needsEmail && <><br />{answers.enquiryEmail}</>}{answers.contacts.includes("phone") && <><br />{answers.phone}</>}{answers.contacts.includes("booking") && answers.bookingLater && <><br />Booking-request form until your link is ready</>}</dd></div>
                <div><dt>Design direction</dt><dd>{answers.colours || "WebM8 to choose a starting palette"}</dd></div>
                <div><dt>Files</dt><dd>{files.length ? `${files.length} selected locally; not uploaded` : "No files selected — these can be added later"}</dd></div>
              </>}
            </dl>
            </details>
          </div>}

        </div>
        <InstantSummary answers={answers} quote={quote} />
      </div>
    </section>
  );
}
