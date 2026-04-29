import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "accent" | "ink" | "invert";

const tones: Record<Tone, string> = {
  brand: "text-brand",
  accent: "text-accent",
  ink: "text-ink",
  invert: "text-white/80",
};

type EyebrowProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export function Eyebrow({
  tone = "brand",
  children,
  className,
  as: Tag = "p",
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      <span
        className={cn(
          "h-px w-6",
          tone === "brand" && "bg-brand/40",
          tone === "accent" && "bg-accent/50",
          tone === "ink" && "bg-ink/30",
          tone === "invert" && "bg-white/40",
        )}
      />
      {children}
    </Tag>
  );
}
