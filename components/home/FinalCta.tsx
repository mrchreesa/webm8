import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
      <AmbientBlobs variant="dark" />

      <div className="container-page text-center">
        <Reveal>
          <Eyebrow
            tone="invert"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur"
          >
            Ready when you are
          </Eyebrow>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Ready to Turn Your Website Into a Better Sales Tool?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Choose a monthly website plan or request a free audit to see how
            your business website can bring in more calls, bookings, and
            customers.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton href="/audit" size="lg" variant="dark">
              Get a Free Website Audit
              <Icon name="arrow" size={18} />
            </LinkButton>
            <LinkButton href="/pricing" size="lg" variant="outline-invert">
              View Pricing
              <Icon name="arrow" size={18} />
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
