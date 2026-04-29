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
      {variant === "light" && (
        <>
          <div className="animate-drift-slow absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-3xl" />
          <div className="animate-drift-slow-alt absolute -right-20 top-40 h-[380px] w-[380px] rounded-full bg-accent/10 blur-3xl" />
        </>
      )}
      {variant === "brand" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-[#1e3a8a]" />
          <div className="animate-drift-slow absolute -left-24 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-drift-slow-alt absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        </>
      )}
      {variant === "dark" && (
        <>
          <div className="animate-drift-slow absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/40 blur-3xl" />
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
                ? "radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)"
                : "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      )}
    </div>
  );
}
