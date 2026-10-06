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

    // On /demo/ the form is already on the page, so the button goes to it.
    // The next frame lets the mobile menu close first, so the scroll lands.
    const journey = document.getElementById("demo-journey");
    if (!journey) return;
    event.preventDefault();
    window.requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      journey.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
      journey.querySelector<HTMLElement>("[data-demo-legend]")?.focus({ preventScroll: true });
    });
  }

  return (
    <LinkButton href="/demo/" onClick={handleClick} {...props}>
      {children}
    </LinkButton>
  );
}
