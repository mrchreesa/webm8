import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Eyebrow } from "@/components/ui/Eyebrow";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
}: PageHeroProps) {
  const alignCls =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <section className="relative overflow-hidden pt-20 md:pt-28">
      <AmbientBlobs variant="light" />
      <div className="container-page">
        <div className={alignCls}>
          {eyebrow && (
            <Eyebrow className="animate-rise mb-4">{eyebrow}</Eyebrow>
          )}
          <h1
            className={cn(
              "text-4xl font-bold leading-[1.08] tracking-tight text-ink md:text-6xl",
              "animate-rise",
            )}
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="animate-rise mt-5 text-lg leading-relaxed text-muted md:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              {subtitle}
            </p>
          )}
          {children && (
            <div
              className="animate-rise mt-8"
              style={{ animationDelay: "240ms" }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
