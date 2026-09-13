import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const fieldBase = cn(
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-ink",
  "shadow-[0_1px_2px_rgb(7_26_51/0.03)] transition-colors placeholder:text-muted/70",
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
  "disabled:cursor-not-allowed disabled:bg-bg-alt disabled:text-muted/60",
);

const labelCls =
  "font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted";

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "url" | "tel";
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  /** Validation message. Shown below the field and linked with aria-describedby. */
  error?: string;
  /** Extra guidance shown below the field when there is no error. */
  hint?: string;
  disabled?: boolean;
  inputMode?: "text" | "email" | "tel" | "url";
  labelClassName?: string;
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
  error,
  hint,
  disabled,
  inputMode,
  labelClassName,
}: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;

  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className={cn(labelCls, labelClassName)}>
        {label}
        {required && (
          <span className="ml-1 text-brand" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(fieldBase, error && "border-rose-400 focus:border-rose-500")}
      />
      {message && (
        <p
          id={messageId}
          className={cn("text-xs leading-relaxed", error ? "text-rose-600" : "text-muted")}
        >
          {message}
        </p>
      )}
    </div>
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
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && (
          <span className="ml-1 text-brand" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(fieldBase, "resize-y")}
      />
    </div>
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
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && (
          <span className="ml-1 text-brand" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={id}
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
    </div>
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
        "text-sm transition-colors",
        tone === "error" && "text-error",
        tone === "success" && "text-accent",
        tone === "neutral" && "text-muted",
      )}
    >
      {children}
    </p>
  );
}
