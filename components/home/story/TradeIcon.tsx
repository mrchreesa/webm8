import type { ReactNode } from "react";
import type { TradeKey } from "@/lib/trades";

const PATHS: Record<TradeKey, ReactNode> = {
  cleaning: (<><path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>),
  hvac: (<><path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18" /><path d="m9 4 3 2 3-2M9 20l3-2 3 2" /></>),
  plumbing: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  electrical: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  roofing: (<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  landscaping: (<><path d="M12 22V12" /><path d="M12 12c0-5 4-8 9-8 0 5-4 8-9 8z" /><path d="M12 15c0-4-3-6-8-6 0 4 3 6 8 6z" /></>),
  moving: (<><path d="M2 7h12v10H2zM14 10h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>),
  restaurant: (<><path d="M7 2v9M4 2v5a3 3 0 0 0 6 0V2M7 11v11" /><path d="M17 2c-2 1-3 4-3 8h3v12" /></>),
  cafe: (<><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 2.5c-.6 1 .6 2-.2 3M12 2.5c-.6 1 .6 2-.2 3" /></>),
  salon: (<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></>),
  barber: (<><rect x="8" y="3" width="8" height="18" rx="2" /><path d="m8 7 8 4M8 12l8 4M8 17l4 2" /></>),
  medspa: (<><circle cx="12" cy="12" r="3" /><path d="M12 2c2 3 2 4 0 7-2-3-2-4 0-7zM12 15c2 3 2 4 0 7-2-3-2-4 0-7zM2 12c3-2 4-2 7 0-3 2-4 2-7 0zM15 12c3-2 4-2 7 0-3 2-4 2-7 0z" /></>),
  dental: <path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7 .5 3 1 6.5 2.5 6.5S9.5 17 12 17s3 4 4.5 4 2-3.5 2.5-6.5c.5-2.5 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />,
  fitness: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />,
  other: (<><path d="M3 21h18M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></>),
};

export function TradeIcon({ trade, className, strokeWidth = 1.8 }: { trade: TradeKey; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[trade]}
    </svg>
  );
}
