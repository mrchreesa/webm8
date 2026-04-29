import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

type Tone = "default" | "surface" | "dark" | "tint";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  align?: "left" | "center";
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  default: "bg-bg text-ink",
  surface: "bg-surface text-ink",
  dark: "bg-ink text-white",
  tint: "bg-gradient-to-b from-surface to-bg text-ink",
};

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  innerClassName,
  align = "left",
  tone = "default",
}: SectionProps) {
  const alignCls =
    align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl";

  const hasHeader = Boolean(eyebrow || title || subtitle);

  return (
    <section
      id={id}
      className={cn("relative py-20 md:py-28", tones[tone], className)}
    >
      <div className={cn("container-page", innerClassName)}>
        {hasHeader && (
          <Reveal as="header" className={cn("mb-12 md:mb-16", alignCls)}>
            {eyebrow && (
              <Eyebrow
                tone={tone === "dark" ? "invert" : "brand"}
                className="mb-4"
              >
                {eyebrow}
              </Eyebrow>
            )}
            {title && (
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight md:text-5xl",
                  tone === "dark" ? "text-white" : "text-ink",
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "mt-5 text-lg leading-relaxed md:text-xl",
                  tone === "dark" ? "text-white/70" : "text-muted",
                )}
              >
                {subtitle}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
