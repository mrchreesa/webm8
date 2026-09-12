import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "@/components/movers/MoverHero";
import { Reveal } from "@/components/ui/Reveal";
import { projects } from "@/lib/site";

const demoProject = projects.find((project) => project.slug === "removals");

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
    <section id="how-it-works" className="relative bg-surface py-20 md:py-28">
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

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          <OwnerIllustration />

          <div className="rounded-2xl border border-border bg-bg p-6">
            <h3 className="font-bold text-ink">About this example</h3>
            <p className="mt-2 leading-relaxed text-muted">
              This is a WebM8 demonstration site, not a paying client&rsquo;s
              work, and the moving details in the screens are made up for the
              walkthrough. Everything shown is real, working functionality — you
              can open it and try the estimate yourself.
            </p>
            {demoProject && (
              <a
                href={demoProject.siteUrl}
                target="_blank"
                rel="noreferrer"
                data-funnel-event="mover_demo_clicked"
                data-funnel-location="demo_section"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-brand underline underline-offset-4 hover:text-brand-hover"
              >
                Open the demonstration site
                <Icon name="arrow" size={16} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The owner's side of the same request.
 *
 * Drawn rather than screenshotted, and labelled as a drawing, because sending
 * a real request into the demonstration site's database to photograph the
 * result would put invented data in front of the next person who opens it.
 */
function OwnerIllustration() {
  const lines = [
    ["Move", "Chicago, IL to Milwaukee, WI"],
    ["Date", "Saturday 3 October, morning"],
    ["Crew", "3 movers, 4 hours"],
    ["Notes", "2nd floor, no elevator, piano"],
    ["Contact", "Phone and email"],
  ];

  return (
    <div className="rounded-2xl border border-border bg-bg p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon name="mail" size={18} aria-hidden />
        </span>
        <div>
          <h3 className="font-bold text-ink">And this is what reaches you</h3>
          <p className="mt-1 text-sm text-muted">
            A drawing of the summary, not a screenshot &mdash; the details are
            from the walkthrough above.
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-white">
        {lines.map(([term, value]) => (
          <div key={term} className="flex gap-4 px-4 py-3 text-sm">
            <dt className="w-20 shrink-0 font-semibold text-muted">{term}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        It lands in your email, so you can call back with the details in front
        of you instead of asking for them again.
      </p>
    </div>
  );
}
