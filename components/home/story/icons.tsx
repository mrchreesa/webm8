/** Small decorative icons used inside the story's phone. */

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = () => (
  <svg {...common} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const TrendIcon = () => (
  <svg {...common} strokeWidth={2.2}><path d="M3 17l6-6 4 4 8-8" /></svg>
);
export const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg {...common} strokeWidth={2.4} className={className}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg {...common} strokeWidth={2.4} width={18} height={18} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const PhoneIcon = () => (
  <svg {...common} strokeWidth={2.2}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
);
export const CheckIcon = () => (
  <svg {...common} strokeWidth={3}><path d="m5 12 5 5L20 7" /></svg>
);
export const GlobeIcon = () => (
  <svg {...common} strokeWidth={2.4}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
);
export const MailIcon = () => (
  <svg {...common} strokeWidth={2.4}><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
);
export const SignalIcon = () => (
  <svg viewBox="0 0 64 14" fill="currentColor" aria-hidden="true">
    <rect x="0" y="8" width="3" height="6" rx="1" /><rect x="5" y="5" width="3" height="9" rx="1" /><rect x="10" y="2" width="3" height="12" rx="1" /><rect x="15" y="0" width="3" height="14" rx="1" opacity=".35" />
    <rect x="36" y="1" width="24" height="12" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><rect x="38" y="3" width="16" height="8" rx="2" />
  </svg>
);
