"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { LinkButton, type LinkButtonProps } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

export type DemoCtaPlacement = "header" | "hero" | "closing";

type DemoCtaButtonProps = Omit<LinkButtonProps, "href"> & { placement: DemoCtaPlacement };

export function DemoCtaButton({ placement, onClick, children, ...props }: DemoCtaButtonProps) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    trackEvent("demo_cta_clicked", { placement, page: pathname ?? "/" });

    // On /free-demo/ the form is already on the page, so the button goes to it.
    // The next frame lets the mobile menu close first, so the scroll lands.
    const form = document.getElementById("demo-request");
    if (!form) return;
    event.preventDefault();
    window.requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      form.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
      form.querySelector<HTMLElement>("[data-demo-focus]")?.focus({ preventScroll: true });
    });
  }

  return (
    <LinkButton data-analytics-id="Get my free demo" href="/free-demo/" onClick={handleClick} {...props}>
      {children}
    </LinkButton>
  );
}
