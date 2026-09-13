import { cn } from "@/lib/cn";

type AmbientBlobsProps = {
  variant?: "light" | "brand" | "dark";
  dotted?: boolean;
  className?: string;
};

export function AmbientBlobs({
  variant = "light",
  dotted = true,
  className,
}: AmbientBlobsProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Orange is reserved for things that act, so it never fills a field
          here — the saturated panels are navy and the glows are teal. */}
      {variant === "light" && (
        <>
          <div className="animate-drift-slow absolute -left-40 top-0 h-[560px] w-[560px] rounded-full bg-ink/10 blur-3xl" />
          <div className="animate-drift-slow-alt absolute -right-20 top-40 h-[500px] w-[500px] rounded-full bg-info/20 blur-3xl" />
        </>
      )}
      {variant === "brand" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-ink-raised via-ink to-ink-deep" />
          <div className="animate-drift-slow absolute -left-24 top-0 h-96 w-96 rounded-full bg-info/25 blur-3xl" />
          <div className="animate-drift-slow-alt absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-signal/25 blur-3xl" />
        </>
      )}
      {variant === "dark" && (
        <>
          <div className="animate-drift-slow absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-ink-raised/70 blur-3xl" />
          <div className="animate-drift-slow-alt absolute right-0 bottom-0 h-80 w-80 rounded-full bg-signal/20 blur-3xl" />
        </>
      )}

      {dotted && (
        <div
          className={cn(
            "absolute inset-0",
            variant === "light" ? "opacity-[0.04]" : "opacity-[0.1]",
          )}
          style={{
            backgroundImage:
              variant === "light"
                ? "radial-gradient(circle at 1px 1px, #0E2F56 1px, transparent 0)"
                : "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      )}
    </div>
  );
}
