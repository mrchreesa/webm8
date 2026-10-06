import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

const promises = [
  { title: "No card.", body: "We never ask for payment details to make your demo." },
  { title: "No contract.", body: "Seeing your demo commits you to nothing." },
  { title: "No chasing.", body: "Not for you? Say so, and that’s the end of it." },
  {
    title: "Plans come after.",
    body: "If you love it, we recommend a plan based on the features you need. Only then do we talk price.",
  },
];

/** The ad promised free with no obligation; this says exactly what that means. */
export function DemoPromise() {
  return (
    <section aria-labelledby="demo-promise-title" className="surface-dark relative overflow-hidden bg-ink-deep py-20 text-white md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_100%_100%,rgb(43_108_252/0.28),transparent_65%)]"
      />
      <div className="container-page relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 id="demo-promise-title" className="text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.96] font-bold">
            Free means <span className="text-brand">free.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted-invert">
            You pay nothing to see your demo. If you love it, we’ll talk about a plan. If you don’t, you walk away.
          </p>
        </Reveal>
        <ul className="grid gap-3.5 sm:grid-cols-2">
          {promises.map((promise, index) => (
            <Reveal
              as="li"
              key={promise.title}
              delay={index * 80}
              className="rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 ring-inset"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-brand-ink">
                <Icon name="check" size={16} aria-hidden />
              </span>
              <p className="mt-4 text-lg font-semibold">{promise.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-invert">{promise.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
