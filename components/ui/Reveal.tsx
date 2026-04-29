"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

type RevealVariant = "fade-up" | "fade" | "slide-left" | "slide-right" | "zoom";

type RevealProps = {
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
  children: ReactNode;
};

export function Reveal({
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  once = true,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.state = "in";
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      el.dataset.state = "in";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.state = "in";
            if (once) io.disconnect();
          } else if (!once) {
            delete el.dataset.state;
          }
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
