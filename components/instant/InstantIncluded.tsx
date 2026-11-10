import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { INSTANT_PRICE, INSTANT_TRIAL_DAYS } from "@/lib/instantWebsite";
import styles from "./instant.module.css";

const groups = [
  {
    title: "The essentials",
    items: [
      "Website demo within one working day of submitting the brief",
      "Contact enquiry forms, booking requests or a link to an existing booking service",
      "Hosting, SSL and ongoing maintenance",
      "Unlimited revisions until you’re 100% satisfied",
      "SEO: Google search optimisation",
      "GEO: AI search for ChatGPT, Gemini, Meta AI and others",
    ],
  },
  {
    title: "On your website",
    items: [
      "Website design with layouts suitable for phones",
      "Home, services, about and contact content",
      "Enquiry forms and click-to-call buttons",
      "Basic Google setup for page titles and business information",
      "Domain registration, hosting and support",
      "Small monthly content changes",
    ],
  },
  {
    title: "Room to grow",
    items: [
      "Dedicated pages for individual services and locations",
      "Monthly reporting on visits, calls and enquiries",
      "Centralised customer and enquiry records",
    ],
  },
];

/** After the demo wall: everything the plan covers, in three short lists beside the price. */
export function InstantIncluded() {
  return (
    <section className={styles.included} data-analytics-section="Instant plan" aria-labelledby="instant-included-title">
      <div className={styles.includedInner}>
        <div className={styles.includedIntro}>
          <h2 id="instant-included-title">Everything a small business website needs, for one monthly price.</h2>
          <div className={styles.ticket}>
            <p><b>£{INSTANT_PRICE}</b>a month</p>
            <ul>{[`${INSTANT_TRIAL_DAYS} days free`, "No setup fee", "Cancel anytime"].map((item) => <li key={item}><Icon name="check" size={14} aria-hidden />{item}</li>)}</ul>
          </div>
          <LinkButton data-analytics-id="Start with your details - plan" href="#instant-signup" size="md">Start with your details</LinkButton>
        </div>
        <div className={styles.includedGroups}>
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}><Icon name="check" size={12} aria-hidden />{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
