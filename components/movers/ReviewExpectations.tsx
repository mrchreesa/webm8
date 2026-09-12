const agenda = [
  {
    title: "We look at your website together",
    body: "On a screen share, or on our own if you'd rather just listen. No preparation needed from you.",
  },
  {
    title: "We point out what gets in the way",
    body: "The practical things stopping someone asking for an estimate — a buried phone number, a form that's too long, a page that's unreadable on a phone.",
  },
  {
    title: "We show you a relevant example",
    body: "A moving-company site doing the same job well, so the suggestions are something you can see rather than imagine.",
  },
  {
    title: "We say whether WebM8 is a fit",
    body: "Sometimes the answer is that your site is fine and you need something else. You'll get that answer straight.",
  },
];

export function ReviewExpectations() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              What happens on the 10 minutes.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              It&rsquo;s a short conversation, booked at a time you pick. Ten
              minutes is enough to be useful and short enough to fit between
              jobs.
            </p>
            <p className="mt-5 leading-relaxed text-muted">
              There is no obligation to buy anything, and nothing is sent to you
              afterwards unless you ask for it.
            </p>
            <p className="mt-5 leading-relaxed text-muted">
              <span className="font-semibold text-ink">
                No website yet?
              </span>{" "}
              Then we spend the time on your services, your service area and how
              customers currently reach you, and show you an example built for a
              company like yours.
            </p>
          </div>

          <ol className="space-y-6">
            {agenda.map((item, index) => (
              <li key={item.title} className="flex gap-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-sm font-bold text-brand tabular-nums">
                  {index + 1}
                </span>
                <div className="border-b border-border pb-6">
                  <h3 className="font-bold text-ink">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
