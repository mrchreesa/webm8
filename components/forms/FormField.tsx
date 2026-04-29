import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase = cn(
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink",
  "shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-colors placeholder:text-slate-400",
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
);

const labelCls = "font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted";

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "url" | "tel";
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
  defaultValue?: string;
  autoComplete?: string;
};

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  wide,
  defaultValue,
  autoComplete,
}: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <span className={labelCls}>
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={fieldBase}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  placeholder,
  required,
  rows = 4,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 sm:col-span-2">
      <span className={labelCls}>
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(fieldBase, "resize-y")}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
  wide,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: string;
  wide?: boolean;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <span className={labelCls}>
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={fieldBase}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormStatus({
  tone,
  children,
}: {
  tone: "neutral" | "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-xs transition-colors",
        tone === "error" && "text-rose-600",
        tone === "success" && "text-emerald-600",
        tone === "neutral" && "text-muted",
      )}
    >
      {children}
    </p>
  );
}
