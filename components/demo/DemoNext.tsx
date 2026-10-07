import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    when: "Today",
    title: "A quick call",
    body: "About five minutes. We learn about your business, your customers and what you want more of.",
  },
  {
    when: "Within 48 hours of our call",
    title: "Your demo",
    body: "A homepage designed for your business, with your name, services and area on it. We show it to you on a short video call.",
  },
  {
    when: "Then",
    title: "You decide",
    body: "Love it? We’ll recommend a plan based on the features you need. Not for you? Walk away. We won’t chase.",
  },
];

/** What happens after a demo request (on /free-demo/ or a Meta Instant Form), in order. */
export function DemoNext() {
  return (
    <section aria-labelledby="demo-next-title" className="py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <h2 id="demo-next-title" className="max-w-2xl text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-bold text-ink">
            Here’s what happens next.
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 90}
              className="relative rounded-3xl border border-border bg-surface p-6 shadow-card md:p-7"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-mono text-sm font-semibold text-brand">
                {index + 1}
              </span>
              <p className="mt-5 font-mono text-[0.7rem] font-semibold tracking-[0.14em] text-link uppercase">{step.when}</p>
              <h3 className="mt-1.5 text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
