export function buildMailtoHref(
  to: string,
  subject: string,
  fields: Record<string, string>,
): string {
  const body = Object.entries(fields)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const query = new URLSearchParams({ subject, body }).toString();
  return `mailto:${to}?${query}`;
}
