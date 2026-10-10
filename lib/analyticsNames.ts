/** For reviewed, public website copy only. Never pass form answers or visitor data. */
export function analyticsName(publicName: string): string {
  return publicName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ").replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9 ./_-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 48).trim();
}
