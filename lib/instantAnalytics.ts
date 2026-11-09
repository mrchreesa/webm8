export type InstantFormAction = "start" | "step_view" | "step_complete" | "submit" | "success" | "validation_error" | "submission_error";
export type InstantAction = "checkout_ready" | "trial_confirmation_attempted" | "trial_confirmed" | "trial_status_retry";
type Options = { step: number; steps: number; code?: "invalid" | "network" | "server" | "checkout" };
type Tracker = { form(name: string, action: InstantFormAction, options: Options): boolean; track(name: string): boolean };
type Event = { action: InstantFormAction; options: Options } | { name: InstantAction };

/** Fixed event vocabulary only. Never accepts answers, identifiers or error text. */
export function createInstantAnalytics(enabled: () => boolean, tracker: () => Tracker | undefined) {
  const queue: Event[] = [];
  function send(event: Event) {
    if (!enabled()) return;
    const api = tracker();
    if (!api) { if (queue.length < 40) queue.push(event); return; }
    try {
      if ("name" in event) api.track(`instant_${event.name}`);
      else api.form("instant_website", event.action, event.options);
    } catch { /* Measurement must never block signup, payment or delivery. */ }
  }
  return {
    form(action: InstantFormAction, step: number, code?: Options["code"]) {
      if (![1, 2, 3].includes(step)) return;
      send({ action, options: { step, steps: 3, ...(code ? { code } : {}) } });
    },
    action(name: InstantAction) { send({ name }); },
    flush() {
      if (!enabled()) { queue.length = 0; return; }
      if (!tracker()) return;
      const pending = queue.splice(0);
      pending.forEach(send);
    },
    clear() { queue.length = 0; },
  };
}
