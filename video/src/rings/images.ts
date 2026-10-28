import dpsGasworks from "../../../public/work/dps-gasworks-phone.webp";
import removals from "../../../public/work/removals-phone.webp";
import solversCleaning from "../../../public/work/solvers-cleaning-phone.webp";

/** The site's own tall phone captures (public/work/), by project slug. */
const phoneCaptures: Record<string, string> = {
  "dps-gasworks": dpsGasworks,
  "solvers-cleaning": solversCleaning,
  removals,
};

export function phoneCaptureOf(project: string): string {
  const url = phoneCaptures[project];
  if (!url) throw new Error(`No phone capture imported for "${project}" in src/rings/images.ts`);
  return url;
}
