import Link from "next/link";
import { whatYouGet, type WebsiteFeatureGroup } from "@/lib/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { IncludedVisual } from "@/components/home/IncludedVisuals";

const cardStyles: Record<
  WebsiteFeatureGroup["id"],
  { surface: string; accent: string; check: string }
> = {
  design: {
    surface: "border-border/70 bg-bg",
    accent: "text-ink-raised",
    check: "bg-ink-raised/10 text-ink-raised ring-ink-raised/10",
  },
  visibility: {
    surface: "border-info-ink/15 bg-[#eff7f5]",
    accent: "text-info-ink",
    check: "bg-info-ink/10 text-info-ink ring-info-ink/10",
  },
  enquiries: {
    surface: "border-ink/10 bg-[#f0f4fa]",
    accent: "text-brand",
    check: "bg-brand/10 text-brand ring-brand/10",
  },
  care: {
    surface: "border-ink bg-ink text-white",
    accent: "text-info",
    check: "bg-info/15 text-info ring-info/20",
  },
};

export function WhatYouGet() {
  return (
    <section
      id="included"
      aria-labelledby="included-heading"
      className="scroll-mt-20 border-b border-border/70 bg-white py-16 md:py-24"
    >
      <div className="container-page">
        <Reveal
          as="header"
          className="mb-10 grid gap-5 md:mb-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16"
        >
          <div>
            <Eyebrow>What&apos;s included</Eyebrow>
            <h2
              id="included-heading"
              className="mt-5 text-[2.125rem] font-bold leading-[1.12] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]"
            >
              Everything you need.
              <span className="block text-muted">All taken care of.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted md:text-lg lg:pb-1">
            From the first impression to the everyday upkeep, we handle the
            details that help your business get found, earn trust, and bring in
            more customers.
          </p>
        </Reveal>

        <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
          {whatYouGet.map((group, index) => (
            <FeatureCard key={group.id} group={group} index={index} />
          ))}
        </div>

        <Reveal className="mt-8 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-10">
          <p className="text-sm leading-relaxed text-muted md:text-base">
            <span className="font-semibold text-ink">One team, from launch onward.</span>{" "}
            Find the right plan for your business.
          </p>
          <Link
            href="/pricing/"
            className="btn-arrow inline-flex min-h-11 w-fit shrink-0 items-center gap-3 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-bg"
          >
            Explore the plans
            <Icon name="arrow" size={17} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureCard({
  group,
  index,
}: {
  group: WebsiteFeatureGroup;
  index: number;
}) {
  const isCare = group.id === "care";
  const style = cardStyles[group.id];

  return (
    <Reveal delay={index * 70} className="h-full min-w-0">
      <article
        aria-labelledby={`included-${group.id}`}
        className={cn(
          "@container group/card h-full overflow-hidden rounded-3xl border text-ink transition-shadow duration-300 hover:shadow-card-hover",
          style.surface,
        )}
      >
        <div className="grid h-full items-center gap-6 p-6 @min-[520px]:min-h-[420px] @min-[520px]:grid-cols-[1fr_0.95fr] @min-[520px]:gap-3 @min-[520px]:p-8">
          <div className="relative z-10 self-start">
            <p className={cn(
              "flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
              isCare ? "text-muted-invert" : "text-muted",
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", isCare ? "bg-info" : "bg-current")} aria-hidden="true" />
              {group.label}
            </p>
            <h3
              id={`included-${group.id}`}
              className="mt-5 text-[1.875rem] font-bold leading-[1.12] tracking-tight @min-[560px]:text-[2rem]"
            >
              {group.title}{" "}
              <span className={cn("block", style.accent)}>{group.highlight}</span>
            </h3>
            <ul className="mt-6 space-y-3.5">
              {group.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[15px] font-medium leading-6"
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                      style.check,
                    )}
                    aria-hidden="true"
                  >
                    <Icon name="check" size={14} strokeWidth={2.5} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <IncludedVisual id={group.id} />
        </div>
      </article>
    </Reveal>
  );
}
