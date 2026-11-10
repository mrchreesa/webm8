import { instantOffer } from "./instantPricing.ts";
import { contactMethods, industries, type Answers } from "./instantWebsite.ts";
import { instantCrmSubmission, type InstantCrmBilling } from "./instantCrmIntake.ts";
import type { EmailMessage } from "./resend.ts";

export const INSTANT_EMAIL_FROM = "WebM8 <hello@webm8agency.com>";
export const INSTANT_EMAIL_CC = ["mrchreesa@gmail.com", "devpatel0701@gmail.com"];
const confirmationCc = (to: string) => INSTANT_EMAIL_CC.filter(email => email.toLowerCase() !== to.trim().toLowerCase());
export type InstantEmailDetails = { answers: Answers; billing: InstantCrmBilling; crmId: string; submittedAt: Date; portalUrl: string; notificationEmail: string };
export const escapeEmailHtml = (text: string) => text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
const subjectText = (text: string) => text.replace(/[\r\n]+/g, " ").slice(0, 180);
const billingDate = (value: string | Date, us: boolean) => `${new Intl.DateTimeFormat("en-US", { timeZone: us ? "UTC" : "Europe/London", dateStyle: "long", timeStyle: "short" }).format(new Date(value))} (${us ? "UTC" : "UK time"})`;
const paragraph = (text: string) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.6">${escapeEmailHtml(text)}</p>`;
const button = (url: string, label: string) => `<p style="margin:24px 0"><a href="${escapeEmailHtml(url)}" style="display:inline-block;padding:14px 20px;background:#d9ff43;color:#071c34;border-radius:8px;font-weight:bold;text-decoration:none">${escapeEmailHtml(label)}</a></p>`;
function page(title: string, preheader: string, body: string) {
  return `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeEmailHtml(title)}</title></head><body style="margin:0;background:#f8f5ef;color:#102e50;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeEmailHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#fff;border-radius:14px"><tr><td style="padding:28px"><p style="margin:0 0 28px;font-size:24px;font-weight:bold">Web<span style="background:#d9ff43;padding:3px 6px;border-radius:5px">M8</span></p><h1 style="font-size:26px;line-height:1.25;margin:0 0 22px">${escapeEmailHtml(title)}</h1>${body}<p style="margin:28px 0 0;color:#536477;font-size:14px">WebM8 · Instant Websites<br><a href="https://instant.webm8agency.com/" style="color:#102e50">instant.webm8agency.com</a></p></td></tr></table></td></tr></table></body></html>`;
}

export function instantConfirmationEmail(d: InstantEmailDetails): EmailMessage {
  const a = d.answers;
  const offer = instantOffer(d.billing.market);
  const title = "You're signed up. Let's build your website.";
  const greeting = `Hi ${a.name.trim().split(/\s+/)[0] || "there"},`;
  const copy = [greeting, `Thanks for signing up to WebM8 Instant Websites. We've received the website brief for ${a.businessName}.`, "Your website will be ready within one business day. We'll email it to you and send it on WhatsApp so you can review it and request edits.", `Please keep an eye on ${a.email} and WhatsApp on ${a.deliveryPhone}.`, "Unlimited revisions are included until you're 100% satisfied. Reply to this email if you have anything else to add."];
  const plan = d.billing.status === "trialing"
    ? `Your 10-day free trial started when you completed checkout. Your first ${offer.price} monthly payment is scheduled for ${billingDate(d.billing.trialEnd, offer.market === "US")}. Cancel anytime with no cancellation fee.`
    : `Your plan is ${offer.price}/month. Your original 10-day free trial started when you completed checkout. Cancel anytime with no cancellation fee.`;
  return {
    from: INSTANT_EMAIL_FROM, to: a.email, cc: confirmationCc(a.email), replyTo: d.notificationEmail,
    subject: `${d.billing.livemode ? "" : "[TEST] "}You're signed up — your website is next | WebM8`,
    text: [...copy, plan, `Manage or cancel your subscription: ${d.portalUrl}`, "WebM8"].join("\n\n"),
    html: page(title, "Your website will be ready within one business day. Watch your email and WhatsApp.", copy.map(paragraph).join("") + `<h2 style="font-size:18px">Your plan</h2>` + paragraph(plan) + button(d.portalUrl, "Manage your subscription")),
  };
}

