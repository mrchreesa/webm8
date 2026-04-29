import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { auditChecklist } from "@/lib/site";

export function AuditTeaser() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <AmbientBlobs variant="brand" />

      <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
        <Reveal className="text-white">
          <Eyebrow tone="invert" className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
            Free website audit
          </Eyebrow>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Want to Know What Your Website Could Be Doing Better?
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Get a free website audit showing how your current website can be
            improved to generate more calls, bookings, and enquiries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/audit" size="lg" variant="dark">
              Request Free Website Audit
              <Icon name="arrow" size={18} />
            </LinkButton>
          </div>
        </Reveal>

        <Reveal variant="slide-right" delay={120}>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Audit includes
            </p>
            <ul className="mt-4 space-y-3">
              {auditChecklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-medium text-white"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                    <Icon name="check" size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
