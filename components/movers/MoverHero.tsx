import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MoverFeatureCarousel } from "@/components/movers/MoverFeatureCarousel";

const reassurance = [
  "From $197 a month",
  "$0 setup fee",
  "No minimum contract term",
];

export function MoverHero() {
  return (
    <section className="relative -mt-16 flex min-h-screen min-h-svh flex-col overflow-hidden bg-ink pt-16 text-bg md:-mt-20 md:pt-20">
      <div className="container-page relative grid w-full flex-1 gap-12 pb-14 pt-10 md:grid-cols-2 md:items-center md:gap-12 md:pb-14 md:pt-10 lg:gap-14">
        <div>
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-ink-raised bg-ink-raised/40 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-invert">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-info" />
            Websites for US moving companies
          </p>

          <h1
            className="animate-rise mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Your hands are full. Your website can take the {" "}
            <span className="relative inline-block">
              <span className="relative z-10">details.</span>
              <Underline />
            </span>
          </h1>

          <p
            className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-muted-invert md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            We build and manage moving-company websites that make requesting an
            estimate simple, so customers can send their moving details while
            you&rsquo;re on the job.
          </p>

          <div
            className="animate-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <LinkButton
              href="#review-request"
              size="lg"
              data-funnel-event="mover_cta_clicked"
              data-funnel-location="hero"
            >
              Book my free 10-minute review
              <Icon name="arrow" size={18} />
            </LinkButton>
            <LinkButton
              href="#how-it-works"
              size="lg"
              variant="outline-invert"
              data-funnel-event="mover_demo_clicked"
              data-funnel-location="hero"
            >
              See how it works
              <Icon name="arrow" size={18} />
            </LinkButton>
          </div>

          <ul
            className="animate-rise mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink-raised pt-6 text-sm text-muted-invert"
            style={{ animationDelay: "320ms" }}
          >
            {reassurance.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Icon name="check" size={15} className="text-info" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-rise -mt-4 md:-mt-10"
          style={{ animationDelay: "360ms" }}
        >
          <MoverHeroShowcase />
        </div>
      </div>

      <MoverFeatureCarousel />
    </section>
  );
}

function Underline() {
  return (
    <svg
      className="absolute -bottom-1 left-0 h-3 w-full text-signal"
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2 9 C 60 2, 140 2, 198 9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoverHeroShowcase() {
  return (
    <div
      className="relative mx-auto w-full max-w-[620px]"
      aria-label="Moving company website shown on desktop and mobile screens"
      role="img"
    >
      <div className="relative rounded-[1.6rem] border border-ink-raised bg-ink-deep p-2 shadow-card-hover md:p-2.5">
        <div className="overflow-hidden rounded-[1.1rem] border border-border bg-white">
          <div className="flex items-center gap-1.5 border-b border-border bg-bg-alt px-3 py-2 md:gap-2 md:px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-error/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-highlight" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <div className="ml-2 min-w-0 flex-1">
              <div className="mx-auto h-6 max-w-xs truncate rounded-md border border-border bg-white px-3 text-center font-mono text-[10px] leading-6 text-muted">
                moving company website preview
              </div>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden bg-bg-alt p-1.5 md:p-2">
            <Image
              src="/work/removals-desktop.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) min(620px, 44vw), (min-width: 768px) min(620px, 48vw), min(620px, 90vw)"
              className="rounded-lg object-contain object-top"
            />
          </div>
        </div>

        <div className="absolute -bottom-5 right-2 w-[26%] min-w-[102px] max-w-[148px] md:-bottom-6 md:-right-4">
          <div className="rounded-[1.5rem] border border-ink-raised bg-ink-deep p-1.5 shadow-card-hover">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.05rem] bg-white p-1">
              <span className="absolute left-1/2 top-1.5 z-20 h-1 w-8 -translate-x-1/2 rounded-full bg-ink/40" />
              <Image
                src="/movers/demo-1-open.webp"
                alt=""
                fill
                priority
                sizes="148px"
                className="rounded-[0.85rem] object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