export function instantNotificationEmail(d: InstantEmailDetails): EmailMessage {
  const a = d.answers;
  const offer = instantOffer(d.billing.market);
  const brief = instantCrmSubmission(a, d.billing).brief;
  const groups: Array<[string, Array<[string, string]>]> = [
    ["Build brief", [
      ["Business", a.businessName], ["Business type", industries.find(i => i.value === a.industry)?.label || a.industry],
      ["Town / service area", a.area], ["Website to build", "One-page business website; no ecommerce or website payment system"],
      ["Services / treatments / food to feature", a.services],
      ["Customer contact options", a.contacts.map(c => contactMethods.find(m => m.value === c)?.label || c).join(", ")],
      ["Existing website", a.hasWebsite === "yes" ? a.website || "Yes — link not provided" : "No"],
      ["Social, Google Business and reference links", brief.links.join("\n")],
      ["What makes the business stand out", a.difference], ["Colors / branding", a.colours],
      ["Business address", a.address], ["Opening hours", a.hours], ["Menu link", brief.menuUrl], ["Additional notes", a.notes],
    ]],
    ["Website contact details — publish only these", [
      ["Public phone", brief.publicPhone], ["Public WhatsApp", brief.publicWhatsapp], ["Inquiry / booking request email", brief.enquiryEmail],
      ["Booking link", brief.bookingLater ? "Customer will provide the booking link later" : brief.bookingUrl],
    ]],
    ["Customer contact — private delivery details", [["Contact name", a.name], ["Signup email", a.email], ["Delivery WhatsApp", a.deliveryPhone]]],
    ["Signup and billing", [
      ["Received", `${billingDate(d.submittedAt, offer.market === "US")}`], ["Delivery promise", "Website within one business day; email and WhatsApp for review and edits"],
      ["Plan", `${offer.zero} at checkout; 10-day free trial; then ${offer.price}/month. Unlimited revisions until 100% satisfaction. Cancel anytime, no cancellation fee.`],
      ["Subscription status", d.billing.status], ["Trial ends", `${billingDate(d.billing.trialEnd, offer.market === "US")}`],
      ["Order reference", d.billing.orderId], ["CRM record", d.crmId], ["Stripe customer", d.billing.customerId], ["Stripe subscription", d.billing.subscriptionId],
    ]],
  ];
  const intro = "Checkout is confirmed and the completed website brief has been received by the CRM. Build and send the website within one business day.";
  const crmUrl = "https://webm8-crm.vercel.app/leads?data=business";
  const htmlGroups = groups.map(([heading, rows]) => `<h2 style="font-size:19px;margin:28px 0 12px">${escapeEmailHtml(heading)}</h2>${rows.map(([label, value]) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;overflow-wrap:anywhere"><strong>${escapeEmailHtml(label)}</strong><br><span style="white-space:pre-wrap">${escapeEmailHtml(value || "Not provided")}</span></p>`).join("")}`).join("");
  return {
    from: INSTANT_EMAIL_FROM, to: d.notificationEmail, cc: confirmationCc(d.notificationEmail), replyTo: a.email,
    subject: `${d.billing.livemode ? "" : "[TEST] "}New Instant Website signup: ${subjectText(a.businessName)}`,
    text: [intro, ...groups.map(([heading, rows]) => `${heading}\n${rows.map(([label, value]) => `${label}: ${value || "Not provided"}`).join("\n")}`), `Open CRM: ${crmUrl}`].join("\n\n"),
    html: page(`New website: ${a.businessName}`, "Signup confirmed. Full website brief inside; delivery within one business day.", paragraph(intro) + button(crmUrl, "Open WebM8 CRM") + htmlGroups),
  };
}
