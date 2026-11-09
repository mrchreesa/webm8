"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js/pure";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/forms/FormField";
import { CheckoutLoading } from "./CheckoutLoading";
import styles from "./instant.module.css";
import type { createInstantAnalytics } from "@/lib/instantAnalytics";

type PaymentActions = { analytics: ReturnType<typeof createInstantAnalytics>; onBeforeConfirm: () => Promise<void>; onConfirmed: () => void; onBusy: (busy: boolean) => void };

export function InstantPayment({ clientSecret, publishableKey, ...actions }: PaymentActions & { clientSecret: string; publishableKey: string }) {
  const stripe = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  // Appearance values mirror DESIGN.md and the canonical runtime tokens.
  const options = useMemo(() => ({ clientSecret, elementsOptions: { appearance: {
    theme: "stripe" as const,
    variables: { colorPrimary: "#0e2f56", colorBackground: "#ffffff", colorText: "#0e2f56", colorTextSecondary: "#5b6b7e", colorDanger: "#db2424", borderRadius: "12px", fontFamily: "system-ui, sans-serif", fontSizeBase: "16px", spacingUnit: "4px" },
    rules: { ".Input": { borderColor: "#ddd6ca", boxShadow: "none", padding: "12px" }, ".Input:focus": { borderColor: "#0e2f56", boxShadow: "0 0 0 2px #0e2f5626" }, ".Label": { fontWeight: "600", fontSize: "14px" } },
  } } }), [clientSecret]);
  return <CheckoutElementsProvider stripe={stripe} options={options}><PaymentFields {...actions} /></CheckoutElementsProvider>;
}

function PaymentFields({ analytics, onBeforeConfirm, onConfirmed, onBusy }: PaymentActions) {
  const state = useCheckoutElements();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const locked = useRef(false);
  const priceMatches = state.type === "success" && state.checkout.currency.toLowerCase() === "gbp" && state.checkout.total.total.minorUnitsAmount === 0 && state.checkout.recurring?.dueNext.total.minorUnitsAmount === 3900 && state.checkout.recurring?.trial?.trialPeriodDays === 10;
  useEffect(() => {
    if (state.type === "error" || (state.type === "success" && !priceMatches)) analytics.form("submission_error", 2, "checkout");
  }, [state.type, priceMatches, analytics]);
  async function confirm() {
    if (state.type !== "success" || !priceMatches || locked.current) return;
    locked.current = true; setBusy(true); onBusy(true); setMessage("");
    analytics.action("trial_confirmation_attempted");
    try {
      await onBeforeConfirm();
      const result = await state.checkout.confirm({ redirect: "if_required" });
      if (result.type === "error") { analytics.form("submission_error", 2, "checkout"); setMessage(result.error.message); }
      else onConfirmed();
    } catch (error) { analytics.form("submission_error", 2, "checkout"); setMessage(error instanceof Error && error.name === "Error" ? error.message : "We couldn’t confirm your trial. Check your connection, then refresh this page to check your trial before retrying."); }
    finally { locked.current = false; setBusy(false); onBusy(false); }
  }
  if (state.type === "loading") return <CheckoutLoading />;
  if (state.type === "error" || loadFailed) return <FormStatus tone="error">The secure payment form could not load. Reload this page to try again. Your saved details will be kept.</FormStatus>;
  if (!priceMatches) return <FormStatus tone="error">The payment details don’t match the £0 trial and £39 monthly plan. Please contact WebM8 before continuing.</FormStatus>;
  return <div className={styles.paymentFields} aria-busy={busy}>
    <div className={styles.paymentElement} data-analytics-ignore>
      {!ready && <div className={styles.checkoutLoadingOverlay}><CheckoutLoading /></div>}
      <div className={styles.paymentElementContent} data-ready={ready} aria-hidden={!ready} inert={!ready}>
        <PaymentElement options={{ layout: { type: "accordion", defaultCollapsed: false }, paymentMethodOrder: ["card"], readOnly: busy }} onReady={() => { if (!ready) analytics.action("checkout_ready"); setReady(true); }} onLoadError={() => { analytics.form("submission_error", 2, "checkout"); setLoadFailed(true); }} />
      </div>
    </div>
    <p className={styles.hint}>Secure payment details are handled by Stripe. £0 today, then £39/month after your 10-day trial.</p>
    <div aria-live="polite">{message && <FormStatus tone="error">{message}</FormStatus>}</div>
    <Button data-analytics-id="Start free trial" size="lg" className={styles.continue} disabled={busy || !ready} onClick={confirm}>{busy ? "Securing your trial…" : "Start my free trial"}</Button>
  </div>;
}
