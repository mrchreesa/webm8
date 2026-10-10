import { AmbientBlobs } from "@/components/ui/AmbientBlobs";
import { Icon } from "@/components/ui/Icon";
import { MoverReviewForm } from "@/components/forms/MoverReviewForm";
import { intakeEmail } from "@/lib/site";

const afterYouSend = [
  "You pick a time straight away, or leave it and we'll email you within one business day.",
  "Before the call we use your business page and preferences to prepare your custom demo.",
  "The call is 10 minutes. If you like the demo, we can discuss a plan; if not, there is no obligation.",
];

export function ReviewFormSection() {
  return (
    <section data-analytics-section="Mover review request"
      id="review-request"
      className="relative scroll-mt-20 overflow-hidden py-20 md:py-28"
    >
      <AmbientBlobs variant="light" />
      <div className="container-page relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Book your free 10-minute demo.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            A few short questions. No project brief, no budget questions, and
            nothing to pay.
          </p>

          <ol className="mt-8 space-y-4">
            {afterYouSend.map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-ink tabular-nums">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-muted">{item}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-2xl border border-border bg-white p-5">
            <p className="font-semibold text-ink">Rather just talk?</p>
            <p className="mt-1.5 leading-relaxed text-muted">
              Email{" "}
              <a data-analytics-id="Email WebM8"
                href={`mailto:${intakeEmail}`}
                data-funnel-event="mover_email_clicked"
                data-funnel-location="review_form"
                className="font-semibold text-link underline underline-offset-4 hover:text-ink"
              >
                {intakeEmail}
              </a>{" "}
              and we&rsquo;ll reply within one business day.
            </p>
          </div>

          <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-muted">
            <Icon
              name="shield"
              size={16}
              className="mt-0.5 shrink-0 text-accent"
              aria-hidden
            />
            We use your details to contact you about this demo and nothing
            else. No newsletter, no list, no reselling.
          </p>
        </div>

        <MoverReviewForm />
      </div>
    </section>
  );
}
