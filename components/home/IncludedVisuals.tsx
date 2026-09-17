import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { WebsiteFeatureGroup } from "@/lib/site";

/** Decorative examples of the service, not customer results or live activity. */
export function IncludedVisual({ id }: { id: WebsiteFeatureGroup["id"] }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto h-[248px] w-full max-w-[290px] select-none"
    >
      {id === "design" && <DesignVisual />}
      {id === "visibility" && <VisibilityVisual />}
      {id === "enquiries" && <EnquiryVisual />}
      {id === "care" && <CareVisual />}
    </div>
  );
}

function DesignVisual() {
  return (
    <>
      <div className="absolute inset-5 rounded-full border border-border/70" />
      <div className="absolute inset-10 rounded-full bg-bg-alt/60" />
      <div className="absolute top-7 right-4 left-0 -rotate-3 overflow-hidden rounded-xl border border-ink/15 bg-white shadow-card-hover transition-transform duration-500 group-hover/card:rotate-0">
        <div className="flex h-6 items-center gap-1 border-b border-border/60 px-2.5">
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="ml-2 text-[8px] text-muted">Made for your business</span>
        </div>
        <Image
          src="/work/removals-desktop.webp"
          alt=""
          width={1600}
          height={900}
          sizes="290px"
          className="w-full"
        />
      </div>
      <div className="absolute top-[78px] right-0 h-[150px] w-[74px] rotate-6 overflow-hidden rounded-[16px] border-[4px] border-ink-deep bg-ink-deep shadow-card-hover transition-transform duration-500 group-hover/card:rotate-3">
        <Image
          src="/work/removals-mobile.webp"
          alt=""
          fill
          sizes="74px"
          className="rounded-[11px] object-cover object-top"
        />
        <span className="absolute top-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-ink-deep" />
      </div>
      <div className="absolute bottom-5 left-0 flex items-center gap-2 rounded-full border border-border/80 bg-white px-3 py-2.5 shadow-card">
        <Icon name="check" size={14} className="text-info-ink" />
        <span className="text-[10px] font-semibold text-ink">Every screen. Every first impression.</span>
      </div>
    </>
  );
}

function VisibilityVisual() {
  return (
    <>
      <svg className="absolute inset-0 h-full w-full text-info-ink/15" viewBox="0 0 290 248" fill="none">
        <circle cx="145" cy="124" r="100" stroke="currentColor" />
        <circle cx="145" cy="124" r="70" stroke="currentColor" strokeDasharray="3 6" />
        <path d="M145 24v200M45 124h200" stroke="currentColor" strokeDasharray="3 6" />
        <circle cx="66" cy="62" r="4" fill="currentColor" stroke="none" />
        <circle cx="230" cy="176" r="4" fill="currentColor" stroke="none" />
      </svg>
      <div className="absolute top-3 left-0 flex items-center gap-2 rounded-xl border border-info-ink/15 bg-white px-3 py-2.5 shadow-card">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-info-ink">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="m12 12 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-semibold text-ink">Local Google searches</span>
      </div>
      <div className="absolute top-[67px] left-1/2 flex -translate-x-1/2 flex-col items-center">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-[25px] border border-white/80 bg-info-ink text-white shadow-[0_12px_30px_-10px_#0a7d7a66] transition-transform duration-500 group-hover/card:-translate-y-1">
          <Icon name="map" size={34} strokeWidth={1.5} />
        </span>
        <span className="mt-3 whitespace-nowrap rounded-full border border-info-ink/10 bg-white px-4 py-1.5 text-xs font-semibold text-ink">Your business</span>
      </div>
      <div className="absolute right-0 bottom-4 flex items-center gap-2 rounded-xl border border-info-ink/15 bg-white px-3 py-2.5 shadow-card">
        <Icon name="spark" size={14} className="text-info-ink" />
        <span className="text-[11px] font-semibold text-ink">AI search & discovery</span>
      </div>
    </>
  );
}

function EnquiryVisual() {
  return (
    <>
      <div className="absolute top-4 right-4 left-4 h-36 -rotate-6 rounded-2xl border border-ink/10 bg-white/60" />
      <div className="absolute top-5 right-1 left-1 rounded-2xl border border-ink/10 bg-white p-4 shadow-card-hover transition-transform duration-500 group-hover/card:-translate-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Example enquiry</span>
          <span className="rounded-full bg-info-ink/10 px-2 py-1 text-[9px] font-semibold text-info-ink">New</span>
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg text-brand">
            <Icon name="mail" size={18} strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">“Can I get a quote?”</p>
            <p className="mt-0.5 text-[10px] text-muted">Sent through your website</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-[10px] text-muted">
          <Icon name="chart" size={12} />
          Source: website contact form
        </div>
      </div>
      <div className="absolute bottom-[48px] left-8 h-5 border-l border-dashed border-info-ink/40" />
      <div className="absolute right-0 bottom-1 left-5 flex items-center gap-2.5 rounded-xl border border-info-ink/15 bg-white px-3 py-3 shadow-card">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info-ink/10 text-info-ink">
          <Icon name="check" size={14} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-ink">Confirmation sent</p>
          <p className="mt-0.5 text-[10px] text-muted">A clear next step for your customer.</p>
        </div>
      </div>
    </>
  );
}

function CareVisual() {
  return (
    <>
      <div className="absolute inset-3 rounded-full border border-white/10" />
      <div className="absolute inset-10 rounded-full border border-info/20 bg-info/5" />
      <div className="absolute top-[66px] left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-[30px] border border-info/30 bg-ink-deep text-info shadow-[0_0_48px_-12px_#2bc4bd55] transition-transform duration-500 group-hover/card:-translate-y-1">
        <Icon name="shield" size={44} strokeWidth={1.3} />
      </div>
      <span className="absolute top-4 left-0 flex items-center gap-2 rounded-full border border-white/15 bg-ink-raised px-3 py-2.5 text-[11px] font-medium text-white shadow-card">
        <Icon name="check" size={13} className="text-info" />
        Hosting handled
      </span>
      <span className="absolute top-[140px] right-0 flex items-center gap-2 rounded-full border border-white/15 bg-ink-raised px-3 py-2.5 text-[11px] font-medium text-white shadow-card">
        <Icon name="check" size={13} className="text-info" />
        Updates covered
      </span>
      <span className="absolute bottom-3 left-2 flex items-center gap-2 rounded-full border border-white/15 bg-ink-raised px-3 py-2.5 text-[11px] font-medium text-white shadow-card">
        <Icon name="support" size={13} className="text-info" />
        A team to turn to
      </span>
    </>
  );
}
