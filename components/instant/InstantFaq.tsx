import { analyticsName } from "@/lib/analyticsNames";
import { INSTANT_PRICE, INSTANT_TRIAL_DAYS } from "@/lib/instantWebsite";
import styles from "./instant.module.css";

const price = `£${INSTANT_PRICE} a month`;

const questions = [
  { question: "How does the free trial work?", answer: `Your ${INSTANT_TRIAL_DAYS}-day free trial starts when you complete checkout. You add a card, but nothing is due today. After the trial your plan is ${price}.` },
  { question: "What happens when the trial ends?", answer: `Your plan continues at ${price}. You can cancel anytime, with no cancellation fee.` },
  { question: "Are there any other costs?", answer: `No. There is no setup fee, and ${price} covers the website, hosting, domain registration, maintenance and support.` },
  { question: "How quickly will I see my website?", answer: "Within one working day of submitting your website details. We send it to you by email and on WhatsApp." },
  { question: "What do you need from me?", answer: "Your name, your business and the town you serve to start. Then a few details about your services and how customers should contact you. A logo, photos and links help, but send what you have." },
  { question: "What if I want changes?", answer: "Reply on WhatsApp with your edits. Revisions are unlimited until you’re 100% satisfied, and small content changes each month are included after that." },
  { question: "How will customers contact me?", answer: "Through enquiry forms and click-to-call buttons. You can also take booking requests on the site, or link to a booking service you already use." },
  { question: "Will it work on phones and show up on Google?", answer: "Yes. Every layout is designed for phones, and we set up your page titles and business information for Google and for AI search such as ChatGPT and Gemini. No one can promise a ranking position." },
  { question: "Do I need my own domain?", answer: "Yes, you’ll need your own domain. If you don’t have one, we can help you choose and set it up. If you already have a domain, add it to your website details." },
  { question: "What if I need to sell online or take payments?", answer: "Online shops, payments and customer logins need more than this plan. Tell us in the form and we’ll send a custom quote. You won’t be asked for payment on that route." },
  { question: "How do I cancel?", answer: "Use the manage-subscription link in your confirmation email, or email info@webm8agency.com. You can cancel anytime and there is no cancellation fee." },
  { question: "Is my card safe?", answer: "Yes. Card details are entered in a secure Stripe form and processed by Stripe. They never pass through WebM8." },
];

/** The last section: every question in two columns of native disclosures, so it stays short until opened. */
export function InstantFaq() {
  return (
    <section className={styles.faq} data-analytics-section="Instant questions" aria-labelledby="instant-faq-title">
      <div className={styles.faqInner}>
        <h2 id="instant-faq-title">Questions, answered.</h2>
        <div className={styles.faqList}>
          {questions.map(({ question, answer }) => (
            <details key={question}>
              <summary data-analytics-id={analyticsName(`FAQ ${question}`)}>{question}<span aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
