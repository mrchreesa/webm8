import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const steps = [
  {
    title: "Book a time",
    body: "Send your company name and website, if you have one. No project brief or preparation needed.",
  },
  {
    title: "We prepare your demo",
    body: "We create a custom homepage preview using your moving company, services and service area.",
  },
  {
    title: "See it, then decide",
    body: "We show you the demo and answer your questions. Sign up only if you like what you see.",
  },
];

export function ReviewExpectations() {
  return (
    <section
      aria-labelledby="custom-demo-heading"
      className="bg-white py-16 md:py-20"
    >
      <div className="container-page">
        <div className="surface-dark relative overflow-hidden rounded-[2rem] bg-ink-deep px-6 py-8 text-white shadow-card-hover sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-info/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-electric/25 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-info">
                <Icon name="spark" size={14} aria-hidden />
                Free 10-minute custom demo
              </p>

              <h2
                id="custom-demo-heading"
                className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              >
                See what your new website could look like before you pay.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-invert">
                We make a custom website demo for your moving company. See it on
                a 10-minute call, then sign up only if you like it.
              </p>

              <LinkButton
                href="#review-request"
                size="lg"
                className="mt-7"
                data-funnel-event="mover_cta_clicked"
                data-funnel-location="custom_demo"
              >
                Book my free custom demo
                <Icon name="arrow" size={18} aria-hidden />
              </LinkButton>
            </div>

            <ol className="grid gap-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm sm:grid-cols-[3rem_1fr] sm:p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/15 text-sm font-bold text-info tabular-nums sm:h-12 sm:w-12">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-white sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-invert sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mt-8 flex items-start gap-3 rounded-2xl border border-info/20 bg-info/10 px-4 py-3.5 text-sm leading-relaxed text-white sm:items-center sm:justify-center sm:text-center">
            <Icon
              name="shield"
              size={18}
              className="mt-0.5 shrink-0 text-info sm:mt-0"
              aria-hidden
            />
            <p>
              <span className="font-semibold">
                No payment details. No contract. No obligation.
              </span>{" "}
              If it isn&rsquo;t right for you, you walk away owing nothing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
