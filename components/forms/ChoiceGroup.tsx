"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

type Option = { value: string; label: string; hint?: string; icon?: IconName };

/** Native radios/checkboxes keep platform keyboard and label behaviour. */
export function ChoiceGroup({ name, label, hint, options, values, multiple = false, compact = false, presentation = "cards", error, onChange, analyticsField }: {
  name: string; label: string; hint?: string; options: readonly Option[]; values: readonly string[];
  multiple?: boolean; compact?: boolean; error?: string; onChange: (values: string[]) => void;
  presentation?: "cards" | "chips";
  analyticsField?: string;
}) {
  const id = useId();
  const chips = presentation === "chips";
  return (
    <fieldset aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      {hint && <p id={`${id}-hint`} className="mb-3 text-sm leading-relaxed text-muted">{hint}</p>}
      <div className={compact || chips ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <label key={option.value} data-analytics-id={analyticsField ? `Choose ${analyticsField.replaceAll("_", " ")}` : undefined} className={cn(
              "relative flex cursor-pointer border transition-colors active:scale-[.98] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
              chips ? "min-h-11 items-center gap-2 rounded-full px-4 py-2.5" : "min-h-12 items-start gap-3 rounded-xl px-4 py-3",
              selected ? chips ? "border-ink bg-ink text-white" : "border-ink bg-ink/5" : "border-border bg-white hover:border-ink/40",
              compact && "items-center",
            )}>
              <input
                type={multiple ? "checkbox" : "radio"} name={name} value={option.value} checked={selected}
                data-analytics-field={analyticsField}
                aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
                className={chips ? "sr-only" : "mt-0.5 h-4 w-4 shrink-0 accent-ink"}
                onChange={() => onChange(multiple ? selected ? values.filter((v) => v !== option.value) : [...values, option.value] : [option.value])}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-snug">
                  {option.icon && <Icon name={option.icon} size={16} aria-hidden className={cn("shrink-0", chips && selected ? "text-brand" : "text-muted")} />}
                  {option.label}
                </span>
                {option.hint && <span className={cn("mt-1 block text-xs leading-relaxed", chips && selected ? "text-muted-invert" : "text-muted")}>{option.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-error">{error}</p>}
    </fieldset>
  );
}
