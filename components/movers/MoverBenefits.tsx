import { Icon, type IconName } from "@/components/ui/Icon";

const benefits: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "device",
    title: "Asking for an estimate is easy on a phone",
    body: "Most people looking for a mover are on a phone, often while doing something else. The form asks for what you need to quote and nothing more, and your number is always one tap away.",
  },
  {
    icon: "leads",
    title: "You get what you need to follow up",
    body: "Addresses, dates, size of move and how to reach them — in your inbox, in one place. You call back knowing the job, instead of starting the conversation from nothing.",
  },
  {
    icon: "shield",
    title: "The business looks like one worth trusting",
    body: "Your real reviews, photos of your crew, and your licence and insurance details sit where customers are deciding. Movers get judged on whether they can be trusted with someone's home.",
  },
];

export function MoverBenefits() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Three things this changes.
          </h2>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="border-t border-border pt-6 md:pt-8"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon name={benefit.icon} size={20} aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{benefit.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{benefit.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-3xl leading-relaxed text-muted">
          What a website can&rsquo;t do is answer the phone for you, create
          demand that isn&rsquo;t there, or guarantee jobs. It can make sure the
          people who already found you don&rsquo;t give up before they reach you.
        </p>
      </div>
    </section>
  );
}
