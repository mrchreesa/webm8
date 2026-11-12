import Link from "next/link";
export const metadata = { title: "Instant Websites saved progress", robots: { index: false, follow: false } };
export default function InstantPrivacy() {
  return <main className="container-page max-w-3xl py-16"><h1 className="text-3xl font-bold">Your saved progress</h1>
    <div className="mt-6 space-y-5 leading-relaxed">
      <p>The Instant Websites form automatically saves your latest answers after you pause typing or leave a field. This includes incomplete names, contact details and website requirements, even if you never continue to checkout or submit.</p>
      <p>WebM8’s authorized team can view these drafts in its private dashboard to understand unfinished signups. When website measurement is active, the team can see the latest draft alongside the visit that saved it. A draft does not place an order, start a trial or subscribe you to marketing.</p>
      <p>Saved drafts and submitted briefs can include the estimated country of your internet connection. This adds only the country to those records, not your IP address or precise location.</p>
      <p>Drafts are available for 24 hours after the latest save and are removed by scheduled cleanup. Completed submissions follow our normal enquiry and customer record policy. Payment details and uploaded files are not included in drafts.</p>
      <p>For a privacy request, contact <a className="underline" href="mailto:info@webm8agency.com">info@webm8agency.com</a>. Read our <a className="underline" href="https://www.webm8agency.com/privacy/">full privacy notice</a>.</p>
      <Link className="underline" href="/">Return to Instant Websites</Link>
    </div>
  </main>;
}
