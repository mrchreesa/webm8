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
            Ready for a Website That Brings In More Business?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Ask for a price or get a free website review. We’ll explain what
            would help in plain language and without pressure.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton href="/audit" size="lg" variant="dark">
              Get a Free Website Review
              <Icon name="arrow" size={18} />
            </LinkButton>
            <LinkButton href="/contact/" size="lg" variant="outline-invert">
              Get a Fast Estimate
              <Icon name="arrow" size={18} />
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
