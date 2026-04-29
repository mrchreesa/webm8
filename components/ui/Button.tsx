import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "dark" | "outline-invert";
type Size = "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

const base = cn(
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight",
  "transition-all duration-200 select-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60",
);

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-brand text-white shadow-cta",
    "btn-shine btn-arrow",
    "hover:bg-brand-hover hover:-translate-y-0.5 active:translate-y-0",
  ),
  ghost: cn(
    "border border-border bg-white text-ink",
    "hover:border-ink/25 hover:bg-ink/5",
    "btn-arrow",
  ),
  dark: "bg-white text-ink hover:bg-white/90 btn-arrow",
  "outline-invert": cn(
    "border border-white/25 bg-transparent text-white",
    "hover:bg-white/10 hover:border-white/40",
    "btn-arrow",
  ),
};

function classes({
  variant = "primary",
  size = "md",
  className,
}: Pick<BaseProps, "variant" | "size" | "className">) {
  return cn(base, sizes[size], variants[variant], className);
}

type LinkButtonProps = BaseProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={classes({ variant, size, className })}
      {...rest}
    >
      {children}
    </Link>
  );
}

type ButtonProps = BaseProps &
  Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
