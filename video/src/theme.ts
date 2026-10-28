/** The site's tokens, copied from app/globals.css (@theme). Change them there first. */
export const color = {
  ink: "#0e2f56",
  inkDeep: "#071a33",
  inkRaised: "#1b4a80",
  night: "#061429",
  mutedInvert: "#9db4cd",
  brand: "#d4ff35",
  brandInk: "#071a33",
  electric: "#2b6cfc",
  white: "#ffffff",
} as const;

export const font = {
  display: "Funnel Display",
  sans: "Geist",
} as const;

/** The navy ground every beat except the neon flashes sits on. */
export const navyGround = `radial-gradient(120% 90% at 70% 20%, #154a8a 0%, ${color.ink} 38%, ${color.night} 100%)`;
