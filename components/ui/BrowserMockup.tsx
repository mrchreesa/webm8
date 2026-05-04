import Image from "next/image";
import type { Project } from "@/lib/site";
import { cn } from "@/lib/cn";

type BrowserMockupProps = {
  palette?: Project["palette"];
  title?: string;
  industry?: string;
  siteUrl?: string;
  screenshots?: Project["screenshots"];
  compact?: boolean;
  className?: string;
};

const palettes: Record<
  NonNullable<BrowserMockupProps["palette"]>,
  { from: string; to: string; accent: string; tag: string }
> = {
  blue: {
    from: "from-blue-500/90",
    to: "to-blue-700",
    accent: "bg-blue-500",
    tag: "text-blue-700 bg-blue-50",
  },
  green: {
    from: "from-emerald-500/90",
    to: "to-emerald-700",
    accent: "bg-emerald-500",
    tag: "text-emerald-700 bg-emerald-50",
  },
  slate: {
    from: "from-slate-500/90",
    to: "to-slate-800",
    accent: "bg-slate-500",
    tag: "text-slate-700 bg-slate-100",
  },
  amber: {
    from: "from-amber-400/90",
    to: "to-amber-600",
    accent: "bg-amber-500",
    tag: "text-amber-800 bg-amber-50",
  },
  rose: {
    from: "from-rose-400/90",
    to: "to-rose-600",
    accent: "bg-rose-500",
    tag: "text-rose-700 bg-rose-50",
  },
  violet: {
    from: "from-violet-500/90",
    to: "to-violet-700",
    accent: "bg-violet-500",
    tag: "text-violet-700 bg-violet-50",
  },
};

export function BrowserMockup({
  palette = "blue",
  title = "Local Business Website",
  industry = "Local Business",
  siteUrl,
  screenshots,
  compact = false,
  className,
}: BrowserMockupProps) {
  const p = palettes[palette];

  if (screenshots) {
    const displayUrl = formatDisplayUrl(siteUrl, industry);

    return (
      <div
        className={cn(
          "group/mockup relative isolate mx-auto w-full",
          compact ? "pb-8" : "pb-12",
          className,
        )}
      >
        <div className="overflow-hidden rounded-[22px] border border-white/75 bg-white shadow-card-hover ring-1 ring-ink/10">
          <div className="flex items-center gap-1.5 border-b border-border bg-slate-100 px-3 py-2 md:gap-2 md:px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
            <div className="ml-2 min-w-0 flex-1">
              <div className="mx-auto h-6 max-w-sm truncate rounded-md border border-border bg-white px-3 font-mono text-[10px] leading-6 text-slate-500">
                {displayUrl}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "relative overflow-hidden bg-white",
              compact ? "aspect-[16/10]" : "aspect-[16/9]",
            )}
          >
            <Image
              src={screenshots.desktop}
              alt={`${title} desktop website screenshot`}
              fill
              sizes={
                compact
                  ? "(min-width: 1024px) 28vw, (min-width: 768px) 44vw, 90vw"
                  : "(min-width: 1024px) 52vw, 90vw"
              }
              className="object-cover object-top transition-transform duration-700 ease-out group-hover/mockup:scale-[1.025]"
            />
          </div>
        </div>

        <div
          className={cn(
            "absolute z-10",
            compact
              ? "-bottom-0.5 right-3 w-[28%] min-w-20 max-w-28"
              : "-bottom-1 right-4 w-[24%] min-w-24 max-w-40 md:right-8",
          )}
        >
          <div className="rounded-[1.65rem] border border-white/15 bg-slate-950 p-1.5 shadow-[0_24px_60px_-22px_rgb(15_23_42_/_0.72)] ring-1 ring-ink/20">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.2rem] bg-white">
              <span className="absolute left-1/2 top-1.5 z-10 h-1 w-8 -translate-x-1/2 rounded-full bg-slate-950/45" />
              <Image
                src={screenshots.mobile}
                alt={`${title} mobile website screenshot`}
                fill
                sizes={compact ? "112px" : "180px"}
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute -z-10 rounded-full blur-2xl",
            p.accent,
            compact
              ? "inset-x-10 bottom-2 h-10 opacity-15"
              : "inset-x-14 bottom-2 h-14 opacity-20",
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white shadow-card-hover",
        "transition-transform duration-500 ease-out",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-border bg-slate-50/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <div className="ml-3 flex-1">
          <div className="mx-auto h-5 max-w-xs rounded-md border border-border bg-white px-3 font-mono text-[10px] leading-5 text-slate-400">
            webm8agency.com / {industry.toLowerCase().replace(/\s+/g, "-")}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative bg-gradient-to-br",
          p.from,
          p.to,
          compact ? "p-5" : "p-6 md:p-8",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
                p.tag,
              )}
            >
              {industry}
            </span>
            <h3 className="mt-3 text-lg font-bold leading-snug text-white md:text-xl">
              {title}
            </h3>
            <p className="mt-2 text-xs text-white/80">
              Trusted by local homeowners
            </p>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white md:flex">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z" />
            </svg>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <div className="h-8 flex-1 rounded-full bg-white/90" />
          <div className="h-8 w-16 rounded-full border border-white/60" />
        </div>
      </div>

      <div className={compact ? "space-y-3 p-5" : "space-y-4 p-6 md:p-8"}>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-3/5 rounded-full bg-slate-200" />
          <div className="h-2.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-2.5 w-2/5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className={cn("h-9 w-28 rounded-full", p.accent)} />
          <div className="h-9 w-24 rounded-full border border-slate-200" />
        </div>
      </div>
    </div>
  );
}

function formatDisplayUrl(siteUrl: string | undefined, industry: string) {
  if (!siteUrl) {
    return `webm8agency.com / ${industry.toLowerCase().replace(/\s+/g, "-")}`;
  }

  try {
    return new URL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    return siteUrl;
  }
}
