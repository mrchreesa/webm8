import Image from "next/image";
import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const reassurance = [
  "From $197 a month",
  "$0 setup fee",
  "No minimum contract term",
];

export function MoverHero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <AmbientBlobs variant="light" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="animate-rise text-sm font-semibold text-brand">
            Websites for US moving companies
          </p>

          <h1
            className="animate-rise mt-5 max-w-[16ch] text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Your hands are full. Your website can take the details.
          </h1>

          <p
            className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            We build and manage moving-company websites that make requesting an
            estimate simple, so customers can send their moving details while
            you&rsquo;re on the job.
          </p>

          <div
            className="animate-rise mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "240ms" }}
          >
            <LinkButton
              href="#review-request"
              size="lg"
              data-funnel-event="mover_cta_clicked"
              data-funnel-location="hero"
            >
              Book my free 10-minute review
            </LinkButton>
            <a
              href="#how-it-works"
              data-funnel-event="mover_demo_clicked"
              data-funnel-location="hero"
              className="inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-ink underline decoration-brand/40 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
            >
              See how it works
            </a>
          </div>

          <ul
            className="animate-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            style={{ animationDelay: "320ms" }}
          >
            {reassurance.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Icon name="check" size={15} className="text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-rise relative mx-auto w-full max-w-sm lg:max-w-none"
          style={{ animationDelay: "260ms" }}
        >
          <PhoneFrame>
            <Image
              src="/movers/demo-1-open.webp"
              alt="A moving company website on a phone, showing the headline and an estimate form on the first screen"
              width={390}
              height={844}
              priority
              sizes="(max-width: 1024px) 70vw, 340px"
              className="h-full w-full object-cover object-top"
            />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2rem] border border-ink-raised bg-ink-deep p-2 shadow-card-hover">
      <div className="relative aspect-[390/760] w-full overflow-hidden rounded-[1.5rem] bg-white">
        {children}
      </div>
    </div>
  );
}
