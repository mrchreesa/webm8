import { Icon } from "@/components/ui/Icon";
import type { Testimonial } from "@/lib/site";

/**
 * Comments from real WebM8 customers, word for word and with their
 * permission. Leave this empty rather than invent one: until it has entries,
 * the work above is the proof and this section says so.
 */
const customerComments: Testimonial[] = [];

const proofPoints = [
  {
    icon: "device" as const,
    title: "Real, working websites",
    body: "Every example above is live. Open one on your phone and try it.",
  },
  {
    icon: "spark" as const,
    title: "Made for your business",
    body: "Your demo carries your business name and your services, not a template.",
  },
];

export function ThankYouTrust() {
  return (
    <section aria-labelledby="trust-title" className="py-14 md:py-20">
      <div className="container-page">
        <div className="rounded-3xl border border-border bg-bg-alt p-6 md:p-10">
          <h2
            id="trust-title"
            className="text-[clamp(1.75rem,5.5vw,2.6rem)] leading-[1.05] font-bold text-ink"
          >
            Judge us by the work
          </h2>

          {customerComments.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {customerComments.map((comment) => (
                <figure key={comment.name} className="rounded-2xl bg-white p-5 md:p-6">
                  <blockquote className="leading-relaxed text-ink">
                    &ldquo;{comment.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-muted">
                    <span className="font-semibold text-ink">{comment.name}</span>,{" "}
                    {comment.role}, {comment.company}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}

          <ul className="mt-6 grid gap-5 md:grid-cols-2 md:gap-8">
            {proofPoints.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-brand">
                  <Icon name={point.icon} size={20} aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{point.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted">{point.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
