
import { analyticsName } from "@/lib/analyticsNames";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

const questions: { question: string; answer: ReactNode }[] = [
  {
    question: "What’s the catch?",
    answer:
      "There isn’t one. Businesses that see their own website are far more likely to work with us. If you don’t, we’ve spent a couple of hours and you’ve spent nothing.",
  },
  {
    question: "How much does a website cost?",
    answer:
      "It depends on the features you need, so we recommend a plan after you’ve seen your demo and told us what you want. You’ll know the exact price before you agree to anything.",
  },
  {
    question: "What happens after the demo?",
    answer:
      "If you’d like to go ahead, we recommend a plan, finish the site with your logo, photos and details, and put it live. If not, that’s the end of it.",
  },
  {
    question: "Do I need to prepare anything?",
    answer:
      "No. If you have a logo, photos or a current website, mention them on our call. They help, but we can design your demo without them.",
  },
  {
    question: "Do you work with businesses in the UK and the US?",
    answer: "Yes, both. We call you at a time that suits your time zone.",
  },
  {
    question: "What do you do with my details?",
    answer: (
      <>
        We use them only to contact you about your demo. We never sell them. Read our{" "}
        <Link data-analytics-id="Read privacy policy" href="/privacy/" className="font-semibold text-link underline-offset-2 hover:underline">
          privacy policy
        </Link>
        .
      </>
    ),
  },
];

export function DemoFaq() {
  return (
    <section data-analytics-section="Demo questions" aria-labelledby="demo-faq-title" className="py-20 md:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <h2 id="demo-faq-title" className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1] font-bold text-ink">
            Questions, answered.
          </h2>
        </Reveal>
        <div className="divide-y divide-border border-y border-border">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary data-analytics-id={analyticsName(`FAQ ${question}`)} className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-xl leading-none text-ink transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
