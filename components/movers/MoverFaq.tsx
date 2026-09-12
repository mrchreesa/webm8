import {
  annualEquivalentMonthly,
  annualSaving,
  formatUsd,
  formatUsdPrecise,
  getMoverPlan,
} from "@/lib/movers";

const standard = getMoverPlan("standard");
const growth = getMoverPlan("growth");

/**
 * Exported so the page can build FAQPage structured data from exactly the
 * answers shown to a reader.
 */
export const moverFaqs: { question: string; answer: string }[] = [
  {
    question: "What does each plan include?",
    answer:
      `Standard (${formatUsd(standard.monthlyPrice)} a month) is a managed moving-company website: design and copy written for your company, services and real service area, a responsive layout with visible phone buttons and a straightforward estimate form, quote requests delivered to your email, trust sections built from your reviews, photos and licence and insurance details, hosting, security, backups and maintenance, foundational on-page SEO and analytics, routine small content edits, and a simple monthly website and enquiry summary. ` +
      `Growth (${formatUsd(growth.monthlyPrice)} a month) adds the ongoing work: Google Business Profile support and optimization with your access and approval, one new or substantially improved service or location page each month, review-request and enquiry-follow-up workflows using supported integrations, one useful conversion improvement each month informed by evidence where available, and a monthly performance review covering enquiries, sources and next actions.`,
  },
  {
    question: "What do we need to supply?",
    answer:
      "Your services and the areas you actually cover, your phone number and business details, photos of your crew, trucks or completed jobs if you have them, your licence and insurance information, and access to your Google Business Profile if you're on Growth. If you have existing reviews we'll point to them rather than retype them. We write the copy; you check it before anything goes live.",
  },
  {
    question: "Can we keep our web address, or replace our current website?",
    answer:
      "Yes to both. If you already own a domain, the new site can be pointed at it and your address doesn't change. If you have an existing website we replace it, and we agree a switch-over time with you so there's no gap where customers can't reach you. If you don't have a domain yet we'll help you register one in your own name.",
  },
  {
    question: "How do monthly and annual billing work?",
    answer:
      `Monthly billing is ${formatUsd(standard.monthlyPrice)} or ${formatUsd(growth.monthlyPrice)} a month, charged each month, with no minimum contract term. Annual billing is a single payment up front — ${formatUsd(standard.annualPrice)} for Standard or ${formatUsd(growth.annualPrice)} for Growth — which covers 12 months of service. Either way there's no setup fee. Annual is a discount for paying up front; it isn't a trial, and it isn't two free months added to monthly billing.`,
  },
  {
    question: "How much does annual billing save?",
    answer:
      `You pay for 10 months and get 12, so you save two months. On Standard that's ${formatUsd(annualSaving(standard))} a year, which works out at ${formatUsdPrecise(annualEquivalentMonthly(standard))} a month instead of ${formatUsd(standard.monthlyPrice)}. On Growth it's ${formatUsd(annualSaving(growth))} a year, or ${formatUsdPrecise(annualEquivalentMonthly(growth))} a month instead of ${formatUsd(growth.monthlyPrice)}. The annual amount is charged once, not monthly.`,
  },
  {
    question: "How does cancelling work?",
    answer:
      "There's no minimum contract term on either plan, so you're never locked into continuing. On monthly billing you tell us you want to stop and the service runs to the end of the month you've paid for. Annual billing is paid up front for 12 months of service — if you need to stop partway through an annual term, talk to us and we'll agree in writing what happens to the remainder before you commit to paying annually. We won't hold your domain or your content hostage either way.",
  },
  {
    question: "Who owns the domain, the website and the customer details?",
    answer:
      "The domain is registered in your name and stays yours. Your logo, your photos, the text about your business and every enquiry a customer sends you are yours. The website itself is built and hosted by WebM8 as part of the service, which is what keeps the upfront cost at zero. If you ever want to take the site somewhere else, we'll agree the handover and any cost in writing first. We don't make promises about the site staying online after the service ends until that's been agreed with you.",
  },
  {
    question: "Can enquiries go into software we already use?",
    answer:
      "Often, yes. Every plan sends quote requests to your email, which works regardless. Beyond that we check your specific software before promising anything — some tools have an open connection, some charge for access, and some have none at all. On Growth, review-request and follow-up workflows use integrations we've confirmed will work for your setup. We'll tell you what's possible before you sign up, not after.",
  },
  {
    question: "What costs extra?",
    answer:
      "Advertising spend, paid software from other companies, and phone or text message usage are separate where they apply, and you pay those providers directly or we bill them on at cost. Domain registration renews annually and is yours. A large piece of extra work — a whole new section of the site, or something outside the monthly scope — is quoted and approved before it starts. Nothing gets added to your bill without you agreeing to it first.",
  },
  {
    question: "Do you guarantee leads or Google rankings?",
    answer:
      "No. Any company that guarantees a Google position or a number of jobs is guessing or lying. What you get is the agreed work delivered, clear reporting on where enquiries come from, and someone who'll tell you honestly what's working. Results also depend on your market, your reviews, your prices, and how quickly you call people back.",
  },
];

export function MoverFaq() {
  return (
    <section id="faq" className="bg-surface py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            The things owners ask first.
          </h2>
        </div>

        <div className="mt-10 max-w-4xl divide-y divide-border rounded-3xl border border-border bg-white px-6 md:px-8">
          {moverFaqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold text-ink">
                {faq.question}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5 text-lg text-brand transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="max-w-3xl pt-3 leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
