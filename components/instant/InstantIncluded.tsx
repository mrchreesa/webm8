"use client";

import { useInstantMarket } from "./InstantMarket";
import { Icon } from "@/components/ui/Icon";
import { brand } from "@/lib/site";
import { whatsappHref } from "@/lib/leadAttribution";
import { INSTANT_TRIAL_DAYS } from "@/lib/instantWebsite";
import styles from "./instant.module.css";

const groups = [
  {
    title: "The essentials",
    items: [
      "Website demo within one business day of submitting the brief",
      "Contact inquiry forms, booking requests or a link to an existing booking service",
      "Hosting, SSL and ongoing maintenance",
      "Unlimited revisions until you’re 100% satisfied",
      "A developer with 10+ years of experience allocated to your project",
      "SEO: Google search optimization",
      "GEO: AI search for ChatGPT, Gemini, Meta AI and others",
    ],
  },
  {
    title: "On your website",
    items: [
      "Website design with layouts suitable for phones",
      "Home, services, about and contact content",
      "Inquiry forms and click-to-call buttons",
      "Basic Google setup for page titles and business information",
      "Domain setup assistance, hosting and support",
      "Small monthly content changes",
    ],
  },
  {
    title: "Room to grow",
    items: [
      "Dedicated pages for individual services and locations",
      "Monthly reporting on visits, calls and inquiries",
      "Centralized customer and inquiry records",
    ],
  },
];

/** The three reasons the plan is worth its price, shown above the card form on step two. */
export const instantEdges = [
  { icon: "trust", title: "The best website in your local market", text: "We study your competitors’ websites first, then design yours to beat them. Revisions are unlimited until you’re 100% satisfied." },
  { icon: "leads", title: "More inquiries, including from AI search", text: "Built to be found on Google and recommended by ChatGPT, Gemini and Meta AI. Our clients receive inquiries from AI search because of how we optimize their websites." },
  { icon: "support", title: "A real developer, not a bot", text: "One of our developers with 10+ years of experience is allocated to your project, so you always know who to ask." },
] as const;

/** Step two, above the card form: the price and why it is worth it. */
export function InstantWorth() {
  const { offer } = useInstantMarket();
  return (
    <div className={styles.worth} data-analytics-section="Instant value">
      <p className={styles.worthEyebrow}><Icon name="spark" size={14} aria-hidden />Why it’s worth it</p>
      <p className={styles.worthPrice}><b>{offer.zero}</b><span>to pay today<small>You have {INSTANT_TRIAL_DAYS} days to review everything before your subscription starts.</small></span></p>
      <ol className={styles.worthTimeline}>
        <li><strong>Today</strong><span>Pay {offer.zero}. Add a card to start your free trial.</span></li>
        <li><strong>Days 1 to {INSTANT_TRIAL_DAYS}</strong><span>See your website, ask for changes and decide if it’s right for you.</span></li>
        <li><strong>After day {INSTANT_TRIAL_DAYS}</strong><span>Your subscription starts at {offer.price} a month. Cancel before then and you pay nothing.</span></li>
      </ol>
      <p className={styles.worthSaving}><Icon name="revenue" size={18} aria-hidden /><span><strong>You save a lot compared with other agencies.</strong> They charge a large fee upfront to build a website, then high monthly payments. We charge nothing upfront, and one low monthly price.</span></p>
      <ul>
        {instantEdges.map((edge) => (
          <li key={edge.title}><Icon name={edge.icon} size={18} aria-hidden /><div><strong>{edge.title}</strong><p>{edge.text}</p></div></li>
        ))}
      </ul>
    </div>
  );
}

/** Step two, beside the card form (below it on phones): everything the plan covers. */
export function InstantIncluded() {
  const { offer } = useInstantMarket();
  const whatsapp = whatsappHref(brand.whatsapp, "Hi WebM8, I have a question about Instant Websites.");
  return (
    <aside className={styles.included} data-analytics-section="Instant plan" aria-labelledby="instant-included-title">
      <div className={styles.includedIntro}>
        <h2 id="instant-included-title">Everything a small business website needs, for one monthly price.</h2>
        <div className={styles.ticket}>
          <p><b>{offer.price}</b>a month</p>
          <ul>{[`${INSTANT_TRIAL_DAYS} days free`, "No setup fee", "Cancel anytime"].map((item) => <li key={item}><Icon name="check" size={14} aria-hidden />{item}</li>)}</ul>
        </div>
      </div>
      <div className={styles.developer}>
        <h3>Your own developer, not an automated bot.</h3>
        <p>One of our developers with 10+ years of experience is allocated to your project. You’ll know exactly who to approach with questions, clarifications and changes, instead of dealing with automated replies.</p>
        {whatsapp
          ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-analytics-id="Message us on WhatsApp - plan"><Icon name="whatsapp" size={18} aria-hidden />Message us instantly on WhatsApp</a>
          : <p className={styles.developerChat}><Icon name="whatsapp" size={18} aria-hidden />Message us instantly on WhatsApp</p>}
      </div>
      <div className={styles.includedGroups}>
        {groups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <ul>{group.items.map((item) => <li key={item}><Icon name="check" size={12} aria-hidden />{item}</li>)}</ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
