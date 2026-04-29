export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, boolean | null | undefined>
  | ClassValue[];

function push(out: string[], value: ClassValue) {
  if (!value) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) push(out, v);
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) if (v) out.push(k);
  }
}

export function cn(...parts: ClassValue[]): string {
  const out: string[] = [];
  for (const p of parts) push(out, p);
  return out.join(" ");
}
