import { Icon } from "@/components/ui/Icon";
import { intakeEmail } from "@/lib/site";

/**
 * Trust section.
 *
 * Deliberately thin on proof: WebM8 has no mover client testimonials to show
 * yet, so this section explains who does the work rather than manufacturing
 * social proof. Drop a portrait at public/team/founder.webp and swap the
 * initials block for it.
 */
export function MoverProof() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              Who you&rsquo;ll actually be dealing with.
            </h2>

            <div className="mt-8 flex items-center gap-4">
              <span
                className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand"
                aria-hidden
              >
                K
              </span>
              <div>
                <p className="font-bold text-ink">Kristian</p>
                <p className="text-sm text-muted">
                  Founder, WebM8 &mdash; builds and maintains the sites
                </p>
              </div>
            </div>

            <p className="mt-6 leading-relaxed text-muted">
              WebM8 is small on purpose. The person who looks at your website on
              the review call is the person who writes it, builds it and keeps
              it running afterwards. There&rsquo;s no account manager in the
              middle and no support queue to sit in.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              When something needs changing, you email or call and it gets
              handled. When something isn&rsquo;t worth doing, you&rsquo;ll be
              told that too.
            </p>

            <p className="mt-6 font-semibold text-ink">
              Reach us directly at{" "}
              <a
                href={`mailto:${intakeEmail}`}
                data-funnel-event="mover_email_clicked"
                data-funnel-location="proof"
                className="text-brand underline underline-offset-4 hover:text-brand-hover"
              >
                {intakeEmail}
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-bg p-7 md:p-9">
            <h3 className="text-xl font-bold text-ink">
              What we can and can&rsquo;t show you yet
            </h3>

            <dl className="mt-6 space-y-6">
              <div>
                <dt className="font-semibold text-ink">
                  A moving-company site you can open and test
                </dt>
                <dd className="mt-1.5 leading-relaxed text-muted">
                  The walkthrough above is a WebM8 demonstration site. The
                  estimate flow, the pricing logic and the mobile layout are
                  real and working. It is our own build, not a client&rsquo;s.
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-ink">
                  No mover case studies or testimonials
                </dt>
                <dd className="mt-1.5 leading-relaxed text-muted">
                  We&rsquo;re early in this industry and won&rsquo;t borrow
                  someone else&rsquo;s results or invent a review count. Judge
                  the work by opening the demonstration and by what we say on
                  the call.
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-ink">
                  No promises about leads or rankings
                </dt>
                <dd className="mt-1.5 leading-relaxed text-muted">
                  Nobody can honestly promise a Google position or a number of
                  jobs. We can promise the agreed work gets done and that
                  you&rsquo;ll see where enquiries came from.
                </dd>
              </div>
            </dl>

            <p className="mt-7 flex items-start gap-2.5 text-sm leading-relaxed text-muted">
              <Icon
                name="shield"
                size={16}
                className="mt-0.5 shrink-0 text-accent"
                aria-hidden
              />
              Your licence and insurance details, reviews and photos are shown on
              your site exactly as you supply them. We don&rsquo;t write claims
              on your behalf.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
