import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "@/components/movers/MoverHero";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    title: "She opens the site on her phone",
    body: "The estimate starts on the first screen, next to a phone number she can tap.",
    image: "/movers/demo-1-open.webp",
    alt: "A moving company homepage on a phone with an estimate form in view",
  },
  {
    title: "She enters the move",
    body: "Hours, crew size, date and time — with the price updating as she goes.",
    image: "/movers/demo-2-details.webp",
    alt: "The estimate form showing crew size, date, time slot and a running price summary",
  },
  {
    title: "She adds her details",
    body: "Name, email, phone, and anything the crew needs to know before they arrive.",
    image: "/movers/demo-3-contact.webp",
    alt: "The contact step of the estimate form with name, email, phone and special instructions",
  },
  {
    title: "She sends the request",
    body: "A clear total, then one button. The request goes straight to the owner.",
    image: "/movers/demo-4-summary.webp",
    alt: "A booking summary showing the service, duration, crew, date and estimated total",
  },
];

export function MoverDemo() {
  return (
    <section
      id="how-it-works"
      className="relative bg-surface pb-20 pt-12 md:pb-28 md:pt-16"
    >
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            What a quote request actually looks like.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">
            Four screens from a working moving-company site we built. A customer
            can get from landing on the page to sending her moving details in
            under a minute, on a phone, one-handed.
          </p>
        </div>

        <Reveal>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <li key={step.title}>
                <PhoneFrame>
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={390}
                    height={844}
                    loading="lazy"
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 260px"
                    className="h-full w-full object-cover object-top"
                  />
                </PhoneFrame>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-sm font-bold text-brand tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-5xl">
          <OwnerIllustration />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The owner's side of the same request.
 *
 * Drawn rather than screenshotted because sending a real request into the
 * demonstration site's database to photograph the result would put invented
 * data in front of the next person who opens it.
 */
function OwnerIllustration() {
  const details = [
    ["Date", "Sat 3 October · Morning"],
    ["Crew", "3 movers · 4 hours"],
    ["Access", "2nd floor · No elevator"],
    ["Special item", "Piano"],
  ];

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-ink-deep p-5 shadow-card-hover sm:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-info/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            <span className="h-2 w-2 rounded-full bg-info" aria-hidden="true" />
            Quote delivered
          </span>
          <h3 className="mt-5 max-w-md text-3xl font-bold leading-tight text-white sm:text-4xl">
            And this is what reaches you
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-muted-invert">
            Every useful detail arrives in one clear summary, ready for you to
            call back without asking the same questions again.
          </p>

          <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-info">
              <Icon name="mail" size={20} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Straight to your inbox</p>
              <p className="mt-0.5 text-xs text-muted-invert">The moment they send the request</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white p-2 shadow-card-hover">
          <div className="rounded-[1.15rem] border border-border/70 bg-bg p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-cta">
                  <Icon name="mail" size={20} aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-ink">New quote request</p>
                  <p className="mt-0.5 text-xs text-muted">Website enquiry</p>
                </div>
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                New
              </span>
            </div>

            <div className="my-4 rounded-2xl border border-border bg-white p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Moving from
              </p>
              <p className="mt-1 font-bold text-ink">Chicago, IL</p>
              <div className="my-2 flex items-center gap-2" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-brand" />
                <span className="h-px flex-1 border-t border-dashed border-brand/40" />
                <Icon name="arrow" size={15} className="text-brand" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Moving to
              </p>
              <p className="mt-1 font-bold text-ink">Milwaukee, WI</p>
            </div>

            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {details.map(([term, value]) => (
                <div key={term} className="rounded-xl bg-white px-4 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted">
                    {term}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-2 flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-white">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
                <Icon name="check" size={16} strokeWidth={2.5} aria-hidden />
              </span>
              <div>
                <p className="text-xs text-muted-invert">Contact details included</p>
                <p className="text-sm font-semibold">Phone number and email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
