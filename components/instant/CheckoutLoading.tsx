import styles from "./instant.module.css";

export function CheckoutLoading() {
  return (
    <div className={styles.checkoutLoading} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.checkoutSpinner} aria-hidden="true" />
      <strong>Loading secure checkout…</strong>
      <p>Please wait while we prepare your payment form.</p>
    </div>
  );
}
