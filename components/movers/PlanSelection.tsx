"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BillingCycle, MoverPlanId } from "@/lib/movers";

type PlanSelection = {
  /** Null until the visitor picks a plan. The form treats it as optional context. */
  plan: MoverPlanId | null;
  billing: BillingCycle;
  setPlan: (plan: MoverPlanId | null) => void;
  setBilling: (billing: BillingCycle) => void;
  /** Pick a plan and jump to the request form in one action. */
  chooseAndRequest: (plan: MoverPlanId) => void;
};

const PlanSelectionContext = createContext<PlanSelection | null>(null);

export function PlanSelectionProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<MoverPlanId | null>(null);
  // Monthly is the default: it is the lower commitment and the honest starting
  // point. Annual is opt-in.
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const chooseAndRequest = useCallback((next: MoverPlanId) => {
    setPlan(next);
    const target = document.getElementById("review-request");
    if (!target) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const value = useMemo(
    () => ({ plan, billing, setPlan, setBilling, chooseAndRequest }),
    [plan, billing, chooseAndRequest],
  );

  return (
    <PlanSelectionContext.Provider value={value}>
      {children}
    </PlanSelectionContext.Provider>
  );
}

export function usePlanSelection() {
  const context = useContext(PlanSelectionContext);
  if (!context) {
    throw new Error("usePlanSelection must be used inside PlanSelectionProvider");
  }
  return context;
}
