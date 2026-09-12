import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { createPageMetadata } from "@/lib/seo";
import { intakeEmail } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy notice",
  description:
    "How WebM8 collects, uses, stores, and protects information submitted through this website.",
  path: "/privacy/",
});

const sections = [
  {
    title: "Information we collect",
    body: "When you submit a form, we may collect your name, business name, email address, phone number, website, service area, project details, where you found us, and which advert or link you used. The companies that keep our website running and help us count visits may also collect basic device and visit information.",
  },
  {
    title: "How we use it",
    body: "We use submitted information to respond to your request, assess project suitability, prepare requested work, provide services, maintain records, protect the website, and understand which marketing activity produces genuine enquiries.",
  },
  {
    title: "Who receives it",
    body: "We may use trusted companies to deliver forms and email, keep the website online, book calls, and keep customer records. Website activity is measured with Mixpanel. These services receive only the information needed to do their work. We do not sell personal information.",
  },
  {
    title: "How we measure website use",
    body: "We use Mixpanel to count visits, understand where visitors came from, see which pages are useful, and record actions such as clicking a button or completing a form. We do not send names, email addresses, phone numbers, or form answers to Mixpanel. Tracking is set up without cookies or saved visitor profiles, and it respects your browser's Do Not Track setting.",
  },
  {
    title: "How long we keep it",
    body: "We keep enquiry and customer information only for as long as reasonably necessary to respond, provide services, maintain business records, resolve disputes, and meet applicable legal obligations.",
  },
  {
    title: "Your choices",
    body: "You may ask what personal information we hold about you, request a correction or deletion where applicable, or ask us to stop non-essential contact. Some information may need to be retained for legal or legitimate business reasons.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title={
          <>
            A plain-English <span className="text-brand">privacy notice.</span>
          </>
        }
        subtitle="This notice explains what WebM8 collects through this website and how that information is used."
      />
      <section className="py-16 md:py-20">
        <div className="container-page max-w-3xl">
          <p className="text-sm text-muted">Last updated: 6 September 2026</p>
          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-ink">{section.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{section.body}</p>
              </section>
            ))}
            <section>
              <h2 className="text-xl font-bold text-ink">Contact</h2>
              <p className="mt-3 leading-relaxed text-muted">
                For a privacy question or request, email{" "}
                <a
                  href={`mailto:${intakeEmail}`}
                  className="font-semibold text-brand hover:text-brand-hover"
                >
                  {intakeEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
