import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { whatsappHref } from "@/lib/leadAttribution";
import { brand } from "@/lib/site";
import styles from "./thankYou.module.css";

const whatsappMessage =
  "Hi WebM8, I’ve just sent you my details and I’d like to talk about my website.";

/**
 * The call is the next step, so it closes the page, with the number it will
 * come from when one is set: leads who don't recognise a number don't answer.
 * WhatsApp and the calendar are for people who want to move faster. Both are
 * optional, and neither asks for details we already have.
 */
export function ThankYouCall() {
  const whatsapp = whatsappHref(brand.whatsapp, whatsappMessage);

  return (
    <section data-analytics-section="Next call"
      aria-labelledby="call-title"
      className="surface-dark relative overflow-hidden bg-night py-16 text-bg md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_0%,rgb(27_74_128/0.6),transparent_60%)]"
      />
      <div className="container-page relative">
        <div className="max-w-2xl">
          {/* Rings every few seconds: this is the one thing to remember. */}
          <span className={styles.ringer}>
            <Icon name="phone" size={24} aria-hidden />
          </span>
          <h2
            id="call-title"
            className="mt-6 text-[clamp(2.1rem,7.5vw,3.6rem)] leading-[1] font-bold text-balance"
          >
            Keep an eye on your phone
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-invert md:text-xl">
            We&rsquo;ll call you shortly to learn more about your business and
            discuss your free website demo.
          </p>

          {brand.phone ? (
            <div className="mt-7 rounded-2xl bg-white/6 p-5 ring-1 ring-white/12 md:p-6">
              <p className="text-sm font-medium text-muted-invert">
                Your call will come from:
              </p>
              <a data-analytics-id="Call WebM8"
                href={`tel:${brand.phone}`}
                data-lead-event="call_clicked"
                data-lead-placement="call_notice"
                className="mt-1 inline-block font-display text-[clamp(1.9rem,7vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-brand underline-offset-4 hover:underline"
              >
                {brand.phoneLabel || brand.phone}
              </a>
              <p className="mt-1 text-sm text-muted-invert">
                Save it to your contacts so you know it&rsquo;s us.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-12 max-w-2xl border-t border-white/10 pt-10">
          <h3 className="text-xl font-bold">Want to talk sooner?</h3>
          <p className="mt-1.5 text-muted-invert">
            There&rsquo;s no need to wait for our call.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {whatsapp ? (
              <LinkButton data-analytics-id="Message on WhatsApp"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                size="lg"
                data-lead-event="whatsapp_clicked"
                data-lead-placement="call_section"
                className="min-h-14 justify-center"
              >
                <Icon name="whatsapp" size={20} aria-hidden />
                Message us on WhatsApp
              </LinkButton>
            ) : null}
            <LinkButton data-analytics-id="Choose a call time"
              href={brand.bookingUrl}
              target="_blank"
              rel="noreferrer"
              size="lg"
              variant="outline-invert"
              data-lead-event="booking_clicked"
              data-lead-placement="call_section"
              className="min-h-14 justify-center"
            >
              <Icon name="calendar" size={18} aria-hidden />
              Choose a time to speak
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
